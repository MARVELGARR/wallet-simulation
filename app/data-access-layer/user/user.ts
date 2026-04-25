import { eq } from "drizzle-orm";
import { users } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";

// ─────────────────────────────────────────────────────────────
// LOCAL TYPES
// ─────────────────────────────────────────────────────────────
type DalSuccess<T> = { success: true; data: T };
type DalError    = { success: false; error: string; code?: string };
type DalResult<T> = DalSuccess<T> | DalError;

// ─────────────────────────────────────────────────────────────
// findUserByEmail — used by the login flow to look up a user
//
// Returns the user row (including hashed password) so the
// service layer can verify credentials with bcrypt.
// ─────────────────────────────────────────────────────────────
export const findUserByEmail = async (
    email: string
): Promise<DalResult<{ id: string; name: string; email: string; password: string }>> => {

    let result;
    try {
        result = await db
            .select({
                id:       users.id,
                name:     users.name,
                email:    users.email,
                password: users.password, // needed by bcrypt.compare in the service layer
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
    } catch (err) {
        console.error("[user-dal] DB error during findUserByEmail:", err);
        return { success: false, error: "Database error during user lookup.", code: "DB_ERROR" };
    }

    if (result.length === 0) {
        return { success: false, error: "User not found.", code: "USER_NOT_FOUND" };
    }

    return { success: true, data: result[0] };
};

// ─────────────────────────────────────────────────────────────
// findUserById — used to fetch profile or for internal verification
// ─────────────────────────────────────────────────────────────
export const findUserById = async (
    userId: string
): Promise<DalResult<{ id: string; name: string; email: string }>> => {

    let result;
    try {
        result = await db
            .select({
                id:       users.id,
                name:     users.name,
                email:    users.email,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
    } catch (err) {
        console.error("[user-dal] DB error during findUserById:", err);
        return { success: false, error: "Database error during user lookup.", code: "DB_ERROR" };
    }

    if (result.length === 0) {
        return { success: false, error: "User not found.", code: "USER_NOT_FOUND" };
    }

    return { success: true, data: result[0] };
};

// ─────────────────────────────────────────────────────────────
// getAllUsers — list all users in the system (useful for admins or simulation)
// ─────────────────────────────────────────────────────────────
export const getAllUsers = async (): Promise<DalResult<{ id: string; name: string; email: string; createdAt: Date }[]>> => {
    try {
        const result = await db
            .select({
                id:       users.id,
                name:     users.name,
                email:    users.email,
                createdAt: users.createdAt,
                
            })
            .from(users);

        return { success: true, data: result };
    } catch (err) {
        console.error("[user-dal] DB error during getAllUsers:", err);
        return { success: false, error: "Database error fetching users.", code: "DB_ERROR" };
    }
};

// ─────────────────────────────────────────────────────────────
// deleteUserById — removes a user (cascades to wallets & refresh_tokens)
// ─────────────────────────────────────────────────────────────
export const deleteUserById = async (
    userId: string
): Promise<DalResult<{ id: string; name: string; email: string }>> => {
    try {
        const result = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
            });

        if (result.length === 0) {
            return { success: false, error: "User not found.", code: "USER_NOT_FOUND" };
        }

        return { success: true, data: result[0] };
    } catch (err) {
        console.error("[user-dal] DB error during deleteUserById:", err);
        return { success: false, error: "Database error deleting user.", code: "DB_ERROR" };
    }
};