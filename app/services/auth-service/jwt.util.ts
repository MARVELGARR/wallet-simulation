import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

// ─────────────────────────────────────────────────────────────
// JWT CONFIG
// ─────────────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m"; // Short-lived
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d"; // Long-lived
const JWT_ISSUER = process.env.JWT_ISSUER || "wallet-api";

// Use JWT_SECRET_PROD if available in production, otherwise fallback to JWT_SECRET
const JWT_SECRET = (isProduction ? process.env.JWT_SECRET_PROD : null) || process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "[jwt.util] JWT_SECRET (or JWT_SECRET_PROD) is not defined in environment variables. Server cannot start."
    );
}

// Payload shape for tokens issued by this API.
export interface JwtPayload {
    sub: string;   // user ID
    email: string;
    name: string;
}

/**
 * Signs an ACCESS token (short-lived).
 */
export const signAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
        issuer: JWT_ISSUER,
    } as any);
};

/**
 * Signs a REFRESH token (long-lived).
 */
export const signRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET as string, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
        issuer: JWT_ISSUER,
    } as any);
};

/**
 * Verifies and decodes a JWT string (works for both access and refresh).
 */
export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET as string, {
        issuer: JWT_ISSUER,
    }) as unknown as JwtPayload;
};

// Deprecated: keeping signToken for backward compatibility during transition
// but it now behaves like signAccessToken.
/** @deprecated Use signAccessToken or signRefreshToken instead */
export const signToken = signAccessToken;
