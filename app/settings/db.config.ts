import { Pool } from "pg"
import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
dotenv.config()



export const DATABASE_CREDENTIALS = {
     user: process.env.DB_USER as string,
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
    port: Number(process.env.DB_PORT) || 5432,
}



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
