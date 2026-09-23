import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin";

export const dynamic = "force-dynamic";

/* ------------------------------- POST /api/admin/reset ------------------------------- */
// Admin endpoint - permanently delete ALL appointments and visitor records.
// Used to wipe demo/seed data from the production database.

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const [appointments, visits] = await Promise.all([
      db.appointment.deleteMany({}),
      db.visit.deleteMany({}),
    ]);

    return NextResponse.json({
      ok: true,
      deleted: { appointments: appointments.count, visits: visits.count },
    });
  } catch (err) {
    console.error("POST /api/admin/reset failed:", err);
    return NextResponse.json(
      { error: "Failed to clear the data. Please try again." },
      { status: 500 }
    );
  }
}
