


import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { RegisterUser } from "../services/auth-service/register.auth.js";
import { login } from "../services/auth-service/login.auth.js";

// ─────────────────────────────────────────────────────────────
// USER CONTROLLER
//
// Thin layer between HTTP and the service layer.
// The controller's only responsibilities are:
//   1. Extract data from the HTTP request
//   2. Call the appropriate service function
//   3. Map the service result to an HTTP response (status + JSON)
//
// No business logic or DB access belongs here.
// ─────────────────────────────────────────────────────────────


// ── POST /api/v1/auth/register ───────────────────────────────
// Registers a new user account.
//
// Expected request body (JSON):
//   { "name": "...", "email": "...", "password": "..." }
//
// Responses:
//   201 Created  → { success: true, data: { user, token } }
//   400 Bad Req. → { success: false, error: "...", details?: {} }
//   409 Conflict → { success: false, error: "email already exists" }
//   500 Internal → { success: false, error: "..." }
// ─────────────────────────────────────────────────────────────
router.post(
    "/auth/register",
    async (req: Request, res: Response): Promise<void> => {

        try {
            // Pass the raw request body directly to the service.
            // The service validates it with Zod — the controller trusts nothing.
            const result = await RegisterUser(req.body);

            if (!result.success) {
                // Decide the HTTP status based on the error message/type
                // that came back from the service layer.
                const isEmailTaken = result.error === "An account with this email already exists.";
                const isValidationError = result.error === "Validation failed";

                const statusCode = isEmailTaken
                    ? 409  // Conflict
                    : isValidationError
                        ? 400  // Bad Request
                        : 500; // Internal Server Error (unexpected)

                res.status(statusCode).json({
                    success: false,
                    error:   result.error,
                    // `details` only present for validation errors, not for internal ones
                    ...(result.details ? { details: result.details } : {}),
                });
                return;
            }

            // 201 Created — user registered successfully
            res.status(201).json({
                success: true,
                data:    result.data, // { user: { id, name, email }, token }
            });

        } catch (err) {
            // Last-resort catch — should never reach here if service layer
            // is handling its own errors, but we never leave a request hanging.
            console.error("[user.controller] Unhandled error in /auth/register:", err);
            res.status(500).json({
                success: false,
                error: "An unexpected error occurred. Please try again later.",
            });
        }
    }
);

router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await login(req.body)

        if(!result.success){
            const isValidationError = result.error === "Validation failed";
            const isUserNotFound = result.error === "User not found";
            const isInvalidCredentials = result.error === "Invalid credentials";
            const isInternalError = result.error === "An unexpected error occurred. Please try again later.";

            const statusCode = isValidationError
                ? 400  // Bad Request
                : isUserNotFound
                    ? 404  // Not Found
                    : isInvalidCredentials
                        ? 401  // Unauthorized
                        : isInternalError
                            ? 500  // Internal Server Error (unexpected)
                            : 500; // Internal Server Error (unexpected)

            res.status(statusCode).json({
                success: false,
                error:   result.error,
                // `details` only present for validation errors, not for internal ones
                ...(result.details ? { details: result.details } : {}),
            });
            return;
        }

        res.status(200).json({
            success: true,
            data:    result.data, // { user: { id, name, email }, token }
        });
    } catch (error) {
        console.error("[user.controller] Unhandled error in /auth/login:", error);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred. Please try again later.",
        });
    }
})


// ─────────────────────────────────────────────────────────────
// EXPORT ROUTER
// The server/index.ts mounts this router at `/api/v1`
// so the full path becomes: POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────
export { router as userRouter };
