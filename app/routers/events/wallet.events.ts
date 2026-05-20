
import { Request, Response } from "express";
import { eventRouter } from "../../settings/qstash.router.js";
import { Create_Wallet_Services } from "../../services/wallet-service/create-wallet.js";
import { rawBodyParser, verifyQStash } from "../../settings/qstash.middleware.js";




eventRouter.post('/create-wallet-events', rawBodyParser, verifyQStash, async (req: Request, res: Response) => {
    try {
        // 1. Basic Validation (In industry, use Zod here)
        const { id, } = req.body;
        if (!id) return res.status(400).json({ success: false, error: "User ID is required" });

        // 2. Call Service
        const result = await Create_Wallet_Services({id});

        // 3. Handle Service Result
        if (result.success) {
            return res.status(201).json({
                success: true,
                data: result.data,
            });
        }

        // 4. Handle Service Failure (e.g., DB unique constraint)
        return res.status(400).json({
            success: false,
            error: result.error,
        });

    } catch (criticalError) {
        // This catches things the service didn't catch (like network loss)
        return res.status(500).json({
            success: false,
            error: "An unexpected error occurred."
        });
    }
});


export {
    eventRouter as trial
}