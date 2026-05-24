import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { GetAllWalletsService } from "../services/wallet-service/get-wallets.js";
import { db } from "../settings/db.config.js";
import { wallets } from "../database/schema.js";
import { eq } from "drizzle-orm";
import { walletLogger } from "../settings/logger.js";

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
        walletLogger.error({ err: error }, "Error in GET /wallets");
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred.",
        });
    }
});

router.get("/wallets/user/:userId", async (req: Request, res: Response) => {
    try {
        const [wallet] = await db.select()
            .from(wallets)
            .where(eq(wallets.userId, req.params.userId as string));

        if (!wallet) return res.status(404).json({ message: "Wallet not found for this user" });

        return res.json(wallet);
    } catch (error) {
        walletLogger.error({ err: error }, "Error in GET /wallets/user/:userId");
        return res.status(500).json({ message: "Error fetching wallet status" });
    }
});

export { router as walletRouter };
