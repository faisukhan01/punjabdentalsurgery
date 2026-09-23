"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { SiteView } from "@/components/clinic/site-view";
import { AdminPanel } from "@/components/clinic/admin/admin-panel";
import { useClinicStore } from "@/components/clinic/store";

const VISIT_INTERVAL_MS = 30 * 60 * 1000; // at most one visit event per 30 minutes

export default function Home() {
  const view = useClinicStore((s) => s.view);

  /* Anonymous visit tracking — fire and forget, throttled per tab session. */
  useEffect(() => {
    try {
      let sessionId = localStorage.getItem("pds_vid");
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("pds_vid", sessionId);
      }
      const last = Number(sessionStorage.getItem("pds_visit_ts") || 0);
      const now = Date.now();
      if (Number.isFinite(last) && now - last < VISIT_INTERVAL_MS) return;
      sessionStorage.setItem("pds_visit_ts", String(now));
      void fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    } catch {
      // Storage may be unavailable (private mode) — silently skip tracking.
    }
  }, []);

  return view === "admin" ? <AdminPanel /> : <SiteView />;
}
