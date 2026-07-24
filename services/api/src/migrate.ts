import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const directory = resolve(import.meta.dirname, "../sql");
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
  const applied = new Set((await client.query<{ filename: string }>("SELECT filename FROM schema_migrations")).rows.map(row => row.filename));
  const files = (await readdir(directory)).filter(name => /^\d+_.*\.sql$/.test(name)).sort(); let count = 0;
  for (const file of files) { if (applied.has(file)) continue; await client.query("BEGIN"); try { await client.query(await readFile(resolve(directory, file), "utf8")); await client.query("INSERT INTO schema_migrations(filename) VALUES($1)", [file]); await client.query("COMMIT"); count++; } catch (error) { await client.query("ROLLBACK"); throw error; } }
  console.log(`Daily API schema is ready (${count} migration${count === 1 ? "" : "s"} applied).`);
} finally { await client.end(); }
