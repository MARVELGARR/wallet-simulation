import { router } from "../../settings/router.config.js";
import { db } from "../../settings/db.config.js";
import { transactions, wallets } from "../../database/schema.js";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../../settings/errorPerser.js";


export const Withdraw_Dal = async ({transactionId}: {transactionId: string}) =>{  
     return    await db.transaction( async (tcx)=>{
            const [transaction] = await tcx.select().from(transactions)
            .where(eq(transactions.id, transactionId))
            .for("update")
            
            if(!transaction){
                throw new NotFoundError("Withdraw transaction not found")
            }
            if(!transaction.senderWalletId){
                throw new NotFoundError("wallet Id to be withdrawn from not found")
            }

            const [walletRedrawnedFrom] = await tcx.select()
            .from(wallets)
            .where(eq(wallets.id, transaction.senderWalletId))
            .for("update")
            
            if(!walletRedrawnedFrom){
                throw new NotFoundError("wallet to be Withdrawened from not found")
            }

            const newBalance = Number(walletRedrawnedFrom.balance) + Number(transaction.amount)

            const [updatedWallet] = await tcx.update(wallets).set({
                balance: newBalance.toFixed(12)
            }).where(eq(wallets.id, walletRedrawnedFrom.id))
            .returning()

            return updatedWallet
            
        })
}