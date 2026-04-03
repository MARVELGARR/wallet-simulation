import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "./jwt.util.js";

// ─────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────

/**
 * Custom request interface to include the authenticated user payload.
 */
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

/**
 * Middleware that requires a valid JWT in the Authorization header.
 * Expected format: Authorization: Bearer <token>
 */
export const requireAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error: "Authentication required. Please provide a valid token.",
        });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyToken(token);
        // Attach the decoded user data to the request object
        req.user = payload;
        next();
    } catch (err) {
        console.error("[auth.middleware] Token verification failed:", err);
        res.status(401).json({
            success: false,
            error: "Invalid or expired session. Please log in again.",
        });
        return;
    }
};
