import { wallets } from "../../database/schema.js";
import { db } from "../../settings/db.config.js";

export type CreateWalletPropIn={
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


export const CreateWallet_Dal = async ({id}:CreateWalletPropIn): Promise<CreateWalletDalPromise[]> =>{


    return await db.insert(wallets).values({
        userId: id,
        currency: "NGN"
    }).returning({
        id: wallets.id,
        currency: wallets.currency,
        balance: wallets.balance,
        updatedAt: wallets.updatedAt
    })

        
}