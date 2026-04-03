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
const poolConnectionConfig = isProduction && process.env.INTERNAL_DATABASE_URL_PROD 
    ? { 
        connectionString: process.env.INTERNAL_DATABASE_URL_PROD,
        ssl: { rejectUnauthorized: false }
      } 
    : { ...DATABASE_CREDENTIALS };

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
