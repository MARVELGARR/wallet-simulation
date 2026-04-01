


import { Client } from "@upstash/qstash";

// Token is read from QSTASH_TOKEN env var (set in .env)
export const client = new Client({
    token: process.env.QSTASH_TOKEN!,
});