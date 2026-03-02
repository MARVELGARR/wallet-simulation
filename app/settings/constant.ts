



import dotenv from "dotenv"
import EventEmitter from "node:events"
dotenv.config()

export const DATABASE_CREDENTIALS = {
     user: process.env.DB_USER as string,
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
    port: Number(process.env.DB_PORT) || 5432,
}

