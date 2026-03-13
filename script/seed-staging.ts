/**
 * Seed staging database with an admin user.
 * Run on server: cd /var/www/it-ops-dashboard && npm run db:seed-staging
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// Load .env.staging before db (db reads DATABASE_URL at load time)
const envPath = resolve(process.cwd(), ".env.staging");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  // .env.staging not found, DATABASE_URL must be set
}

const { db } = await import("../server/db");

const STAGING_ADMIN = {
  username: "admin",
  password: "staging-admin-2025",
  displayName: "Staging Admin",
  role: "admin" as const,
};

async function seedStaging() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL required. Set it or ensure .env.staging exists.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(STAGING_ADMIN.password, 12);
  const existing = await db.select().from(users).where(eq(users.username, STAGING_ADMIN.username));

  if (existing.length > 0) {
    console.log("Staging admin already exists. Updating password.");
    await db
      .update(users)
      .set({ password: hashedPassword, role: "admin" })
      .where(eq(users.username, STAGING_ADMIN.username));
    console.log("Password reset for admin.");
  } else {
    await db.insert(users).values({
      username: STAGING_ADMIN.username,
      password: hashedPassword,
      displayName: STAGING_ADMIN.displayName,
      role: STAGING_ADMIN.role,
    });
    console.log("Staging admin created.");
  }

  console.log("\nStaging login:");
  console.log(`  URL: https://staging.itopsconsole.com`);
  console.log(`  Username: ${STAGING_ADMIN.username}`);
  console.log(`  Password: ${STAGING_ADMIN.password}`);
  console.log("\nChange this password after first login.");
}

seedStaging().catch((err) => {
  console.error(err);
  process.exit(1);
});
