import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { transactions, WalletInsert } from "../database/schema.js";
import { client } from "../settings/upstach.qstach.config.js";
import { db } from "../settings/db.config.js";




router.post("/deposit", async (req: Request, res: Response)=>{
    const {ammount, walletId} : {ammount: WalletInsert["balance"], walletId: string} = req.body

    if(!ammount)    return res.status(404).json({ message: "amount to be sent is required"})
    if(!walletId) return res.status(404).json({ message: "walletId is required!"})

    try{

        const [newTransaction] = await db.transaction( async (tcx)=>{
            const wallet =
            tcx.insert(transactions).values({
                type: "deposit",
                amount: ammount,
                status: "pending",

            })
        })
        
    }
    catch(error){

    }


})