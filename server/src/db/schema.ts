import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean, 
  pgEnum,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const productCategoryEnum = pgEnum('product_category', [
  'PULSA',
  'DATA_PACKAGE', 
  'PLN_TOKEN',
  'GAME_VOUCHER',
  'POSTPAID'
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'CANCELLED'
]);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  password_hash: text('password_hash').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone_number: text('phone_number'),
  is_admin: boolean('is_admin').notNull().default(false),
  referral_code: text('referral_code').notNull(), // User's own referral code
  referred_by_code: text('referred_by_code'), // Code used when they registered
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  referralCodeIdx: uniqueIndex('users_referral_code_idx').on(table.referral_code),
  referredByCodeIdx: index('users_referred_by_code_idx').on(table.referred_by_code)
}));

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: productCategoryEnum('category').notNull(),
  provider: text('provider').notNull(), // Telkomsel, XL, Indosat, etc.
  denomination: numeric('denomination', { precision: 12, scale: 2 }).notNull(), // Amount/value
  price: numeric('price', { precision: 12, scale: 2 }).notNull(), // Selling price
  cost_price: numeric('cost_price', { precision: 12, scale: 2 }).notNull(), // Cost from provider
  is_active: boolean('is_active').notNull().default(true),
  sort_order: integer('sort_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  categoryIdx: index('products_category_idx').on(table.category),
  providerIdx: index('products_provider_idx').on(table.provider),
  isActiveIdx: index('products_is_active_idx').on(table.is_active),
  sortOrderIdx: index('products_sort_order_idx').on(table.sort_order)
}));

// Transactions table
export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  product_id: integer('product_id').notNull(),
  customer_identifier: text('customer_identifier').notNull(), // Phone number or customer ID
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: transactionStatusEnum('status').notNull().default('PENDING'),
  provider_transaction_id: text('provider_transaction_id'), // External transaction ID
  provider_response: text('provider_response'), // JSON response from provider
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('transactions_user_id_idx').on(table.user_id),
  productIdIdx: index('transactions_product_id_idx').on(table.product_id),
  statusIdx: index('transactions_status_idx').on(table.status),
  createdAtIdx: index('transactions_created_at_idx').on(table.created_at),
  providerTransactionIdIdx: index('transactions_provider_transaction_id_idx').on(table.provider_transaction_id)
}));

// Relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  transactions: many(transactionsTable),
  referredBy: one(usersTable, {
    fields: [usersTable.referred_by_code],
    references: [usersTable.referral_code]
  }),
  referrals: many(usersTable, {
    relationName: "user_referrals"
  })
}));

export const productsRelations = relations(productsTable, ({ many }) => ({
  transactions: many(transactionsTable)
}));

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [transactionsTable.user_id],
    references: [usersTable.id]
  }),
  product: one(productsTable, {
    fields: [transactionsTable.product_id],
    references: [productsTable.id]
  })
}));

// TypeScript types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  products: productsTable,
  transactions: transactionsTable
};