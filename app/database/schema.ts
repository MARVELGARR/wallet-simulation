
import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

/**
 * `users` table — stores registered user accounts.
 * password is stored as a bcrypt hash, NEVER plain text.
 */
export const users = pgTable("users", {
    id:        serial("id").primaryKey(),
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
    id:        serial("id").primaryKey(),
    userId:    integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    token:     text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    revoked:   boolean("revoked").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * wallet table — placeholder for future implementation.
 */
export const wallet = pgTable("wallet", {
    id:     serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id), // FK → users
});

// Export a convenience type for a selected user row
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type RefreshTokenSelect = typeof refreshTokens.$inferSelect;
export type RefreshTokenInsert = typeof refreshTokens.$inferInsert;