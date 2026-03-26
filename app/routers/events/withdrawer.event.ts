import { Request, Response } from "express";
import { router } from "../../settings/router.config.js";
import { Withdraw_Money_service } from "../../services/payment-service/transaction.service.withdrawer.js";
import { db } from "../../settings/db.config.js";
import { transactions } from "../../database/schema.js";
import { eq } from "drizzle-orm";




router.post("/withdraw_event", async (req: Request, res: Response) => {
    const { transactionId, userId} = req.body;

    try{
        const withdrawerRsult = await Withdraw_Money_service(transactionId)

        if(!withdrawerRsult.success){
            throw new Error(withdrawerRsult.error);
        }

        const updateTransaction = await db.update(transactions)
        .set({
            status: "completed",
        }).where(eq(transactions.id, transactionId))
        return res.status(200).json({ success: true, message: "withdrawer processed successfully" });
    }
    catch(error){
         console.error("[Withdrawer_Event_Handler] Error:", error);
        
        // 3. Mark the transaction record as failed
        await db.update(transactions)
            .set({ status: "failed" })
            .where(eq(transactions.id, transactionId))
            .catch(() => {});

        return res.status(500).json({ success: false, error: "Event processing failed" });
    }

});