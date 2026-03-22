import { eq } from "drizzle-orm"
import { WalletInsert, wallets } from "../../database/schema.js"
import { db } from "../../settings/db.config.js"
import { AppError, NotFoundError, ValidationError } from "../../settings/errorPerser.js"
import { GetWallet } from "../wallet/wallet.db.js"


export type Deposit_Dal_prop = {
    walletId: string
    ammount: WalletInsert["balance"],
    currency: WalletInsert['currency'],
    walletBalance:  WalletInsert["balance"],
}


export const Deposit_Dal  = async ({ammount, walletId, walletBalance}:Deposit_Dal_prop)=>{
     
        if(ammount === undefined || ammount === null){
            throw new ValidationError("Amount is not specified")
        }
        if(walletBalance === undefined || walletBalance === null){
            throw new ValidationError("Cannot get previous wallet balance")
        }
        if(!walletId){
            throw new ValidationError("WalletId is not provided")
        }

        const newBalance = Number(walletBalance) + Number(ammount)
        
        const result = await db.update(wallets)
            .set({
                balance: newBalance.toFixed(12)
            })
            .where(eq(wallets.id, walletId))
            .returning()
        
        const updatedWalletBalance = result[0]
        return updatedWalletBalance

}