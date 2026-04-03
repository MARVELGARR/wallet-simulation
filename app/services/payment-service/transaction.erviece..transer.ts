
import { Transfere_Dal, Transfere_Dal_prop } from "../../data-access-layer/transaction/transfere.js";

export type TransferSuccess<T> = { success: true; data: T };
export type TransferError = { success: false; error: string; code?: string };
export type TransferResult<T> = TransferSuccess<T> | TransferError;

export const CompleteTransfer = async ({ senderWalletId, recieverWalletId, ammount, currency }: Transfere_Dal_prop) => {
    try {
        const result = await Transfere_Dal({ senderWalletId, recieverWalletId, ammount, currency });
        
        if (!result) {
            return { success: false, error: "Transfer failed: No data returned.", code: "DB_EMPTY_RESULT" };
        }
        
        return { success: true, data: result };
    } catch (error: any) {
        console.error("[Transfer_Service] Critical Error:", error);
        return { 
            success: false, 
            error: error.message || "Internal server error during transfer processing.", 
            code: error.name || "INTERNAL_ERROR" 
        };
    }
};
