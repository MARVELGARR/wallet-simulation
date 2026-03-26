import { eq } from "drizzle-orm/pg-core/expressions";
import { wallets } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";

export type WalletPropIn={
    id: string;
    name: string;
    email: string;
}

export type CreateWalletDalPromise = {
    id: string;
    currency: string;
    balance: string;
    updatedAt: Date;
}


export const CreateWallet_Dal = async ({id}:WalletPropIn): Promise<CreateWalletDalPromise> =>{

    const result = await db.insert(wallets).values({
        userId: id,
        currency: "NGN"
    }).returning({
        id: wallets.id,
        currency: wallets.currency,
        balance: wallets.balance,
        updatedAt: wallets.updatedAt
    })

    const TheCreatedWallet = result[0]
    return TheCreatedWallet
        
}

export const GetWallet = async (id: string) =>{
     const [result] =await db.select().from(wallets).where(eq( wallets.id, id))
    
     return result
}
export const GetWalletForUpdate = async (id: string) =>{
     const [result] =await db.select().from(wallets).where(eq( wallets.id, id)).for("update")
    
     return result
}



export const DeleteWallet_Dal = async ({id}:WalletPropIn): Promise<CreateWalletDalPromise> =>{
    const result = await db.delete(wallets).where(eq( wallets.id, id)).returning()
    const TheDeletedWallet = result[0]
    return TheDeletedWallet
}

// export const UpdatedWallet_Dal = async ({}: WalletPropIn) =>{
    
// }