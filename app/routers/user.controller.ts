import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { fetchAllUsers, fetchUserById } from "../services/user-service/user.get.js";
import { requireAuth } from "../services/auth-service/auth.middleware.js";

/**
 * GET /users
 * Retrieve all registered users.
 * Protected by authentication middleware.
 */
router.get("/users", async (req: Request, res: Response) => {
    try {
        const users = await fetchAllUsers();
        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error: any) {
        console.error("[user-controller] Error fetching users:", error);
        return res.status(500).json({
            success: false,
            error: "Something went wrong while fetching users. Please try again later.",
        });
    }
});

/**
 * GET /users/:id
 * Retrieve a single user by their ID.
 * Protected by authentication middleware.
 */
router.get("/users/:id", requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "User ID is required.",
        });
    }

    try {
        const user = await fetchUserById(id as string);
        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error("[user-controller] Error fetching user by ID:", error);
        const statusCode = error.message === "User not found." ? 404 : 500;
        return res.status(statusCode).json({
            success: false,
            error: error.message || "Internal server error.",
        });
    }
});

export { router as userRouter };
