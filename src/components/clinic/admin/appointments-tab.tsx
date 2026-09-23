"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  adminFetch,
  formatDateTime,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  type AdminAppointment,
  type AppointmentListResponse,
  type AppointmentStatus,
} from "@/components/clinic/admin/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type StatusFilter = "ALL" | AppointmentStatus;

const FILTERS: { value: StatusFilter; label: string; countKey: keyof AppointmentListResponse["counts"] }[] = [
  { value: "ALL", label: "All", countKey: "total" },
  { value: "PENDING", label: "Pending", countKey: "pending" },
  { value: "CONFIRMED", label: "Confirmed", countKey: "confirmed" },
  { value: "COMPLETED", label: "Completed", countKey: "completed" },
  { value: "CANCELLED", label: "Cancelled", countKey: "cancelled" },
];

interface AppointmentsTabProps {
  pin: string;
  onUnauthorized: () => void;
  /** Notifies the shell to refetch dashboard stats (after create/update/delete). */
  onDataChanged: () => void;
}

export function AppointmentsTab({ pin, onUnauthorized, onDataChanged }: AppointmentsTabProps) {
  const { toast } = useToast();

  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AppointmentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAppointment | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  /* Debounce search input → q (400ms). Also resets paging + loading. */
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
      setLoading(true);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* Builds the list endpoint URL from current filters. */
  const listUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    if (date) params.set("date", date);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    return `/api/appointments?${params.toString()}`;
  }, [status, q, date, page]);

  /* Sequence guard so out-of-order responses never overwrite newer data. */
  const fetchIdRef = useRef(0);

  /** Refetch used from event handlers (refresh button, after mutations). */
  const fetchList = useCallback(async () => {
    const id = ++fetchIdRef.current;
    const res = await adminFetch<AppointmentListResponse>(listUrl(), pin, onUnauthorized);
    if (fetchIdRef.current !== id) return;
    if (res) setData(res);
    setLoading(false);
  }, [listUrl, pin, onUnauthorized]);

  /* Effect-driven fetch whenever filters or page change. */
  useEffect(() => {
    const id = ++fetchIdRef.current;
    void adminFetch<AppointmentListResponse>(listUrl(), pin, onUnauthorized).then((res) => {
      if (fetchIdRef.current !== id) return;
      if (res) setData(res);
      setLoading(false);
    });
  }, [listUrl, pin, onUnauthorized]);

  /* --------------------------- Status actions --------------------------- */

  const patchStatus = async (appt: AdminAppointment, next: AppointmentStatus) => {
    setActionId(appt.id);
    const res = await adminFetch<{ ok: boolean; appointment: AdminAppointment }>(
      `/api/appointments/${appt.id}`,
      pin,
      onUnauthorized,
      { method: "PATCH", body: JSON.stringify({ status: next }) }
    );
    setActionId(null);
    if (res?.ok) {
      toast({
        title: `Marked as ${STATUS_LABELS[next]}`,
        description: `${appt.name} — ${appt.service} on ${appt.date}.`,
      });
      setLoading(true);
      void fetchList();
      onDataChanged();
    } else {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update this appointment. Please try again.",
      });
    }
  };

  const deleteAppointment = async (appt: AdminAppointment) => {
    setActionId(appt.id);
    const res = await adminFetch<{ ok: boolean }>(
      `/api/appointments/${appt.id}`,
      pin,
      onUnauthorized,
      { method: "DELETE" }
    );
    setActionId(null);
    if (res?.ok) {
      toast({
        title: "Appointment deleted",
        description: `${appt.name} — ${appt.service} was permanently removed.`,
      });
      setDeleteTarget(null);
      setLoading(true);
      void fetchList();
      onDataChanged();
    } else {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete this appointment. Please try again.",
      });
    }
  };

  /* Wipe every appointment + visitor record (demo/seed data cleanup). */
  const clearAllData = async () => {
    setClearing(true);
    const res = await adminFetch<{ ok: boolean; deleted: { appointments: number; visits: number } }>(
      "/api/admin/reset",
      pin,
      onUnauthorized,
      { method: "POST" }
    );
    setClearing(false);
    if (res?.ok) {
      toast({
        title: "All data cleared",
        description: `${res.deleted.appointments} appointment(s) and ${res.deleted.visits} visitor record(s) removed.`,
      });
      setConfirmClear(false);
      setLoading(true);
      void fetchList();
      onDataChanged();
    } else {
      toast({
        variant: "destructive",
        title: "Clear failed",
        description: "Could not clear the data. Please try again.",
      });
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const counts = data?.counts;

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, phone or service…"
              aria-label="Search appointments"
              className="h-11 rounded-full pl-10 pr-4"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                  setLoading(true);
                }}
                aria-label="Filter by date"
                className="h-11 rounded-full pr-9 sm:w-44"
              />
              {date && (
                <button
                  type="button"
                  onClick={() => {
                    setDate("");
                    setPage(1);
                    setLoading(true);
                  }}
                  aria-label="Clear date filter"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-11 shrink-0 rounded-full"
              onClick={() => {
                setLoading(true);
                void fetchList();
              }}
              disabled={loading}
              aria-label="Refresh list"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} aria-hidden />
            </Button>
            {Boolean(data && data.total > 0) && (
              <Button
                variant="outline"
                className="h-11 shrink-0 rounded-full border-destructive/40 px-4 text-destructive hover:bg-red-50 hover:text-destructive"
                onClick={() => setConfirmClear(true)}
                disabled={clearing}
                aria-label="Clear all appointments and visitor records"
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="hidden sm:inline">Clear all</span>
              </Button>
            )}
          </div>
        </div>

        {/* Status filter chips */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {FILTERS.map((f) => {
            const active = status === f.value;
            const count = counts?.[f.countKey] ?? 0;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatus(f.value);
                  setPage(1);
                  setLoading(true);
                }}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_18px_rgb(18,88,143,0.3)]"
                    : "border-border bg-card text-foreground/80 hover:bg-secondary"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                    active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading && !data ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-3xl" />
          ))}
        </div>
      ) : !data || data.appointments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card/60 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Inbox className="size-7" aria-hidden />
          </span>
          <p className="font-display text-lg font-semibold text-foreground">
            No appointments found
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {q || date || status !== "ALL"
              ? "Try clearing the search or filters to see more results."
              : "New bookings from the website will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {data.appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                busy={actionId === appt.id}
                onStatus={(next) => void patchStatus(appt, next)}
                onDelete={() => setDeleteTarget(appt)}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[0_8px_30px_rgb(18,88,143,0.06)] md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="pl-5">Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.appointments.map((appt) => (
                  <TableRow key={appt.id} className="align-top">
                    <TableCell className="pl-5">
                      <p className="font-semibold text-foreground">{appt.name}</p>
                      <a
                        href={`tel:${appt.phone.replace(/\s/g, "")}`}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Phone className="size-3" aria-hidden />
                        {appt.phone}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-40 text-sm">{appt.service}</TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium">{prettyDay(appt.date)}</p>
                      <p className="text-xs text-muted-foreground">{appt.timeSlot}</p>
                    </TableCell>
                    <TableCell className="max-w-48">
                      {appt.message ? (
                        <p className="truncate text-xs text-muted-foreground" title={appt.message}>
                          <MessageSquareText className="mr-1 inline size-3" aria-hidden />
                          {appt.message}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(appt.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={appt.status} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <RowActions
                        appt={appt}
                        busy={actionId === appt.id}
                        onStatus={(next) => void patchStatus(appt, next)}
                        onDelete={() => setDeleteTarget(appt)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.total > data.pageSize && (
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/60 bg-card px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-full"
                disabled={page <= 1 || loading}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  setLoading(true);
                }}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Prev
              </Button>
              <p className="text-sm font-medium tabular-nums text-muted-foreground">
                Page {page} of {totalPages}
                <span className="ml-2 hidden sm:inline">({data.total} total)</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-full"
                disabled={page >= totalPages || loading}
                onClick={() => {
                  setPage((p) => p + 1);
                  setLoading(true);
                }}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Clear-all confirmation */}
      <AlertDialog
        open={confirmClear}
        onOpenChange={(open) => !open && !clearing && setConfirmClear(false)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear ALL data?</AlertDialogTitle>
            <AlertDialogDescription>
              Every appointment and visitor record will be permanently deleted — this is meant for
              removing demo/test data and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 rounded-full" disabled={clearing}>
              Keep my data
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              disabled={clearing}
              onClick={(e) => {
                e.preventDefault();
                void clearAllData();
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {clearing ? "Clearing…" : "Clear everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  <span className="font-semibold text-foreground">{deleteTarget.name}</span> —{" "}
                  {deleteTarget.service} on {deleteTarget.date} at {deleteTarget.timeSlot} will be
                  permanently removed. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 rounded-full">Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              disabled={actionId !== null}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) void deleteAppointment(deleteTarget);
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              {actionId ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------ Sub-components ------------------------------ */

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant="outline" className={cn("shrink-0", STATUS_BADGE_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function prettyDay(dateStr: string): string {
  try {
    return format(parseISO(`${dateStr}T12:00:00`), "EEE, d MMM yyyy");
  } catch {
    return dateStr;
  }
}

interface RowActionsProps {
  appt: AdminAppointment;
  busy: boolean;
  onStatus: (next: AppointmentStatus) => void;
  onDelete: () => void;
}

function RowActions({ appt, busy, onStatus, onDelete }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full"
          disabled={busy}
          aria-label={`Actions for ${appt.name}`}
        >
          {busy ? (
            <RefreshCw className="size-4 animate-spin" aria-hidden />
          ) : (
            <MoreHorizontal className="size-4" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-2xl">
        <DropdownMenuItem
          disabled={appt.status === "CONFIRMED"}
          onClick={() => onStatus("CONFIRMED")}
        >
          <CheckCircle2 className="size-4 text-primary" aria-hidden />
          Confirm
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={appt.status === "COMPLETED"}
          onClick={() => onStatus("COMPLETED")}
        >
          <CalendarDays className="size-4 text-green-600" aria-hidden />
          Mark Completed
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={appt.status === "CANCELLED"}
          onClick={() => onStatus("CANCELLED")}
        >
          <X className="size-4 text-amber-600" aria-hidden />
          Cancel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" aria-hidden />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AppointmentCardProps {
  appt: AdminAppointment;
  busy: boolean;
  onStatus: (next: AppointmentStatus) => void;
  onDelete: () => void;
}

function AppointmentCard({ appt, busy, onStatus, onDelete }: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const longMessage = (appt.message?.length ?? 0) > 72;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-[0_8px_30px_rgb(18,88,143,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{appt.name}</p>
          <a
            href={`tel:${appt.phone.replace(/\s/g, "")}`}
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary"
          >
            <Phone className="size-3" aria-hidden />
            {appt.phone}
          </a>
        </div>
        <RowActions appt={appt} busy={busy} onStatus={onStatus} onDelete={onDelete} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground/85">{appt.service}</span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" aria-hidden />
          {prettyDay(appt.date)} • {appt.timeSlot}
        </span>
      </div>

      {appt.message && (
        <div className="mt-2.5 rounded-2xl bg-muted/60 p-2.5 text-xs leading-relaxed text-muted-foreground">
          <p className={cn(!expanded && "line-clamp-2")}>{appt.message}</p>
          {longMessage && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 font-semibold text-primary"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
        <StatusBadge status={appt.status} />
        <p className="text-[11px] text-muted-foreground/80">
          Booked {formatDateTime(appt.createdAt)}
        </p>
      </div>
    </div>
  );
}
