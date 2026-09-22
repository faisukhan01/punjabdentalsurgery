import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminPin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/* ------------------------------- POST /api/admin/verify ---------------------------- */
// Verifies the admin PIN and returns a session token the dashboard keeps in memory.

const schema = z.object({ pin: z.string().min(1).max(32) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success || parsed.data.pin !== getAdminPin()) {
      return NextResponse.json({ ok: false, error: "Incorrect PIN." }, { status: 401 });
    }
    return NextResponse.json({ ok: true, pin: parsed.data.pin });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
