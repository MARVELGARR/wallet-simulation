


import { Deposit_Dal, Deposit_Dal_prop } from "../../data-access-layer/transaction/deposit.js";



export type DalSuccess<T> = { success: true; data: T };
export type DalError    = { success: false; error: string; code?: string };
export type DalResult<T> = DalSuccess<T> | DalError;


export const CompleteDeposit =  async ({ammount, walletId, walletBalance, currency}:Deposit_Dal_prop) =>{

    try{

        const result = await Deposit_Dal({ammount, walletId, walletBalance, currency})
    
        if(!result){
             return { success: false, error: "Deposit creation failed: No data returned.", code: "DB_EMPTY_RESULT" }
        }
         return { success: true, data: result }
    }
    catch(error){
         console.error("[Deposit_Service] Critical Error:", error);
        return { success: false, error: "Internal server error during Deposit creation.", code: "INTERNAL_ERROR" };
    }


}
