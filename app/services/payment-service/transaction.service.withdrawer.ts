import { Withdraw_Dal } from "../../data-access-layer/transaction/withdrawer.js";





export type DalSuccess<T> = { success: true; data: T };
export type DalError    = { success: false; error: string; code?: string };
export type DalResult<T> = DalSuccess<T> | DalError;


export const Withdraw_Money_service = async ({transactionId}: {transactionId: string}) =>{

    try {
        const result = await Withdraw_Dal({transactionId})

        if (!result) {
            return { success: false, error: "withdrawer failed: No data returned.", code: "DB_EMPTY_RESULT" };
        }

         return { success: true, data: result };
    } catch (error: any) {
       console.error("[Transfer_Service] Critical Error:", error);
        return { 
            success: false, 
            error: error.message || "Internal server error during withdrawl processing.", 
            code: error.name || "INTERNAL_ERROR" 
        };
    }
}