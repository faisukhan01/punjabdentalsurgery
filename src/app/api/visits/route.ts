import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/* ---------------------------------- POST /api/visits ------------------------------ */
// Public endpoint - records one website visit event for the admin analytics.
// The client sends an anonymous sessionId (UUID kept in localStorage).

const visitSchema = z.object({
  sessionId: z.string().trim().min(8).max(64),
});

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet";
  if (/mobi|iphone|android|phone/.test(s)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = visitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    await db.visit.create({
      data: {
        sessionId: parsed.data.sessionId,
        device: detectDevice(ua),
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/visits failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
