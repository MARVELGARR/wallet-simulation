import { CreateWallet_Dal, CreateWalletDalPromise, CreateWalletPropIn } from "../../data-access-layer/wallet/wallet.db.js"


export type DalSuccess<T> = { success: true; data: T };
export type DalError    = { success: false; error: string; code?: string };
export type DalResult<T> = DalSuccess<T> | DalError;




export const Create_Wallet_Services = async ({email,id, name}:CreateWalletPropIn): Promise<DalResult<{
    id: string;
    currency: string;
    balance: string;
    updatedAt: Date;
}>> =>{

    try{
        const newWallet = await CreateWallet_Dal({email, id, name})
        if (!newWallet[0]) {
            // INSERT returned no rows — unexpected, but we handle it defensively
            console.error("[wallet-dal] Insert succeeded but returned no rows.");
            return { success: false, error: "User wallet creation returned no data.", code: "DB_NO_RESULT" };
        }   
        return { success: true, data: newWallet[0]}

    }catch(error){
        console.error("[wallet-dal] DB error during user wallet insert:", error);
        return { success: false, error: "Failed to create user wallet.", code: "DB_ERROR" };
    }
}