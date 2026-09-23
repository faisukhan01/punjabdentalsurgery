"use client";

import type { ComponentType } from "react";
import {
  Activity,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Smartphone,
  Users,
  XCircle,
  Hourglass,
  RefreshCw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/clinic/reveal";
import {
  BookingsChart,
  VisitsChart,
} from "@/components/clinic/admin/charts";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatDateTime,
  type AdminStats,
  type AppointmentStatus,
} from "@/components/clinic/admin/types";
import { cn } from "@/lib/utils";

interface OverviewTabProps {
  stats: AdminStats | null;
  loading: boolean;
  onRefresh: () => void;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tint,
  suffix,
  decimals,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  tint: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(18,88,143,0.06)] sm:p-5">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-9 items-center justify-center rounded-xl", tint)}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="font-display text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
        <CountUp to={value} decimals={decimals} duration={1.1} />
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </p>
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
      {sub && <p className="-mt-1 text-[11px] text-muted-foreground/80">{sub}</p>}
    </div>
  );
}

export function OverviewTab({ stats, loading, onRefresh }: OverviewTabProps) {
  if (!stats) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  const a = stats.appointments;
  const v = stats.visits;
  const mobileShare = v.total > 0 ? Math.round((v.devices.mobile / v.total) * 100) : 0;
  const maxService = Math.max(1, ...a.topServices.map((s) => s.count));

  return (
    <div className="flex flex-col gap-6">
      {/* Refresh row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Auto-refreshes every 60s • updated{" "}
            {formatDateTime(stats.generatedAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden />
          Refresh
        </Button>
      </div>

      {/* Appointments stats */}
      <section aria-label="Appointment statistics">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Appointments
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard icon={CalendarCheck} label="Total Appointments" value={a.total} tint="bg-secondary text-primary" />
          <StatCard icon={CalendarDays} label="Today's Bookings" value={a.todayBookings} tint="bg-secondary text-primary" />
          <StatCard icon={Clock3} label="Appointments Today" value={a.todaysAppointments} tint="bg-secondary text-primary" />
          <StatCard icon={Hourglass} label="Pending" value={a.PENDING} tint="bg-amber-100 text-amber-700" />
          <StatCard icon={CheckCircle2} label="Confirmed" value={a.CONFIRMED} tint="bg-red-100 text-red-700" />
          <StatCard icon={CheckCircle2} label="Completed" value={a.COMPLETED} tint="bg-green-100 text-green-700" />
          <StatCard icon={XCircle} label="Cancelled" value={a.CANCELLED} tint="bg-red-100 text-red-600" />
        </div>
      </section>

      {/* Visits stats */}
      <section aria-label="Website traffic statistics">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Website Traffic
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard icon={Activity} label="Total Visits" value={v.total} tint="bg-secondary text-primary" />
          <StatCard icon={Users} label="Unique Visitors" value={v.unique} tint="bg-secondary text-primary" />
          <StatCard icon={Eye} label="Today's Visits" value={v.today} tint="bg-secondary text-primary" />
          <StatCard icon={Smartphone} label="Mobile Share" value={mobileShare} suffix="%" tint="bg-accent text-accent-foreground" />
        </div>
      </section>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(18,88,143,0.06)] sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Bookings (Last 7 Days)</h3>
          <BookingsChart data={a.last7days} />
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(18,88,143,0.06)] sm:p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Website Visits (Last 7 Days)</h3>
          <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-600" aria-hidden /> Visits
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-600" aria-hidden /> Unique
            </span>
          </div>
          <VisitsChart data={v.last7days} />
        </div>
      </div>

      {/* Top services + recent bookings */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(18,88,143,0.06)] sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Top Services</h3>
          {a.topServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {a.topServices.map((s) => (
                <li key={s.service} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-foreground">{s.service}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{s.count}</span>
                  </div>
                  <Progress
                    value={(s.count / maxService) * 100}
                    className="h-2 [&>div]:bg-primary"
                    aria-label={`${s.service}: ${s.count} bookings`}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(18,88,143,0.06)] sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Bookings</h3>
          {stats.recentAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {stats.recentAppointments.map((appt) => (
                <li key={appt.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{appt.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {appt.service} • {formatDay(appt.date)} at {appt.timeSlot}
                    </p>
                  </div>
                  <StatusBadge status={appt.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", STATUS_BADGE_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function formatDay(dateStr: string): string {
  try {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}
