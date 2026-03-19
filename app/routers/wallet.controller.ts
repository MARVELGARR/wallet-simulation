import { Request, Response } from "express";
import { router } from "../settings/router.config.js";
import { Create_Wallet_Services } from "../services/wallet-service/create-wallet.js";





router.post('/create-wallet', async (req: Request, res: Response)=>{

    const data = await req.body

    await Create_Wallet_Services(data).then((data)=>{
        
        if(data.success){
            
            res.status(201).json({
                    success: true,
                    data: data.data, // { user: { id, name, email }, token }
                });
        }
    }).catch((error)=>{
        res.status(500).json({
            success: false,
            error: error.error
        })
    })
})