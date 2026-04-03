import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

const isProduction = process.env.NODE_ENV === "production";

// Drizzle-kit uses the connection string directly via 'url' attribute for production
export const DATABASE_CREDENTIALS = isProduction ? {
    url: process.env.EXTERNAL_DATABASE_URL_PROD as string,
} : {
    user: process.env.DB_USER as string,
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
    port: Number(process.env.DB_PORT) || 5432,
}

export default defineConfig({
    out: "./app/database/migrations",
    schema: "./app/database/schema.ts",
    dialect: "postgresql",

    dbCredentials: {
        ...(isProduction ? { url: process.env.EXTERNAL_DATABASE_URL_PROD as string } : (DATABASE_CREDENTIALS as any)),
        ssl: isProduction ? { rejectUnauthorized: false } : false
    }
})