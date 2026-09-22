// Shared clinic configuration - single source of truth for both frontend and backend.

export const CLINIC = {
  name: "Punjab Dental Surgery",
  shortName: "PDS",
  doctor: "Dr. Muhammad Siddique",
  qualifications: "BDS, RDS",
  tagline: "Your smile, our responsibility",
  taglineUr: "آپ کی مسکراہٹ، ہماری ذمہ داری",
  // NOTE: Replace with the clinic's real phone number before going live.
  phone: "+92 300 1234567",
  phoneHref: "tel:+923001234567",
  whatsapp: "https://wa.me/923001234567",
  // NOTE: Replace with the clinic's real address before going live.
  address: "Main Bazaar Road, Punjab, Pakistan",
  email: "info@punjabdentalsurgery.com",
  hours: [
    { days: "Monday – Thursday", time: "10:00 AM – 2:00 PM • 5:00 PM – 9:00 PM" },
    { days: "Friday", time: "10:00 AM – 12:30 PM • 2:30 PM – 9:00 PM" },
    { days: "Saturday", time: "10:00 AM – 2:00 PM • 5:00 PM – 9:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
} as const;

// Bookable time slots (must match clinic hours above).
export const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
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

/** true if the given YYYY-MM-DD falls on a Sunday in clinic timezone (closed day). */
export function isClosedDay(dateStr: string): boolean {
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  return d.getUTCDay() === 0;
}
