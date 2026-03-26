



import { Request, Response } from "express";
import { router } from "../../settings/router.config.js";
import { TransactionType, wallets, transactions } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";
import { eq } from "drizzle-orm";

import { GetWallet } from "../../data-access-layer/wallet/wallet.db.js";
import { CompleteDeposit } from "../../services/payment-service/transaction.serviece.deposit.js";

router.post("/deposit_event", async (req: Request, res: Response) => {
    const { transactionId, walletId, amount } = req.body;

    try {
        // 1. Fetch current wallet state to get current balance
        const wallet = await GetWallet(walletId)
        if (!wallet) throw new Error("Wallet not found during event processing");

        // 2. Perform the actual deposit (balance update)
        const result = await CompleteDeposit({
            ammount: amount,
            walletId: walletId,
            walletBalance: wallet.balance,
            currency: wallet.currency
        });

        if (!result.success) throw new Error(result.error);

        // 3. Mark transaction as completed
        await db.update(transactions)
            .set({ status: "completed" })
            .where(eq(transactions.id, transactionId));

        return res.status(200).json({ success: true, message: "Deposit completed" });

    } catch (error) {
        console.error("[Deposit_Event_Handler] Error:", error);
        
        // Mark transaction as failed
        await db.update(transactions)
            .set({ status: "failed" })
            .where(eq(transactions.id, transactionId))
            .catch(() => {}); // ignore error here if transactionId was invalid

        return res.status(500).json({ success: false, error: "Event processing failed" });
    }
});