"use client";

import { Eye, Info, Monitor, Smartphone, Tablet, Users } from "lucide-react";
import { VisitsChart } from "@/components/clinic/admin/charts";
import type { AdminStats } from "@/components/clinic/admin/types";

interface VisitorsTabProps {
  stats: AdminStats | null;
}

const DEVICES = [
  { key: "mobile", label: "Mobile", icon: Smartphone, tint: "bg-secondary text-primary" },
  { key: "desktop", label: "Desktop", icon: Monitor, tint: "bg-accent text-accent-foreground" },
  { key: "tablet", label: "Tablet", icon: Tablet, tint: "bg-muted text-muted-foreground" },
] as const;

export function VisitorsTab({ stats }: VisitorsTabProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
    );
  }

  const v = stats.visits;
  const statsRow = [
    { icon: Eye, label: "Total Visits", value: v.total },
    { icon: Users, label: "Unique Visitors", value: v.unique },
    { icon: Eye, label: "Visits Today", value: v.today },
    { icon: Users, label: "Unique Today", value: v.todayUnique },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statsRow.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3.5 rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(156,28,35,0.06)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <s.icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
                {s.value.toLocaleString("en-US")}
              </p>
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(156,28,35,0.06)] sm:p-5">
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

      {/* Device breakdown */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Devices
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DEVICES.map((device) => {
            const count = v.devices[device.key];
            const pct = v.total > 0 ? Math.round((count / v.total) * 100) : 0;
            return (
              <div
                key={device.key}
                className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-[0_8px_30px_rgb(156,28,35,0.06)]"
              >
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${device.tint}`}>
                  <device.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-2xl font-semibold tabular-nums text-foreground">
                    {pct}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {device.label} • {count.toLocaleString("en-US")} visit
                    {count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:p-5">
        <Info className="mt-0.5 size-4.5 shrink-0 text-amber-500" aria-hidden />
        <p>
          <span className="font-semibold">How tracking works:</span> unique visitors are counted
          once per device (an anonymous ID stored in the browser). Repeat visits from the same
          device within 30 minutes are not double-counted. Tracking starts when the site is
          deployed publicly.
        </p>
      </div>
    </div>
  );
}
