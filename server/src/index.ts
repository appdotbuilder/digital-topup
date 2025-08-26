import { initTRPC, TRPCError } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  registerInputSchema,
  loginInputSchema,
  getProductsInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  createTransactionInputSchema,
  updateTransactionStatusInputSchema,
  getUserTransactionsInputSchema
} from './schema';

// Import handlers
import { register } from './handlers/register';
import { login } from './handlers/login';
import { getCurrentUser } from './handlers/get_current_user';
import { getProducts } from './handlers/get_products';
import { getProductById } from './handlers/get_product_by_id';
import { createProduct } from './handlers/create_product';
import { updateProduct } from './handlers/update_product';
import { createTransaction } from './handlers/create_transaction';
import { getUserTransactions } from './handlers/get_user_transactions';
import { getAllTransactions } from './handlers/get_all_transactions';
import { updateTransactionStatus } from './handlers/update_transaction_status';
import { getTransactionById } from './handlers/get_transaction_by_id';

// Create TRPC instance
const t = initTRPC.context<{
  user?: { id: number; email: string; is_admin: boolean };
}>().create({
  transformer: superjson,
});

// Middleware for authentication
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware for admin authentication
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  if (!ctx.user.is_admin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin privileges required',
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Procedures
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(isAuthenticated);
const adminProcedure = t.procedure.use(isAdmin);
const router = t.router;

// Define the app router
const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    register: publicProcedure
      .input(registerInputSchema)
      .mutation(({ input }) => register(input)),
    
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => login(input)),
    
    me: protectedProcedure
      .query(({ ctx }) => getCurrentUser(ctx.user.id)),
  }),

  // Product routes
  products: router({
    list: publicProcedure
      .input(getProductsInputSchema.optional())
      .query(({ input }) => getProducts(input)),
    
    byId: publicProcedure
      .input(z.number())
      .query(({ input }) => getProductById(input)),
    
    create: adminProcedure
      .input(createProductInputSchema)
      .mutation(({ input }) => createProduct(input)),
    
    update: adminProcedure
      .input(updateProductInputSchema)
      .mutation(({ input }) => updateProduct(input)),
  }),

  // Transaction routes
  transactions: router({
    create: protectedProcedure
      .input(createTransactionInputSchema)
      .mutation(({ ctx, input }) => createTransaction(ctx.user.id, input)),
    
    myTransactions: protectedProcedure
      .input(getUserTransactionsInputSchema.optional())
      .query(({ ctx, input }) => getUserTransactions(ctx.user.id, input)),
    
    byId: protectedProcedure
      .input(z.number())
      .query(({ ctx, input }) => getTransactionById(ctx.user.id, input, ctx.user.is_admin)),
    
    updateStatus: adminProcedure
      .input(updateTransactionStatusInputSchema)
      .mutation(({ input }) => updateTransactionStatus(input)),
  }),

  // Admin routes
  admin: router({
    allTransactions: adminProcedure
      .input(getUserTransactionsInputSchema.optional())
      .query(({ input }) => getAllTransactions(input)),
  }),
});

export type AppRouter = typeof appRouter;

// Context creation function
async function createContext({ req, res }: { req: any; res: any }) {
  // This is a placeholder! Real implementation should:
  // 1. Extract JWT token from Authorization header
  // 2. Verify and decode the token
  // 3. Fetch user data from database
  // 4. Return user context or empty object
  
  // Mock user context for development
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    // In real implementation, decode JWT and fetch user
    return {
      user: {
        id: 1,
        email: 'user@example.com',
        is_admin: false
      }
    };
  }
  
  return {};
}

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext,
  });
  
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
  console.log(`Available routes:`);
  console.log(`- POST /auth.register - User registration`);
  console.log(`- POST /auth.login - User login`);
  console.log(`- GET /auth.me - Get current user`);
  console.log(`- GET /products.list - Get products`);
  console.log(`- GET /products.byId - Get product by ID`);
  console.log(`- POST /products.create - Create product (admin)`);
  console.log(`- POST /products.update - Update product (admin)`);
  console.log(`- POST /transactions.create - Create transaction`);
  console.log(`- GET /transactions.myTransactions - Get user transactions`);
  console.log(`- GET /transactions.byId - Get transaction by ID`);
  console.log(`- POST /transactions.updateStatus - Update transaction status (admin)`);
  console.log(`- GET /admin.allTransactions - Get all transactions (admin)`);
}

start();