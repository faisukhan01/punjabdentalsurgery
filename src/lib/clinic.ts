// Shared clinic configuration - single source of truth for both frontend and backend.

export const CLINIC = {
  name: "Punjab Dental Surgery",
  shortName: "PDS",
  doctor: "Dr. Muhammad Siddique",
  qualifications: "BDS, RDS",
  tagline: "Your smile, our responsibility",
  taglineUr: "آپ کی مسکراہٹ، ہماری ذمہ داری",
  phone: "+92 333 4313672",
  phoneHref: "tel:+923334313672",
  whatsapp: "https://wa.me/923334313672",
  address: "Johar Town, Lahore",
  email: "info@punjabdentalsurgery.com",
  // Open every day, evening shift only (5 PM – midnight).
  hours: [{ days: "Everyday", time: "5:00 PM – 12:00 AM" }],
} as const;

// Bookable time slots (must match clinic hours above).
export const TIME_SLOTS = [
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
  "11:30 PM",
] as const;

// Services offered (canonical names stored in the DB for bookings).
export const SERVICE_NAMES = [
  "General Dental Checkup",
  "Teeth Cleaning & Scaling",
  "Tooth Filling",
  "Root Canal Treatment",
  "Tooth Extraction",
  "Teeth Whitening",
  "Braces & Orthodontics",
  "Dental Implants",
  "Crown & Bridge",
  "Kids Dentistry",
  "Emergency Dental Care",
] as const;

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/* ---------- Timezone helpers (clinic runs on Asia/Karachi, UTC+5, no DST) ---------- */

export const KARACHI_OFFSET_MS = 5 * 60 * 60 * 1000;

/** Current date in clinic timezone as YYYY-MM-DD. */
export function clinicTodayStr(now: Date = new Date()): string {
  return new Date(now.getTime() + KARACHI_OFFSET_MS).toISOString().slice(0, 10);
}

/** Start of "today" in clinic timezone, expressed as a UTC Date (for range queries). */
export function clinicDayStartUTC(dateStr: string): Date {
  return new Date(new Date(`${dateStr}T00:00:00.000Z`).getTime() - KARACHI_OFFSET_MS);
}

/** Clinic opens every day - no closed days. Kept for future schedules. */
export function isClosedDay(_dateStr: string): boolean {
  return false;
}

/* ---------- Live open/closed status (for the hero clinic card) ---------- */

const DAY_SESSIONS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[1020, 1440]], // Sunday — 5:00 PM – 12:00 AM
  [[1020, 1440]], // Monday
  [[1020, 1440]], // Tuesday
  [[1020, 1440]], // Wednesday
  [[1020, 1440]], // Thursday
  [[1020, 1440]], // Friday
  [[1020, 1440]], // Saturday
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatMinutes(m: number): string {
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  if (h24 === 24) return "12:00 AM"; // midnight close
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(min).padStart(2, "0")} ${ampm}`;
}

export interface OpenStatus {
  open: boolean;
  /** Human-readable status, e.g. "Open now · closes 2:00 PM". */
  label: string;
}

/** Live open/closed state for the clinic, computed in Asia/Karachi time. */
export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const k = new Date(now.getTime() + KARACHI_OFFSET_MS);
  const day = k.getUTCDay();
  const mins = k.getUTCHours() * 60 + k.getUTCMinutes();

  const today = DAY_SESSIONS[day];

  // Inside an open session right now?
  for (const [start, end] of today) {
    if (mins >= start && mins < end) {
      return { open: true, label: `Open now · closes ${formatMinutes(end)}` };
    }
  }
  // Opening later today?
  for (const [start] of today) {
    if (mins < start) {
      return { open: false, label: `Opens today at ${formatMinutes(start)}` };
    }
  }
  // Opening on a following day?
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const next = DAY_SESSIONS[d];
    if (next.length > 0) {
      const when = i === 1 ? "tomorrow" : DAY_NAMES[d];
      return { open: false, label: `Opens ${when} at ${formatMinutes(next[0][0])}` };
    }
  }
  return { open: false, label: "Closed" };
}
