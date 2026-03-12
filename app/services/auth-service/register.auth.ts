import z from "zod";
import { Registration } from "../../data-access-layer/auth/auth.js";
import { hashPassword } from "./bcrypt.util.js";
import { signAccessToken, signRefreshToken } from "./jwt.util.js";
import { saveRefreshToken } from "../../data-access-layer/auth/refresh-token.js";
import { client } from "../../settings/upstach.qstach.config.js";




// ─────────────────────────────────────────────────────────────
// ZOD SCHEMA — Input validation
// This schema is the single source of truth for what a valid
// registration request looks like.
// ─────────────────────────────────────────────────────────────
export const registerUserSchema = z.object({
    name: z
        .string({ error: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters" })
        .max(5, { message: "Name must be at most 5 characters" })
        .trim(),

    email: z
        .string({ error: "Email is required" })
        .email({ message: "Invalid email format" })
        .toLowerCase(), // normalise to lowercase before storing

    password: z
        .string({ error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(72, { message: "Password cannot exceed 72 characters (bcrypt limit)" }),
});

// Infer the TypeScript type directly from the schema — keeps them in sync.
export type RegisterUserInput = z.infer<typeof registerUserSchema>;



// ─────────────────────────────────────────────────────────────
// SERVICE RESPONSE TYPES
// Using a discriminated union so callers get proper type narrowing:
//   if (result.success) { result.data ... }  ← TypeScript knows data exists
//   if (!result.success) { result.error ... } ← TypeScript knows error exists
// ─────────────────────────────────────────────────────────────

type ServiceSuccess<T> = { success: true; data: T };
type ServiceError = { success: false; error: string; details?: unknown };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

// Shape of the data we return to the controller on success
interface RegisterSuccessPayload {
    user: {
        id: string;
        name: string;
        email: string;
    };
    accessToken: string;
    refreshToken: string;
}

// ─────────────────────────────────────────────────────────────
// REGISTER USER — main service function
//
// Responsibilities:
//   1. Validate input with Zod
//   2. Hash the password with bcrypt
//   3. Persist the user via the data-access layer
//   4. Sign and return a JWT
// ─────────────────────────────────────────────────────────────
export const RegisterUser = async (
    rawInput: unknown  // <-- accept `unknown` so this function is safe to call from anywhere
): Promise<ServiceResult<RegisterSuccessPayload>> => {

    // ── Step 1: Validate ────────────────────────────────────
    const parsed = registerUserSchema.safeParse(rawInput);
    // console.log(JSON.stringify(parsed))
    
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors, // field-level errors for the frontend
        };
    }

    const { name, email, password } = parsed.data;

    // ── Step 2: Hash the password ───────────────────────────
    // Never store plain-text passwords. bcrypt adds a random salt automatically.
    let hashedPassword: string;
    try {
        hashedPassword = await hashPassword(password);
    } catch (err) {
        // This should be very rare, but we guard it just in case
        console.error("[auth-service] bcrypt hashing failed:", err);
        return { success: false, error: "Could not process password. Please try again." };
    }

    // ── Step 3: Persist user via the data-access layer ──────
    const dbResult = await Registration({ name, email, password: hashedPassword });


    if (!dbResult.success) {
        // dbResult carries a specific error code we can react to
        if (dbResult.code === "EMAIL_TAKEN") {
            return { success: false, error: "An account with this email already exists." };
        }
        return { success: false, error: "Registration failed. Please try again later." };
    }

    const newUser = dbResult.data;

    // await client.publish({
    //     urlGroup: "user_onboarding",
    //     body: {
        
    //     }
    // })

    // ── Step 4: Sign tokens ───────────────────────────────────
    // We sign both a short-lived access token and a long-lived refresh token.
    let accessToken: string;
    let refreshToken: string;
    try {
        accessToken = signAccessToken({
            sub: newUser.id,
            email: newUser.email,
            name: newUser.name,
        });

        refreshToken = signRefreshToken({
            sub: newUser.id,
            email: newUser.email,
            name: newUser.name,
        });

        // Persist refresh token in DB
        await saveRefreshToken({
            userId: newUser.id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

    } catch (err) {
        console.error("[auth-service] Token generation failed:", err);
        return { success: false, error: "Could not generate session token. Please try again." };
    }

    // ── Step 5: Return success with sanitised user data ──────
    return {
        success: true,
        data: {
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
            accessToken,
            refreshToken
        },
    };
};