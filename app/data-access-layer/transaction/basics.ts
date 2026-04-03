import { eq } from "drizzle-orm"
import { transactions } from "../../database/schema.js"
import { db } from "../../settings/db.config.js"







export const GetTransaction = async (id: string) =>{

    const result = await db.select()
    .from(transactions)
    .where(eq(transactions.id, id))
    
}
export const GetTransactionForUpdate = async (id: string) =>{

    const result = await db.select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .for("update")
}