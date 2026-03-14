import { eq } from "drizzle-orm";
import { users } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";

// ─────────────────────────────────────────────────────────────
// LOCAL TYPES
//
// These are the exact fields we need to insert a new user.
// We keep this lean — no full RegisterUserInput needed here.
// ─────────────────────────────────────────────────────────────
interface NewUserData {
    name:     string;
    email:    string;
    password: string; // already hashed by the service layer before arriving here
}

// DAL response uses a discriminated union — lets callers do proper
// type-safe error handling without throwing exceptions across layers.
type DalSuccess<T> = { success: true; data: T };
type DalError    = { success: false; error: string; code?: string };
type DalResult<T> = DalSuccess<T> | DalError;

// ─────────────────────────────────────────────────────────────
// Registration — inserts a new user row, checks for duplicates
//
// This is the ONLY place that talks to the database for auth.
// The service layer handles business logic; this layer handles
// database operations only.
// ─────────────────────────────────────────────────────────────
export const Registration = async (
    userData: NewUserData
): Promise<DalResult<{ id: string; name: string; email: string }>> => {

    // ── Guard: check if email is already registered ──────────
    // We check before insert to return a clean, actionable error code.
    // The DB unique constraint is a safety net — this check gives the
    // service layer a clear `EMAIL_TAKEN` code to act on.
    let existing;
    try {
        existing = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, userData.email))
            .limit(1);
    } catch (err) {
        console.error("[auth-dal] DB error during email uniqueness check:", err);
        return { success: false, error: "Database error during registration check.", code: "DB_ERROR" };
    }

    if (existing.length > 0) {
        // Return a specific code so the service layer can give a helpful message
        return { success: false, error: "Email already in use.", code: "EMAIL_TAKEN" };
    }

    // ── Insert the new user row ──────────────────────────────
    let inserted;
    try {
        const rows = await db
            .insert(users)
            .values({
                name:     userData.name,
                email:    userData.email,
                password: userData.password, // bcrypt hash — never plain text
            })
            .returning({
                id:    users.id,
                name:  users.name,
                email: users.email,
                // NOTE: we deliberately do NOT return `password` to avoid
                // accidentally leaking it up through the response chain
            });

        inserted = rows[0];
    } catch (err) {
        console.error("[auth-dal] DB error during user insert:", err);
        return { success: false, error: "Failed to create user account.", code: "DB_ERROR" };
    }

    if (!inserted) {
        // INSERT returned no rows — unexpected, but we handle it defensively
        console.error("[auth-dal] Insert succeeded but returned no rows.");
        return { success: false, error: "User creation returned no data.", code: "DB_NO_RESULT" };
    }

    return { success: true, data: inserted };
};