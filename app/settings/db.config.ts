import { Pool } from "pg"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import { DATABASE_CREDENTIALS } from "./constant"
dotenv.config()

const pool = new Pool({
   ...DATABASE_CREDENTIALS
})

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
