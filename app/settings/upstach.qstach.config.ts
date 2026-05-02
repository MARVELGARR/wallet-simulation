


import { Client, Receiver } from "@upstash/qstash";

// Token is read from QSTASH_TOKEN env var (set in .env)
export const client = new Client({
    token: process.env.QSTASH_TOKEN!,
    
});

export const reciever = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY
})