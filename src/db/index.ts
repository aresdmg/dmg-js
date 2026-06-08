import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export async function ConnectDB() {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        throw new Error("DATABASE_URL not set")
    }

    const pool = new Pool({
        connectionString: dbUrl,
        max: 20,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 20_000
    })

    const db = drizzle(pool)
    return db
}