/**
 * One-off: ensure the Turso (libSQL) remote database has the Prisma schema
 * and carry over any rows from the local SQLite dev database.
 *
 *   bun scripts/turso-setup.ts
 */
import { createClient, type InValue } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const local = createClient({ url: "file:/home/z/my-project/db/custom.db" });

const DDL = [
  `CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "service" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE "Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX "Appointment_date_idx" ON "Appointment"("date")`,
  `CREATE INDEX "Appointment_status_idx" ON "Appointment"("status")`,
  `CREATE INDEX "Appointment_createdAt_idx" ON "Appointment"("createdAt")`,
  `CREATE INDEX "Visit_sessionId_idx" ON "Visit"("sessionId")`,
  `CREATE INDEX "Visit_createdAt_idx" ON "Visit"("createdAt")`,
];

async function tableExists(name: string): Promise<boolean> {
  const res = await turso.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    args: [name],
  });
  return res.rows.length > 0;
}

async function copyTable(table: string, cols: string[]) {
  const localRows = await local.execute(`SELECT * FROM "${table}"`);
  const remote = await turso.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
  const existing = Number(remote.rows[0]?.n ?? 0);
  if (localRows.rows.length === 0) {
    console.log(`${table}: nothing local to copy`);
    return;
  }
  if (existing > 0) {
    console.log(`${table}: remote already has ${existing} rows, skipping copy`);
    return;
  }
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`;
  const args = localRows.rows.map((r) =>
    cols.map((c) => (r[c] as InValue) ?? null)
  );
  await turso.batch(args.map((a) => ({ sql, args: a })), "write");
  console.log(`${table}: copied ${args.length} rows`);
}

async function main() {
  for (const stmt of DDL) {
    try {
      await turso.execute(stmt);
    } catch (err) {
      if (!String(err).includes("already exists")) throw err;
    }
  }
  console.log("schema ok");

  await copyTable("Appointment", [
    "id", "name", "phone", "email", "service", "date", "timeSlot", "message", "status", "createdAt", "updatedAt",
  ]);
  await copyTable("Visit", ["id", "sessionId", "device", "createdAt"]);

  const a = await turso.execute("SELECT COUNT(*) AS n FROM Appointment");
  const v = await turso.execute("SELECT COUNT(*) AS n FROM Visit");
  console.log(`remote counts → appointments: ${a.rows[0].n}, visits: ${v.rows[0].n}`);
}

main();
