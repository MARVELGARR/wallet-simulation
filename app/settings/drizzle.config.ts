import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

// Render does NOT auto-set NODE_ENV — detect production by env vars too
const isProduction =
    process.env.NODE_ENV === "production" ||
    !!process.env.DATABASE_URL ||
    !!process.env.INTERNAL_DATABASE_URL_PROD;

// For production, prefer DATABASE_URL (Render's built-in) → EXTERNAL_DATABASE_URL_PROD → fallback
const productionUrl =
    process.env.DATABASE_URL ||
    process.env.EXTERNAL_DATABASE_URL_PROD ||
    "";

export default defineConfig({
    out: "./app/database/migrations",
    schema: "./app/database/schema.ts",
    dialect: "postgresql",

    dbCredentials: isProduction
        ? {
              url: productionUrl,
              ssl: { rejectUnauthorized: false },
          }
        : {
              user: process.env.DB_USER as string,
              host: process.env.DB_HOST as string,
              database: process.env.DB_NAME as string,
              password: process.env.DB_PASSWORD as string,
              port: Number(process.env.DB_PORT) || 5432,
          },
})