
import { pgTable, serial, text, timestamp, boolean, integer, uuid, pgEnum, decimal, varchar } from "drizzle-orm/pg-core";

/**
 * `users` table — stores registered user accounts.
 * password is stored as a bcrypt hash, NEVER plain text.
 */


//Enums


export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "transfer"]);


export const users = pgTable("users", {
   id: uuid("id").primaryKey().defaultRandom(),
    name:      text("name").notNull(),
    email:     text("email").notNull().unique(),   // enforce unique email at DB level
    password:  text("password").notNull(),          // bcrypt hash stored here
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * `refreshTokens` table — stores valid refresh tokens for active sessions.
 * Allows for session revocation (logout) and long-lived sessions.
 */
export const refreshTokens = pgTable("refresh_tokens", {
   id: uuid("id").primaryKey().defaultRandom(),
    userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    token:     text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    revoked:   boolean("revoked").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * wallet table — placeholder for future implementation.
 */
export const wallets = pgTable("wallets", {
    id: uuid("id").primaryKey().defaultRandom(),
    // Link to the user: one user = one wallet
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull()
        .unique(),
    // Use decimal for money to avoid floating point errors
    // precision 12, scale 2 allows up to 9,999,999,999.99
    balance: decimal("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Transactions Table (The Ledger)
export const transactions = pgTable("transactions", {
    // 1. Transaction's own unique ID
    id: uuid("id").primaryKey().defaultRandom(),

    // 2. References must be 'uuid' to match wallets.id
    // We use .notNull() on sender for transfers, but maybe nullable for "deposits"
    senderWalletId: uuid("sender_wallet_id").references(() => wallets.id),
    receiverWalletId: uuid("receiver_wallet_id").references(() => wallets.id),

    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    
    // 3. Enums for logic
    type: transactionTypeEnum("type").notNull(), // 'transfer', 'deposit', 'withdrawal'
    status: transactionStatusEnum("status").default("pending").notNull(),
    
    reference: varchar("reference", { length: 255 }), 
    createdAt: timestamp("created_at").defaultNow().notNull(),
});




// Export a convenience type for a selected user row
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type RefreshTokenSelect = typeof refreshTokens.$inferSelect;
export type RefreshTokenInsert = typeof refreshTokens.$inferInsert;

// Export a convenience type for a selected wallet row
export type WalletInsert = typeof wallets.$inferInsert


// Export Transaction Types
export type TransactionType = typeof transactions.$inferSelect