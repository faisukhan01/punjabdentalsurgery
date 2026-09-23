/**
 * One-time Turso bootstrap: creates tables from the Prisma schema DDL and
 * copies existing rows from the local SQLite file so no data is lost.
 *
 * Usage: bun scripts/turso-init.ts
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const remoteUrl = process.env.TURSO_DATABASE_URL;
if (!remoteUrl) throw new Error("TURSO_DATABASE_URL is not set");

const remote = createClient({
  url: remoteUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const local = createClient({ url: "file:/home/z/my-project/db/custom.db" });

async function tableExists(name: string): Promise<boolean> {
  const res = await remote.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    args: [name],
  });
  return res.rows.length > 0;
}

async function count(db: typeof remote, table: string): Promise<number> {
  const res = await db.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
  return Number(res.rows[0]?.n ?? 0);
}

async function main() {
  console.log("Remote:", remoteUrl);

  const ddl = readFileSync("/tmp/turso-init.sql", "utf8");

  if (!(await tableExists("Appointment")) || !(await tableExists("Visit"))) {
    console.log("Creating tables on Turso…");
    await remote.executeMultiple(ddl);
    console.log("Tables created.");
  } else {
    console.log("Tables already exist on Turso — skipping DDL.");
  }

  const remoteAppointments = await count(remote, "Appointment");
  const remoteVisits = await count(remote, "Visit");

  if (remoteAppointments === 0) {
    const localAppointments = await local.execute(
      "SELECT id, name, phone, email, service, date, timeSlot, message, status, createdAt, updatedAt FROM Appointment"
    );
    for (const r of localAppointments.rows) {
      await remote.execute({
        sql: "INSERT INTO Appointment (id, name, phone, email, service, date, timeSlot, message, status, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        args: [
          r.id as string,
          r.name as string,
          r.phone as string,
          (r.email as string | null) ?? null,
          r.service as string,
          r.date as string,
          r.timeSlot as string,
          (r.message as string | null) ?? null,
          r.status as string,
          r.createdAt as string,
          r.updatedAt as string,
        ],
      });
    }
    console.log(`Copied ${localAppointments.rows.length} appointments.`);
  } else {
    console.log(`Remote already has ${remoteAppointments} appointments — skipping copy.`);
  }

  if (remoteVisits === 0) {
    const localVisits = await local.execute("SELECT id, sessionId, device, createdAt FROM Visit");
    for (const r of localVisits.rows) {
      await remote.execute({
        sql: "INSERT INTO Visit (id, sessionId, device, createdAt) VALUES (?,?,?,?)",
        args: [r.id as string, r.sessionId as string, r.device as string, r.createdAt as string],
      });
    }
    console.log(`Copied ${localVisits.rows.length} visits.`);
  } else {
    console.log(`Remote already has ${remoteVisits} visits — skipping copy.`);
  }

  const finalA = await count(remote, "Appointment");
  const finalV = await count(remote, "Visit");
  console.log(`✔ Turso ready — appointments: ${finalA}, visits: ${finalV}`);
}

main().catch((err) => {
  console.error("Turso init failed:", err);
  process.exit(1);
});
