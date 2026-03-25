
import { Request, Response } from "express";
import { router } from "../../settings/router.config.js";
import { transactions } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";
import { eq } from "drizzle-orm";
import { CompleteTransfer } from "../../services/payment-service/transaction.transer.js";

router.post("/transfer_event", async (req: Request, res: Response) => {
    const { transactionId, senderWalletId, receiverWalletId, amount } = req.body;

    try {
        // 1. Perform the actual transfer logic via the service
        const transferResult = await CompleteTransfer({
            senderWalletId,
            recieverWalletId: receiverWalletId,
            ammount: amount,
            currency: "USD" // Default if not specified in message
        });

        if (!transferResult.success) {
            throw new Error(transferResult.error);
        }

        // 2. Mark the transactional record as completed
        await db.update(transactions)
            .set({ status: "completed" })
            .where(eq(transactions.id, transactionId));

        return res.status(200).json({ success: true, message: "Transfer processed successfully" });

    } catch (error: any) {
        console.error("[Transfer_Event_Handler] Error:", error);
        
        // 3. Mark the transaction record as failed
        await db.update(transactions)
            .set({ status: "failed" })
            .where(eq(transactions.id, transactionId))
            .catch(() => {});

        return res.status(500).json({ success: false, error: "Event processing failed" });
    }
});
