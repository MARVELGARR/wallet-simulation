



import { Request, Response } from "express";
import { router } from "../../settings/router.config.js";
import { wallets, transactions } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";
import { eq } from "drizzle-orm";
import { CompleteDeposit } from "../../services/payment-service/transaction.serviece.deposit.js";
import { NotFoundError } from "../../settings/errorPerser.js";
import { rawBodyParser, verifyQStash } from "../../settings/qstash.middleware.js";

router.post("/deposit_event", rawBodyParser, verifyQStash, async (req: Request, res: Response) => {
    const { transactionId} = req.body;

    try {

       return await db.transaction( async (tcx)=>{
            // 1. Fetch the transaction to verify if it exist and also to get the details for processing

            const [The_transaction] = await tcx.select()
            .from(transactions).where(eq(transactions.id, transactionId))
            .for("update")
            if (!The_transaction) throw new NotFoundError("Transaction not found during event processing");
            if (!The_transaction.receiverWalletId) throw new NotFoundError(" Tansaction is missing the wallet");

            // find the wallet to be debited
            const [wallet] = await tcx.select()
            .from(wallets).where(eq(wallets.id, The_transaction.receiverWalletId))


            // 2. Perform the actual deposit (balance update)
            const result = await CompleteDeposit({
                amount: The_transaction.amount,
                walletId: wallet.id,
                walletBalance: wallet.balance,
                currency: wallet.currency
            });
    
            if (!result.success) throw new Error(result.error);

            // 3. Mark transaction as completed
            await tcx.update(transactions)
                .set({ status: "completed" })
                .where(eq(transactions.id, transactionId));
                
                res.status(200).json({ success: true, message: "Deposit completed" });
        })


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