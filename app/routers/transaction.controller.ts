import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { transactions, TransactionType, WalletInsert, wallets, WalletType } from "../database/schema.js";
import { client } from "../settings/upstach.qstach.config.js";
import { db } from "../settings/db.config.js";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../settings/errorPerser.js";




router.post("/deposit-transaction", async (req: Request, res: Response) => {
    const { ammount, walletId, userId } = req.body;

    if (!ammount) return res.status(400).json({ message: "amount to be sent is required" })
    if (!walletId) return res.status(400).json({ message: "walletId is required!" })

    try {
        await db.transaction(async (tcx) => {
            // 1. Check if wallet exists and lock it
            const [wallet] = await tcx.select()
                .from(wallets)
                .where(eq(wallets.id, walletId))
                .for("update")

            if (!wallet) {
                throw new NotFoundError("wallet not found")
            }

            // 2. Create pending transaction record
            const result = await tcx.insert(transactions).values({
                type: "deposit",
                amount: ammount,
                status: "pending",
                receiverWalletId: walletId
            }).returning()

            const newTransaction = result[0]

            // 3. Publish to QStash to process the deposit asynchronously
            await client.publishJSON({
                urlGroup: "transactions", 
                body: {
                    transactionId: newTransaction.id,
                    userId: userId,
                    amount: newTransaction.amount,
                    walletId: walletId
                }
            })

            return res.status(202).json({ 
                message: "Processing", 
                txId: newTransaction.id 
            });
        });

    }
    catch (error) {
        console.error("[Deposit_Controller] Error:", error)
        const parsedError = error instanceof NotFoundError ? error : { statusCode: 500, message: "transaction failed, something went wrong" }
        return res.status((parsedError as any).statusCode || 500).json({ 
            message: (parsedError as any).message 
        })
    }
})

router.post("/transfer-money-event", async (req: Request, res: Response) => {
    const {
        senderWalletId,
        receiverWalletId,
        userId,
        amount
    }: {
        senderWalletId: TransactionType["senderWalletId"],
        receiverWalletId: TransactionType["receiverWalletId"],
        userId?: string,
        amount: TransactionType["amount"]
    } = req.body

    if (!amount) return res.status(400).json({ message: "amount to be sent is required" })
    if (!senderWalletId) return res.status(400).json({ message: "Sender wallet ID is required!" })
    if (!receiverWalletId) return res.status(400).json({ message: "Receiver wallet ID is required!" })

    try {
        await db.transaction(async (tcx) => {
            // 1. Create a "pending" transaction record in our ledger
            const result = await tcx.insert(transactions).values({
                senderWalletId,
                receiverWalletId,
                amount,
                type: "transfer",
                status: "pending",
            }).returning();

            const newTransaction = result[0];

            // 2. Publish to QStash to process the transfer asynchronously
            await client.publishJSON({
                urlGroup: "transactions",
                body: {
                    transactionId: newTransaction.id,
                    senderWalletId: newTransaction.senderWalletId,
                    receiverWalletId: newTransaction.receiverWalletId,
                    amount: newTransaction.amount,
                    userId
                }
            });

            return res.status(202).json({
                message: "Transfer is being processed",
                txId: newTransaction.id
            });
        });
    } catch (error) {
        console.error("[Transfer_Controller] Error:", error);
        const statusCode = (error as any).statusCode || 500;
        const message = (error as any).message || "Transaction failed, please try again later.";
        return res.status(statusCode).json({ message });
    }
});