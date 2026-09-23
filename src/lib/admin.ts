import { NextResponse } from "next/server";

/**
 * Lightweight admin gate for the dashboard APIs.
 * The PIN is compared against the ADMIN_PIN env var (default "1234" for development).
 * When migrating to Turso/production, swap this for NextAuth credentials —
 * every admin route already centralises the check here.
 */
export const ADMIN_PIN_HEADER = "x-admin-pin";

export function getAdminPin(): string {
  return process.env.ADMIN_PIN || "1234";
}

export function isAdminRequest(req: Request): boolean {
  const pin = req.headers.get(ADMIN_PIN_HEADER);
  return Boolean(pin) && pin === getAdminPin();
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized. Invalid or missing admin PIN." },
    { status: 401 }
  );
}
