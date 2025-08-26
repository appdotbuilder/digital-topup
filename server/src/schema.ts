import { z } from 'zod';

// User schema with authentication
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().nullable(),
  is_admin: z.boolean(),
  referral_code: z.string(), // User's own referral code
  referred_by_code: z.string().nullable(), // Code used when they registered
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Product categories enum
export const productCategorySchema = z.enum([
  'PULSA',
  'DATA_PACKAGE',
  'PLN_TOKEN',
  'GAME_VOUCHER',
  'POSTPAID'
]);

export type ProductCategory = z.infer<typeof productCategorySchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: productCategorySchema,
  provider: z.string(), // Telkomsel, XL, Indosat, etc.
  denomination: z.number(), // Amount/value of the product
  price: z.number(), // Selling price
  cost_price: z.number(), // Cost from provider (for admin)
  is_active: z.boolean(),
  sort_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Transaction status enum
export const transactionStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'CANCELLED'
]);

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  product_id: z.number(),
  customer_identifier: z.string(), // Phone number or customer ID
  amount: z.number(),
  status: transactionStatusSchema,
  provider_transaction_id: z.string().nullable(), // External transaction ID
  provider_response: z.string().nullable(), // JSON response from provider
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

// Input schemas for authentication
export const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().nullable().optional(),
  referred_by_code: z.string().nullable().optional()
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Input schemas for products
export const getProductsInputSchema = z.object({
  category: productCategorySchema.optional(),
  provider: z.string().optional(),
  is_active: z.boolean().optional()
});

export type GetProductsInput = z.infer<typeof getProductsInputSchema>;

export const createProductInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  category: productCategorySchema,
  provider: z.string().min(1),
  denomination: z.number().positive(),
  price: z.number().positive(),
  cost_price: z.number().positive(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: productCategorySchema.optional(),
  provider: z.string().min(1).optional(),
  denomination: z.number().positive().optional(),
  price: z.number().positive().optional(),
  cost_price: z.number().positive().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Input schemas for transactions
export const createTransactionInputSchema = z.object({
  product_id: z.number(),
  customer_identifier: z.string().min(1), // Phone number or customer ID
  notes: z.string().nullable().optional()
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

export const updateTransactionStatusInputSchema = z.object({
  id: z.number(),
  status: transactionStatusSchema,
  provider_transaction_id: z.string().nullable().optional(),
  provider_response: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusInputSchema>;

export const getUserTransactionsInputSchema = z.object({
  user_id: z.number().optional(), // For admin to get any user's transactions
  status: transactionStatusSchema.optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetUserTransactionsInput = z.infer<typeof getUserTransactionsInputSchema>;

// Authentication response schema
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string() // JWT token
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Transaction with relations
export const transactionWithDetailsSchema = transactionSchema.extend({
  product: productSchema,
  user: userSchema.pick({
    id: true,
    email: true,
    first_name: true,
    last_name: true
  })
});

export type TransactionWithDetails = z.infer<typeof transactionWithDetailsSchema>;