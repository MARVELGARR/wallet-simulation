


import { CreateWallet_Dal, CreateWalletDalPromise, WalletPropIn } from "../../data-access-layer/wallet/wallet.db.js"


export type DalSuccess<T> = { success: true; data: T };
export type DalError    = { success: false; error: string; code?: string };
export type DalResult<T> = DalSuccess<T> | DalError;




export const Create_Wallet_Services = async (input: WalletPropIn): Promise<DalResult<CreateWalletDalPromise>> => {
    try {
        const newWallet = await CreateWallet_Dal(input);
        
        if (!newWallet ) {
            return { success: false, error: "Wallet creation failed: No data returned.", code: "DB_EMPTY_RESULT" };
        }
        
        return { success: true, data: newWallet };
    } catch (error) {
        // Log the actual error for debugging, return a friendly message to the UI
        console.error("[Wallet_Service] Critical Error:", error);
        return { success: false, error: "Internal server error during wallet creation.", code: "INTERNAL_ERROR" };
    }
};