import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });
if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is required.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
    await client.query(await readFile(resolve(import.meta.dirname, "../sql/001_core.sql"), "utf8"));
    console.log("Daily API schema is ready.");
}
finally {
    await client.end();
}
