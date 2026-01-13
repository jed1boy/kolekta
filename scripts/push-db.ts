import { createClient } from "@libsql/client";
import { execSync } from "child_process";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error("Error: Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    try {
        console.log("Generating migration SQL...");
        // Read the explicit migration file that contains the schema
        const migrationPath = "prisma/migrations/20260113164142_init/migration.sql";
        console.log(`Reading migration file: ${migrationPath}`);
        const output = require("fs").readFileSync(migrationPath, "utf-8");

        console.log("DEBUG: Full output length:", output.length);

        // No need to sanitize logs as file read is clean
        const sql = output;

        if (!sql || sql.trim().length === 0) {
            console.log("No changes detected or empty SQL.");
            return;
        }

        console.log("Executing SQL on Turso...");

        // Split into individual statements for safer execution and better error tracking
        // This is a simple split, for complex SQL with triggers/procedures it might fail, 
        // but for standard Prisma schema pushes (CREATE TABLE) it works well.
        const statements = sql
            .split(';')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        for (const statement of statements) {
            try {
                await client.execute(statement);
                console.log("Executed statement.");
            } catch (e) {
                console.error("Error executing statement:", statement.substring(0, 50) + "...");
                // Only log error but try to continue or throw? 
                // Usually strict failure is better for migrations.
                throw e;
            }
        }

        console.log("✅ Successfully successfully pushed schema to Turso!");
    } catch (error) {
        console.error("❌ Error pushing schema:", error);
        process.exit(1);
    } finally {
        client.close();
    }
}

main();
