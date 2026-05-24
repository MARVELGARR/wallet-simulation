import { Pool, neonConfig } from "@neondatabase/serverless"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"
import { dbLogger } from "./logger.js"

dotenv.config()

// ─── Neon Serverless requires a WebSocket constructor ──────────
neonConfig.webSocketConstructor = ws

// ─── Connection String ────────────────────────────────────────
// Both dev and prod use the same Neon DATABASE_URL.
// SSL is enforced via ?sslmode=require in the connection string.
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("[db.config] ❌ DATABASE_URL is not set. Please add your Neon connection string to .env")
}

dbLogger.info(
    { mode: process.env.NODE_ENV ?? "development" },
    "Connecting to Neon PostgreSQL"
)

const pool = new Pool({ connectionString })
const db = drizzle(pool)

const connectDb = async () => {
    try {
        const client = await pool.connect()
        client.release()
        dbLogger.info("✅ Neon database connected")
    } catch (error) {
        dbLogger.error({ err: error }, "❌ Neon database connection failed")
    }
}

export {
    pool,
    connectDb,
    db
}
