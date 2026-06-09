import { drizzle } from "drizzle-orm/node-postgres";

export async function ConnectDB() {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        throw new Error("DATABASE_URL not set")
    }

    const db = drizzle(dbUrl)
    return db
}