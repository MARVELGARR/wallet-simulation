import { Pool, neonConfig } from "@neondatabase/serverless"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/neon-serverless"
import ws from "ws"

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

console.log(
    `[db.config] Mode: ${process.env.NODE_ENV ?? "development"} — connecting to Neon PostgreSQL`
)

const pool = new Pool({ connectionString })
const db = drizzle(pool)

const connectDb = async () => {
    try {
        const client = await pool.connect()
        client.release()
        console.log("[db.config] ✅ Neon database connected")
    } catch (error) {
        console.error("[db.config] ❌ Neon database connection failed:", error)
    }
}

export {
    pool,
    connectDb,
    db
}
