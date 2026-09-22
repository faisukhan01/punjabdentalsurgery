"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDayLabel } from "@/components/clinic/admin/types";

const RED = "#b91c1c";
const AMBER = "#d97706";

function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/70 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
            aria-hidden
          />
          <span className="capitalize">{entry.name}</span>
          <span className="font-semibold text-foreground">
            {entry.value}
            {suffix}
          </span>
        </p>
      ))}
    </div>
  );
}

interface BookingsChartProps {
  data: { date: string; bookings: number }[];
}

/** Crimson bar chart of bookings across the last 7 days. */
export function BookingsChart({ data }: BookingsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayLabel}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(185, 28, 28, 0.08)" }}
          content={<ChartTooltip suffix=" booking(s)" />}
        />
        <Bar dataKey="bookings" fill={RED} radius={[8, 8, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface VisitsChartProps {
  data: { date: string; visits: number; unique: number }[];
  height?: number;
}

/** Area chart of visits vs unique visitors across the last 7 days. */
export function VisitsChart({ data, height = 260 }: VisitsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={RED} stopOpacity={0.28} />
            <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="uniqueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AMBER} stopOpacity={0.24} />
            <stop offset="100%" stopColor={AMBER} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDayLabel}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="visits"
          stroke={RED}
          strokeWidth={2}
          fill="url(#visitsFill)"
        />
        <Area
          type="monotone"
          dataKey="unique"
          stroke={AMBER}
          strokeWidth={2}
          fill="url(#uniqueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
