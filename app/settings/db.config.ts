import { Pool } from "pg"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"

dotenv.config()

const isProduction = process.env.NODE_ENV === "production";

// Use production credentials for Render, or local credentials for dev
export const DATABASE_CREDENTIALS = isProduction ? {
    host: process.env.PORT_PROD as string, // User labeled host as PORT_PROD
    database: process.env.DATABASE_PROD as string,
    user: process.env.USERNAME_PROD as string,
    password: process.env.PASSWORD_PROD as string,
    port: 5432,
    ssl: { rejectUnauthorized: false } // Required for Render Postgres
} : {
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: false
};

// Initialize pool based on credentials
let poolConnectionConfig;

if (isProduction) {
    // 1. Try Internal URL (fastest)
    // 2. Try External URL
    // 3. Try standard DATABASE_URL (Render default)
    const connectionString = 
        process.env.INTERNAL_DATABASE_URL_PROD || 
        process.env.EXTERNAL_DATABASE_URL_PROD || 
        process.env.DATABASE_URL;

    if (connectionString) {
        poolConnectionConfig = {
            connectionString,
            ssl: { rejectUnauthorized: false }
        };
    } else {
        // 4. Fallback to individual credentials
        poolConnectionConfig = {
            ...DATABASE_CREDENTIALS,
            ssl: { rejectUnauthorized: false }
        };
    }
} else {
    // Local dev
    poolConnectionConfig = { ...DATABASE_CREDENTIALS };
}

const pool = new Pool(poolConnectionConfig);


const db = drizzle(pool)

const connectDb = async () => {
    try {
        await pool.connect();
        
        console.log("Database connected");
    } catch (error) {
        console.log("error");
    }
}


export {
    pool,
    connectDb,
    db
}
