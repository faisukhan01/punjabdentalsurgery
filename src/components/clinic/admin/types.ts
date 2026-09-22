/** Shared types for the admin panel — mirrors the API contract from Task 3. */

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface AdminAppointment {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  date: string;
  timeSlot: string;
  message: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCounts {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface AppointmentListResponse {
  appointments: AdminAppointment[];
  total: number;
  page: number;
  pageSize: number;
  counts: AppointmentCounts;
}

export interface AdminStats {
  generatedAt: string;
  clinicToday: string;
  appointments: {
    total: number;
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
    todayBookings: number;
    todaysAppointments: number;
    last7days: { date: string; bookings: number }[];
    topServices: { service: string; count: number }[];
  };
  visits: {
    total: number;
    unique: number;
    today: number;
    todayUnique: number;
    last7days: { date: string; visits: number; unique: number }[];
    devices: { mobile: number; desktop: number; tablet: number };
  };
  recentAppointments: AdminAppointment[];
}

export const SESSION_PIN_KEY = "pds_admin_pin";

/** Fetch wrapper that attaches the admin PIN header and handles 401s. */
export async function adminFetch<T>(
  url: string,
  pin: string,
  onUnauthorized: () => void,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": pin,
        ...(init?.headers ?? {}),
      },
    });
    if (res.status === 401) {
      onUnauthorized();
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Tailwind classes per status badge (teal/amber/green/red — never blue). */
export const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  PENDING: "border-amber-200 bg-amber-100 text-amber-800",
  CONFIRMED: "border-teal-200 bg-teal-100 text-teal-800",
  COMPLETED: "border-green-200 bg-green-100 text-green-700",
  CANCELLED: "border-red-200 bg-red-100 text-red-700",
};

export function formatDayLabel(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
