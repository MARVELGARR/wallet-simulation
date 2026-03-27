



import { defineConfig} from "drizzle-kit"
import dotenv from "dotenv"


export const DATABASE_CREDENTIALS = {
     user: process.env.DB_USER as string,
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
    port: Number(process.env.DB_PORT) || 5432,
}


dotenv.config()


export default defineConfig({
    out: "./app/database/migrations",
    schema: "./app/database/schema.ts",
    dialect: "postgresql",

    dbCredentials: {
        ...DATABASE_CREDENTIALS ,
        ssl: false
    }
    

})