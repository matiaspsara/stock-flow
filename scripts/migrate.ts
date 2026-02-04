import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local file
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  console.warn("Could not load .env.local file:", error);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables. Check .env.local");
}

// Extract the project ref from the Supabase URL
// URL format: https://<project-ref>.supabase.co
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  throw new Error("Could not extract project ref from Supabase URL");
}

async function runMigration() {
  const migrationFile = readFileSync(
    join(process.cwd(), "supabase", "migrations", "001_init.sql"),
    "utf-8"
  );

  console.log("\n" + "=".repeat(80));
  console.log("DATABASE MIGRATION REQUIRED");
  console.log("=".repeat(80));
  console.log("\n⚠️  The database tables need to be created before running the seed script.");
  console.log("\nTo run the migration, follow these steps:\n");
  console.log("1. Open your Supabase dashboard:");
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
  console.log("2. Copy the entire contents of the migration file:");
  console.log(`   ${join(process.cwd(), "supabase", "migrations", "001_init.sql")}\n`);
  console.log("3. Paste it into the SQL editor and click 'Run'\n");
  console.log("4. After the migration completes, run: npm run seed\n");
  console.log("=".repeat(80));
  console.log("\nMigration SQL Preview (first 500 chars):\n");
  console.log(migrationFile.substring(0, 500) + "...\n");
}

runMigration().catch((error) => {
  console.error(error);
  process.exit(1);
});
