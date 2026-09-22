"use client";

import { create } from "zustand";

export type ClinicView = "site" | "admin";

interface ClinicStore {
  /** Whether the booking wizard dialog is open. */
  bookingOpen: boolean;
  /** Service name to pre-select in the booking wizard (null = none). */
  preselectedService: string | null;
  /** Which top-level app view is visible. */
  view: ClinicView;
  openBooking: (service?: string) => void;
  closeBooking: () => void;
  setView: (view: ClinicView) => void;
}

export const useClinicStore = create<ClinicStore>((set) => ({
  bookingOpen: false,
  preselectedService: null,
  view: "site",
  openBooking: (service) =>
    set({ bookingOpen: true, preselectedService: service ?? null }),
  closeBooking: () => set({ bookingOpen: false, preselectedService: null }),
  setView: (view) => set({ view }),
}));
