import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import {
  SERVICE_NAMES,
  TIME_SLOTS,
  clinicTodayStr,
  isClosedDay,
} from "@/lib/clinic";

export const dynamic = "force-dynamic";

/* ----------------------------- POST /api/appointments ----------------------------- */
// Public endpoint - patients submit a booking request.

const createSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,16}$/, "Please enter a valid phone number"),
  email: z.union([z.email(), z.literal("")]).optional(),
  service: z.enum(SERVICE_NAMES),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((d) => !Number.isNaN(new Date(`${d}T12:00:00Z`).getTime()), "Invalid date"),
  timeSlot: z.enum(TIME_SLOTS),
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
        { error: "The clinic is closed on Sundays. Please pick another day." },
        { status: 400 }
      );
    }

    // Prevent double-booking of the same slot (cancelled appointments free the slot).
    const clash = await db.appointment.findFirst({
      where: { date, timeSlot, status: { not: "CANCELLED" } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { error: "Sorry, that time slot has just been booked. Please choose another slot." },
        { status: 409 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        name,
        phone,
        email: email ? email : null,
        service,
        date,
        timeSlot,
        message: message ? message : null,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        appointment: {
          id: appointment.id,
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

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") || "";
    const q = (sp.get("q") || "").trim();
    const date = sp.get("date") || "";
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(5, parseInt(sp.get("pageSize") || "20", 10) || 20));

    const where: Record<string, unknown> = {};
    if (status && ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
      where.status = status;
    }
    if (date) where.date = date;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { service: { contains: q } },
      ];
    }

    const [appointments, total, pending, confirmed, completed, cancelled] = await Promise.all([
      db.appointment.findMany({
        where,
        orderBy: [{ date: "desc" }, { timeSlot: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
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
