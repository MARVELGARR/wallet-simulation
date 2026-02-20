


import { defineConfig} from "drizzle-kit"
import dotenv from "dotenv"
import { DATABASE_CREDENTIALS } from "./constant"

dotenv.config()


export default defineConfig({
    out: "./app/database/migrations",
    schema: "./app/database/schema.ts",
    dialect: "postgresql",

    dbCredentials: {
        ...DATABASE_CREDENTIALS,
        ssl: false
    }
    

})