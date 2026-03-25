import { eq } from "drizzle-orm"
import { wallets, WalletType } from "../../database/schema.js"
import { db } from "../../settings/db.config.js"
import { GetWallet } from "../wallet/wallet.db.js"
import { NotFoundError, ValidationError } from "../../settings/errorPerser.js"



export type Transfere_Dal_prop = {
    senderWalletId: WalletType["id"]
    recieverWalletId: WalletType["id"]
    ammount: WalletType["balance"]
    currency: WalletType["currency"]
}

export const Transfere_Dal = async ({ senderWalletId, recieverWalletId, ammount, currency }: Transfere_Dal_prop) => {
    return await db.transaction(async (tcx) => {
        // 1. Fetch and Lock wallets to prevent race conditions during the transfer
        const [senderWallet] = await tcx.select().from(wallets).where(eq(wallets.id, senderWalletId)).for("update");
        if (!senderWallet) throw new NotFoundError("Sender wallet not found");

        const [recieverWallet] = await tcx.select().from(wallets).where(eq(wallets.id, recieverWalletId)).for("update");
        if (!recieverWallet) throw new NotFoundError("Reciever wallet not found");

        // 2. Validate sufficient balance (decimal fields are returned as strings by node-postgres)
        const senderBalance = Number(senderWallet.balance);
        const amountToTransfer = Number(ammount);

        if (senderBalance < amountToTransfer) {
            throw new ValidationError("Insufficient balance");
        }

        // 3. Atomically update both wallets
        const newSenderBalance = (senderBalance - amountToTransfer).toFixed(12);
        const newRecieverBalance = (Number(recieverWallet.balance) + amountToTransfer).toFixed(12);

        await tcx.update(wallets)
            .set({ balance: newSenderBalance })
            .where(eq(wallets.id, senderWalletId));

        await tcx.update(wallets)
            .set({ balance: newRecieverBalance })
            .where(eq(wallets.id, recieverWalletId));

        return {
            senderBalance: newSenderBalance,
            recieverBalance: newRecieverBalance
        };
    });
}