import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import { KARACHI_OFFSET_MS, clinicTodayStr } from "@/lib/clinic";

export const dynamic = "force-dynamic";

/* -------------------------------- GET /api/admin/stats ----------------------------- */
// Admin dashboard aggregate: booking stats + visitor analytics in one call.
// All "days" follow the clinic timezone (Asia/Karachi, UTC+5, no DST).

function clinicDateStrOffset(now: Date, offsetDays: number): string {
  return new Date(now.getTime() + KARACHI_OFFSET_MS + offsetDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

function karachiDateStr(d: Date): string {
  return new Date(d.getTime() + KARACHI_OFFSET_MS).toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const now = new Date();
    const todayStr = clinicTodayStr(now);

    // Last 7 clinic days (oldest -> newest).
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) days.push(clinicDateStrOffset(now, -i));

    const windowStart = new Date(new Date(`${days[0]}T00:00:00.000Z`).getTime() - KARACHI_OFFSET_MS);

    const [allAppointments, allVisits, recentAppointments] = await Promise.all([
      db.appointment.findMany({
        select: { id: true, service: true, date: true, status: true, createdAt: true },
      }),
      db.visit.findMany({ select: { id: true, sessionId: true, device: true, createdAt: true } }),
      db.appointment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    /* ------------------------------ Appointments ------------------------------ */
    const apptDailyMap = new Map<string, number>(days.map((d) => [d, 0]));
    const serviceMap = new Map<string, number>();
    let todayBookings = 0;
    let todaysAppointments = 0;
    const statusCounts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };

    for (const a of allAppointments) {
      statusCounts[a.status as keyof typeof statusCounts] =
        (statusCounts[a.status as keyof typeof statusCounts] || 0) + 1;
      serviceMap.set(a.service, (serviceMap.get(a.service) || 0) + 1);
      if (a.date === todayStr) todaysAppointments++;

      const createdDay = karachiDateStr(a.createdAt);
      if (apptDailyMap.has(createdDay)) apptDailyMap.set(createdDay, (apptDailyMap.get(createdDay) || 0) + 1);
      if (createdDay === todayStr) todayBookings++;
    }

    const topServices = Array.from(serviceMap.entries())
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    /* --------------------------------- Visits --------------------------------- */
    const visitDailyMap = new Map<string, { visits: number; sessions: Set<string> }>(
      days.map((d) => [d, { visits: 0, sessions: new Set<string>() }])
    );
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    const uniqueSessions = new Set<string>();
    let visitsToday = 0;
    const sessionsToday = new Set<string>();

    for (const v of allVisits) {
      deviceCounts[v.device as keyof typeof deviceCounts] =
        (deviceCounts[v.device as keyof typeof deviceCounts] || 0) + 1;
      uniqueSessions.add(v.sessionId);

      const day = karachiDateStr(v.createdAt);
      const bucket = visitDailyMap.get(day);
      if (bucket) {
        bucket.visits += 1;
        bucket.sessions.add(v.sessionId);
      }
      if (day === todayStr) {
        visitsToday++;
        sessionsToday.add(v.sessionId);
      }
    }

    return NextResponse.json({
      generatedAt: now.toISOString(),
      clinicToday: todayStr,
      appointments: {
        total: allAppointments.length,
        ...statusCounts,
        todayBookings,
        todaysAppointments,
        last7days: days.map((date) => ({ date, bookings: apptDailyMap.get(date) || 0 })),
        topServices,
      },
      visits: {
        total: allVisits.length,
        unique: uniqueSessions.size,
        today: visitsToday,
        todayUnique: sessionsToday.size,
        last7days: days.map((date) => {
          const b = visitDailyMap.get(date);
          return { date, visits: b?.visits || 0, unique: b?.sessions.size || 0 };
        }),
        devices: deviceCounts,
      },
      recentAppointments,
    });
  } catch (err) {
    console.error("GET /api/admin/stats failed:", err);
    return NextResponse.json({ error: "Failed to load dashboard stats." }, { status: 500 });
  }
}
