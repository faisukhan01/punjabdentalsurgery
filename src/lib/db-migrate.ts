import { db } from "@/lib/db";

/**
 * One-time, idempotent runtime migration for per-day token numbers (Task 24).
 *
 * The production Turso database predates the `tokenNumber` column, and the
 * Prisma Client generated from the new schema always selects it — so every
 * Appointment-touching entrypoint makes sure, before its first query:
 *
 *   1. the column exists (added with default 0 — history is preserved),
 *   2. historical rows receive their would-have-been token (per-day sequence
 *      ordered by booking time) so old and new bookings stay consistent,
 *   3. the (date, tokenNumber) unique index exists — the booking API relies
 *      on it to hand out race-free daily tokens (retries on P2002).
 *
 * Every statement is safe to run repeatedly, so concurrent serverless
 * instances can never corrupt anything; the in-memory flag only skips the
 * (cheap) round-trips once this instance has done them.
 */
let ensured = false;

export async function ensureAppointmentTokenSchema(): Promise<void> {
  if (ensured) return;

  // 1) Add the column when it is missing (older databases).
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE "Appointment" ADD COLUMN "tokenNumber" INTEGER NOT NULL DEFAULT 0`
    );
  } catch (err) {
    // "duplicate column name" simply means the database is already migrated.
    if (!String(err).includes("duplicate column")) throw err;
  }

  // 2) Backfill historical rows: per-day sequence ordered by booking time.
  await db.$executeRawUnsafe(
    `UPDATE "Appointment" SET "tokenNumber" = (
       SELECT rn FROM (
         SELECT "id", ROW_NUMBER() OVER (
           PARTITION BY "date" ORDER BY "createdAt", "id"
         ) AS rn
         FROM "Appointment"
       ) t
       WHERE t."id" = "Appointment"."id"
     )
     WHERE "tokenNumber" = 0`
  );

  // 3) Unique per-day token (Prisma's constraint naming for @@unique).
  await db.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_date_tokenNumber_key"
       ON "Appointment"("date", "tokenNumber")`
  );

  ensured = true;
}
