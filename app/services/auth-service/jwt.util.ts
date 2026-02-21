import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────────────────────
// JWT CONFIG
// Centralised here so every auth-related file shares the same
// settings without duplicating them.
// ─────────────────────────────────────────────────────────────
const JWT_EXPIRES_IN = "7d";
const JWT_ISSUER = "tobedeleted-api";

// Read secret once at module load so a missing secret crashes
// the server immediately rather than on the first request.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error(
        "[jwt.util] JWT_SECRET is not defined in environment variables. Server cannot start."
    );
}

// Payload shape for tokens issued by this API.
export interface JwtPayload {
    sub: number;   // user ID
    email: string;
    name: string;
}

/**
 * Signs a JWT for the given user payload.
 *
 * @param payload - Non-sensitive user fields to embed in the token.
 * @returns A signed JWT string.
 * @throws If signing fails (e.g. invalid secret format).
 */
export const signToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
    });
};

/**
 * Verifies and decodes a JWT string.
 * Throws a `JsonWebTokenError` or `TokenExpiredError` if invalid.
 *
 * @param token - The raw JWT string from the request.
 * @returns The decoded payload.
 */
export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET as string, {
        issuer: JWT_ISSUER,
    }) as unknown as JwtPayload;
};
