import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ensureAppointmentTokenSchema } from "@/lib/db-migrate";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import {
  clinicTodayStr,
  isClosedDay,
} from "@/lib/clinic";

export const dynamic = "force-dynamic";

/* ----------------------------- Slot helpers ----------------------------- */
// Time slots are free-form labels like "5:00 PM", "6:45 PM" — patients pick
// from the dropdown (30-min grid) or type a custom time. Internally we work
// in minutes-since-midnight so custom times never collide with booked slots.

const CLINIC_OPEN_MIN = 17 * 60; // 5:00 PM
const CLINIC_CLOSE_MIN = 24 * 60; // 12:00 AM (midnight)
const SLOT_MINUTES = 30; // one appointment occupies half an hour

/** "6:45 PM" -> 1145 (minutes since midnight), or null when malformed. */
function parseSlotMinutes(raw: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*([AP])M$/i.exec(raw.trim());
  if (!m) return null;
  const h12 = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h12 < 1 || h12 > 12 || min > 59) return null;
  const pm = m[3].toUpperCase() === "P";
  const h24 = (h12 % 12) + (pm ? 12 : 0);
  return h24 * 60 + min;
}

/** 1145 -> "7:45 PM" (canonical label stored in the DB). */
function minutesToSlotLabel(mins: number): string {
  const h24 = Math.floor(mins / 60);
  const min = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${ampm}`;
}

/* ----------------------------- POST /api/appointments ----------------------------- */
// Public endpoint - patients submit a booking request.

const createSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,16}$/, "Please enter a valid phone number"),
  email: z.union([z.email(), z.literal("")]).optional(),
  // Purpose of visit — free text in the patient's own words.
  service: z.string().trim().min(2).max(300),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((d) => !Number.isNaN(new Date(`${d}T12:00:00Z`).getTime()), "Invalid date"),
  // Dropdown slot ("5:30 PM") or a manually typed time ("6:45 pm") —
  // canonicalised to "6:45 PM" and range-checked against clinic hours.
  timeSlot: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((s) => s.replace(/\s+/g, " "))
    .refine((s) => parseSlotMinutes(s) !== null, "Please pick a valid time slot")
    .transform((s) => minutesToSlotLabel(parseSlotMinutes(s) as number)),
  message: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the highlighted fields.", details: z.flattenError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, phone, email, service, date, timeSlot, message } = parsed.data;

    // Reject past dates and closed days.
    const today = clinicTodayStr();
    if (date < today) {
      return NextResponse.json(
        { error: "Please choose today or a future date for your appointment." },
        { status: 400 }
      );
    }
    if (isClosedDay(date)) {
      return NextResponse.json(
        { error: "The clinic is closed on that day. Please pick another day." },
        { status: 400 }
      );
    }

    // Clinic hours: 5:00 PM – 12:00 AM (custom times must stay inside).
    const requested = parseSlotMinutes(timeSlot) as number;
    if (requested < CLINIC_OPEN_MIN || requested >= CLINIC_CLOSE_MIN) {
      return NextResponse.json(
        { error: "The clinic opens at 5:00 PM — please choose a time between 5:00 PM and 12:00 AM." },
        { status: 400 }
      );
    }

    // Overlap guard: every appointment occupies a 30-minute window, so a new
    // booking (dropdown or custom time) must not fall inside an existing one.
    const sameDay = await db.appointment.findMany({
      where: { date, status: { not: "CANCELLED" } },
      select: { timeSlot: true },
    });
    const conflict = sameDay.some((a) => {
      const m = parseSlotMinutes(a.timeSlot);
      return m !== null && Math.abs(m - requested) < SLOT_MINUTES;
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Sorry, that time is too close to another booking. Please choose another slot." },
        { status: 409 }
      );
    }

    // Daily token number — the patient's queue position for that day (shown
    // as 001, 002, … and reset every day). The (date, tokenNumber) unique
    // index makes simultaneous bookings race-safe: on the rare collision we
    // simply retry with the next free number of the day.
    await ensureAppointmentTokenSchema();

    type CreatedAppointment = Awaited<ReturnType<typeof db.appointment.create>>;
    let appointment: CreatedAppointment | null = null;
    let tokenNumber = 0;
    for (let attempt = 0; attempt < 5 && !appointment; attempt += 1) {
      const last = await db.appointment.findFirst({
        where: { date },
        orderBy: { tokenNumber: "desc" },
        select: { tokenNumber: true },
      });
      tokenNumber = (last?.tokenNumber ?? 0) + 1;
      try {
        appointment = await db.appointment.create({
          data: {
            name,
            phone,
            email: email ? email : null,
            service,
            date,
            timeSlot,
            message: message ? message : null,
            tokenNumber,
          },
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          continue; // another booking took this number first — take the next
        }
        throw err;
      }
    }
    if (!appointment) {
      return NextResponse.json(
        { error: "Booking is taking longer than expected — please try again in a moment." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        appointment: {
          id: appointment.id,
          tokenNumber: appointment.tokenNumber,
          name: appointment.name,
          service: appointment.service,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          status: appointment.status,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/appointments failed:", err);
    return NextResponse.json(
      { error: "Something went wrong while booking. Please try again or call us directly." },
      { status: 500 }
    );
  }
}

/* ------------------------------ GET /api/appointments ----------------------------- */
// Admin endpoint - list appointments with filters + status counts.
// Queue rule: first come, first served — whoever booked first sits on top.

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    await ensureAppointmentTokenSchema();

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") || "";
    const q = (sp.get("q") || "").trim();
    const date = sp.get("date") || "";
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(5, parseInt(sp.get("pageSize") || "20", 10) || 20));

    // "003" / "3" — a pure number also matches the day's token number.
    const tokenQuery = /^\d{1,4}$/.test(q) ? parseInt(q, 10) : null;

    const where: Record<string, unknown> = {};
    if (status && ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status;
    }
    if (date) where.date = date;
    if (q) {
      const or: Record<string, unknown>[] = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { service: { contains: q } },
      ];
      if (tokenQuery && tokenQuery > 0) or.push({ tokenNumber: tokenQuery });
      where.OR = or;
    }

    // Token lookups answer "who is at reception right now" — today's patients
    // come first, then upcoming days, then the most recent past. Every other
    // search keeps the oldest-first queue order.
    const isTokenLookup = Boolean(tokenQuery && tokenQuery > 0);

    let appointments: Array<Record<string, unknown>>;
    if (isTokenLookup) {
      // Raw SQL so the ordering can be relative to "today" (Prisma's orderBy
      // cannot express date comparisons). All values are parameterised.
      const conds: string[] = [];
      const args: (string | number)[] = [];
      if (where.status) {
        conds.push(`"status" = ?`);
        args.push(status);
      }
      if (date) {
        conds.push(`"date" = ?`);
        args.push(date);
      }
      const like = `%${q}%`;
      conds.push(`("name" LIKE ? OR "phone" LIKE ? OR "service" LIKE ? OR "tokenNumber" = ?)`);
      args.push(like, like, like, tokenQuery as number);
      const whereSql = `WHERE ${conds.join(" AND ")}`;
      const today = clinicTodayStr();

      appointments = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM "Appointment" ${whereSql}
         ORDER BY CASE WHEN "date" = ? THEN 0 WHEN "date" > ? THEN 1 ELSE 2 END ASC,
                  CASE WHEN "date" > ? THEN "date" ELSE '9999-12-31' END ASC,
                  CASE WHEN "date" < ? THEN "date" ELSE '0000-01-01' END DESC,
                  "tokenNumber" ASC, "createdAt" ASC
         LIMIT ? OFFSET ?`,
        ...args,
        today,
        today,
        today,
        today,
        pageSize,
        (page - 1) * pageSize
      );
      // Raw rows carry epoch-ms datetimes — restore the ISO strings that the
      // Prisma branch returns so both shapes stay identical for the client.
      for (const row of appointments) {
        row.createdAt = new Date(row.createdAt as number).toISOString();
        row.updatedAt = new Date(row.updatedAt as number).toISOString();
      }
    } else {
      appointments = await db.appointment.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      db.appointment.count({ where }),
      db.appointment.count({ where: { status: "PENDING" } }),
      db.appointment.count({ where: { status: "CONFIRMED" } }),
      db.appointment.count({ where: { status: "COMPLETED" } }),
      db.appointment.count({ where: { status: "CANCELLED" } }),
    ]);

    return NextResponse.json({
      appointments,
      total,
      page,
      pageSize,
      counts: { total, pending, confirmed, completed, cancelled },
    });
  } catch (err) {
    console.error("GET /api/appointments failed:", err);
    return NextResponse.json({ error: "Failed to load appointments." }, { status: 500 });
  }
}
