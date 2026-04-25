import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { GetAllWalletsService } from "../services/wallet-service/get-wallets.js";

/**
 * GET /wallets
 * Retrieve all wallets.
 */
router.get("/wallets", async (req: Request, res: Response) => {
    try {
        const result = await GetAllWalletsService();

        if (result.success) {
            return res.status(200).json({
                success: true,
                data: result.data,
            });
        }

        return res.status(500).json({
            success: false,
            error: result.error,
        });
    } catch (error) {
        console.error("[wallet-controller] Error:", error);
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred.",
        });
    }
});

export { router as walletRouter };
