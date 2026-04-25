import { Pool } from "pg"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"

dotenv.config()

// ─── Environment Detection ────────────────────────────────────
// Render does NOT automatically set NODE_ENV.
// We detect production by checking for NODE_ENV *or* the presence
// of a connection-string env var that only exists on Render.
const isProduction =
    process.env.NODE_ENV === "production" ||
    !!process.env.DATABASE_URL ||
    !!process.env.INTERNAL_DATABASE_URL_PROD;

console.log(
    `[db.config] Mode: ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} ` +
    `(NODE_ENV=${process.env.NODE_ENV ?? "<not set>"})`
);

// ─── Build the Pool config ────────────────────────────────────
let poolConnectionConfig: ConstructorParameters<typeof Pool>[0];

if (isProduction) {
    // Priority order for Render:
    // 1. DATABASE_URL        — Render auto-injects this when you link a DB
    // 2. INTERNAL_DATABASE_URL_PROD — your custom internal URL
    // 3. EXTERNAL_DATABASE_URL_PROD — your custom external URL
    // 4. Individual credentials (PORT_PROD, DATABASE_PROD, etc.)
    const connectionString =
        process.env.DATABASE_URL ||
        process.env.INTERNAL_DATABASE_URL_PROD ||
        process.env.EXTERNAL_DATABASE_URL_PROD ||
        "";

    if (connectionString) {
        console.log("[db.config] Using connection string");
        poolConnectionConfig = {
            connectionString,
            ssl: { rejectUnauthorized: false },
        };
    } else {
        console.log("[db.config] Using individual credentials");
        poolConnectionConfig = {
            host: process.env.PORT_PROD as string,
            database: process.env.DATABASE_PROD as string,
            user: process.env.USERNAME_PROD as string,
            password: process.env.PASSWORD_PROD as string,
            port: 5432,
            ssl: { rejectUnauthorized: false },
        };
    }
} else {
    // Local development — no SSL
    poolConnectionConfig = {
        host: process.env.DB_HOST as string,
        database: process.env.DB_NAME as string,
        user: process.env.DB_USER as string,
        password: process.env.DB_PASSWORD as string,
        port: Number(process.env.DB_PORT) || 5432,
        ssl: false,
    };
}

const pool = new Pool(poolConnectionConfig);
const db = drizzle(pool)

const connectDb = async () => {
    try {
        await pool.connect();
        console.log("[db.config] ✅ Database connected");
    } catch (error) {
        console.error("[db.config] ❌ Database connection failed:", error);
    }
}

export {
    pool,
    connectDb,
    db
}
