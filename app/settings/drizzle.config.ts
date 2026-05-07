import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error("[drizzle.config] ❌ DATABASE_URL is not set.")
}

export default defineConfig({
    out: "./app/database/migrations",
    schema: "./app/database/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString,
    },
})