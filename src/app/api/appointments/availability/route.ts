import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clinicTodayStr, isClosedDay } from "@/lib/clinic";

export const dynamic = "force-dynamic";

/* ------------------------ GET /api/appointments/availability ----------------------- */
// Public endpoint - which slots are already taken for a given date.
// Only slot labels are exposed; no patient data.

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date") || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid or missing date." }, { status: 400 });
    }

    const today = clinicTodayStr();
    if (date < today) {
      return NextResponse.json({ date, closed: false, past: true, taken: [] });
    }
    if (isClosedDay(date)) {
      return NextResponse.json({ date, closed: true, past: false, taken: [] });
    }

    const booked = await db.appointment.findMany({
      where: { date, status: { not: "CANCELLED" } },
      select: { timeSlot: true },
    });

    return NextResponse.json({
      date,
      closed: false,
      past: false,
      taken: booked.map((b) => b.timeSlot),
    });
  } catch (err) {
    console.error("GET /api/appointments/availability failed:", err);
    return NextResponse.json({ error: "Failed to check availability." }, { status: 500 });
  }
}
