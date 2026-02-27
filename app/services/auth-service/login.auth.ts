import z from "zod";
import { comparePassword } from "./bcrypt.util.js";
import { findUserByEmail } from "../../data-access-layer/user/user.js";
import { signAccessToken, signRefreshToken } from "./jwt.util.js";
import { saveRefreshToken } from "../../data-access-layer/auth/refresh-token.js";
import { publish } from "../../events/publisher.js";




export const loginSchema = z.object({

    email: z
        .string({ error: "Email is required" })
        .email({ message: "Invalid email format" })
        .toLowerCase(), // normalise to lowercase before storing

    password: z
        .string({ error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(72, { message: "Password cannot exceed 72 characters (bcrypt limit)" }),
});

type LoginProp = z.infer<typeof loginSchema>


export const login = async (rawInput: LoginProp) => {

    const parsed = loginSchema.safeParse(rawInput)

    if(parsed.error){
        return {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors, // field-level errors for the frontend
        };
    }

    const { email, password } = parsed.data
    const user = await  findUserByEmail(email)
    if(!user.success){
        return {
            success: false,
            error: "User not found",
        }
    }

    const isPassword = await comparePassword(password, user.data.password)

    if(isPassword){
        // Sign an ACCESS token (short-lived)
        const accessToken = signAccessToken({
            sub: user.data.id,
            email: user.data.email,
            name: user.data.name,
        });

        // Sign a REFRESH token (long-lived)
        const refreshToken = signRefreshToken({
            sub: user.data.id,
            email: user.data.email,
            name: user.data.name,
        });

        // Persist refresh token in DB
        try {
            await saveRefreshToken({
                userId: user.data.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
        } catch (err) {
            console.error("[login.service] Failed to save refresh token:", err);
            return { success: false, error: "Authentication failed due to session error." };
        }

        // ── Publish domain event ────────────────────────────────
        // Fire-and-forget: consumers handle audit log, last-seen, etc.
        publish("user.logged_in", {
            userId:     String(user.data.id),
            email:      user.data.email,
            loggedInAt: new Date().toISOString(),
        });

        return {
            success: true,
            data: {
                user: {
                    id: user.data.id,
                    name: user.data.name,
                    email: user.data.email,
                },
                accessToken,
                refreshToken
            }
        }
    }

    return {
        success: false,
        error: "Invalid credentials",
    }

}