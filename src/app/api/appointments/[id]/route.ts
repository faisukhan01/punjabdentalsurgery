import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, unauthorized } from "@/lib/admin";
import { APPOINTMENT_STATUSES } from "@/lib/clinic";

export const dynamic = "force-dynamic";

/* --------------------------- PATCH /api/appointments/[id] -------------------------- */
// Admin endpoint - update an appointment's status.

const patchSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const existing = await db.appointment.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ ok: true, appointment });
  } catch (err) {
    console.error("PATCH /api/appointments/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update appointment." }, { status: 500 });
  }
}

/* --------------------------- DELETE /api/appointments/[id] ------------------------- */
// Admin endpoint - permanently remove an appointment record.

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const { id } = await params;
    const existing = await db.appointment.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }
    await db.appointment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/appointments/[id] failed:", err);
    return NextResponse.json({ error: "Failed to delete appointment." }, { status: 500 });
  }
}
