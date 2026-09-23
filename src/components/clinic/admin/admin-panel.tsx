"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  Eye,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PinGate } from "@/components/clinic/admin/pin-gate";
import { OverviewTab } from "@/components/clinic/admin/overview-tab";
import { AppointmentsTab } from "@/components/clinic/admin/appointments-tab";
import { VisitorsTab } from "@/components/clinic/admin/visitors-tab";
import {
  adminFetch,
  SESSION_PIN_KEY,
  type AdminStats,
} from "@/components/clinic/admin/types";
import { CLINIC } from "@/lib/clinic";

/* ------------------------------ PIN lifecycle ----------------------------- */

export function AdminPanel() {
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState<string | null>(null);

  /* Restore a previously verified PIN from sessionStorage. */
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_PIN_KEY);
    if (!stored) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: stored }),
        });
        if (!cancelled) {
          if (res.ok) setPin(stored);
          else sessionStorage.removeItem(SESSION_PIN_KEY);
        }
      } catch {
        if (!cancelled) sessionStorage.removeItem(SESSION_PIN_KEY);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_PIN_KEY);
    setPin(null);
  }, []);

  const onUnauthorized = useCallback(() => {
    sessionStorage.removeItem(SESSION_PIN_KEY);
    setPin(null);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-6 animate-spin text-primary" aria-hidden />
          <p className="text-sm">Checking admin session…</p>
        </div>
      </div>
    );
  }

  if (!pin) return <PinGate onVerified={setPin} />;

  return <AdminShell pin={pin} onLogout={logout} onUnauthorized={onUnauthorized} onExit={() => { window.location.href = "/"; }} />;
}

/* -------------------------------- Admin shell ------------------------------ */

interface AdminShellProps {
  pin: string;
  onLogout: () => void;
  onUnauthorized: () => void;
  onExit: () => void;
}

function AdminShell({ pin, onLogout, onUnauthorized, onExit }: AdminShellProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const loadStats = useCallback(async () => {
    const res = await adminFetch<AdminStats>("/api/admin/stats", pin, onUnauthorized);
    if (res) setStats(res);
    setStatsLoading(false);
  }, [pin, onUnauthorized]);

  /* Manual refresh (event handlers). */
  const manualRefresh = useCallback(() => {
    setStatsLoading(true);
    void loadStats();
  }, [loadStats]);

  /* Initial load + auto-refresh every 60s. */
  useEffect(() => {
    void adminFetch<AdminStats>("/api/admin/stats", pin, onUnauthorized).then((res) => {
      if (res) setStats(res);
      setStatsLoading(false);
    });
    const interval = setInterval(() => {
      setStatsLoading(true);
      void loadStats();
    }, 60_000);
    return () => clearInterval(interval);
  }, [pin, onUnauthorized, loadStats]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0c3054] via-[#0e3d68] to-[#12588f] text-sky-50 shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-white">Admin Panel</p>
              <p className="truncate text-[11px] text-sky-300">{CLINIC.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 text-sky-100 hover:bg-white/10 hover:text-white"
              onClick={manualRefresh}
              disabled={statsLoading}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw className={statsLoading ? "size-5 animate-spin" : "size-5"} aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-full px-3 text-sky-100 hover:bg-white/10 hover:text-white"
              onClick={onLogout}
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <Button
              size="sm"
              className="h-10 rounded-full bg-white px-3 text-primary hover:bg-sky-50 sm:px-4"
              onClick={onExit}
            >
              <ShieldCheck className="size-4" aria-hidden />
              <span className="hidden sm:inline">Back to </span>Website
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="no-scrollbar mb-5 flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted p-1.5 sm:w-auto sm:justify-center">
            <TabsTrigger
              value="overview"
              className="min-h-10 shrink-0 gap-1.5 rounded-xl px-4 data-[state=active]:shadow-none"
            >
              <LayoutDashboard className="size-4" aria-hidden />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="min-h-10 shrink-0 gap-1.5 rounded-xl px-4 data-[state=active]:shadow-none"
            >
              <CalendarCheck className="size-4" aria-hidden />
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="visitors"
              className="min-h-10 shrink-0 gap-1.5 rounded-xl px-4 data-[state=active]:shadow-none"
            >
              <Eye className="size-4" aria-hidden />
              Visitors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <OverviewTab stats={stats} loading={statsLoading} onRefresh={manualRefresh} />
          </TabsContent>
          <TabsContent value="appointments" className="mt-0">
            <AppointmentsTab pin={pin} onUnauthorized={onUnauthorized} onDataChanged={manualRefresh} />
          </TabsContent>
          <TabsContent value="visitors" className="mt-0">
            <VisitorsTab stats={stats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
