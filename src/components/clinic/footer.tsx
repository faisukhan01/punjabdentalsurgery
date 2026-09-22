"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarCheck,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/clinic/reveal";
import { scrollToSection } from "@/components/clinic/scroll";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC, getOpenStatus, type OpenStatus } from "@/lib/clinic";

const LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${CLINIC.name} ${CLINIC.address}`
)}`;

const COLUMN_HEAD =
  "text-[11px] font-bold uppercase tracking-[0.24em] text-red-300/70";

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-red-300 transition-colors group-hover:border-red-400/40 group-hover:text-red-200";

/**
 * Footer — a cinematic near-black close to the page: glowing red ribbon
 * hairline across the top, ambient crimson glows, a giant italic
 * "beautiful smiles." watermark and a live open/closed status band with a
 * one-tap booking button.
 */
export function Footer() {
  const openBooking = useClinicStore((s) => s.openBooking);
  // Live status computed after mount (Karachi clock) to avoid hydration mismatch.
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      if (!cancelled) setStatus(getOpenStatus());
    };
    const initial = setTimeout(update, 0);
    const t = setInterval(update, 60_000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0f0708] text-red-50">
      {/* Ambient scene — ribbon hairline, top light, glows, giant watermark */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#1e0f12_0%,#150a0c_45%,#0f0708_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c2323b] to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(194,50,59,0.13),transparent)]"
      />
      <div
        aria-hidden
        className="absolute -left-28 top-20 size-80 rounded-full bg-[#c2323b]/[0.12] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-28 size-[26rem] rounded-full bg-[#c2323b]/[0.07] blur-3xl"
      />
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-0.3em] select-none whitespace-nowrap text-center font-display text-[19vw] font-medium italic leading-none text-white/[0.04] sm:text-[15vw]"
      >
        beautiful smiles.
      </p>

      <div className="relative mx-auto max-w-6xl px-4 pb-[92px] pt-14 sm:px-6 sm:pt-16 md:pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.6fr_1fr] lg:gap-8">
          {/* Brand */}
          <Reveal className="md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt=""
                  aria-hidden
                  className="size-12 drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
                />
                <div>
                  <p className="font-display text-lg font-semibold leading-tight text-white">
                    {CLINIC.name}
                  </p>
                  <p className="text-xs text-red-100/55">
                    {CLINIC.doctor} · {CLINIC.qualifications}
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-red-100/65">
                Gentle, honest and painless dentistry for your whole family — from
                routine checkups to braces and implants.
              </p>
              <p dir="rtl" lang="ur" className="mt-3 text-sm text-red-200/75">
                {CLINIC.taglineUr}
              </p>
            </div>
          </Reveal>

          {/* Explore */}
          <Reveal delay={0.06}>
            <nav aria-label="Footer navigation">
              <h3 className={COLUMN_HEAD}>Explore</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className="group inline-flex items-center gap-1 text-red-100/70 transition-colors hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.12}>
            <div>
              <h3 className={COLUMN_HEAD}>Contact</h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href={CLINIC.phoneHref}
                    className="group flex items-center gap-3 text-red-100/75 transition-colors hover:text-white"
                  >
                    <span className={ICON_CHIP}>
                      <Phone className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium">{CLINIC.phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={CLINIC.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-red-100/75 transition-colors hover:text-white"
                  >
                    <span className={ICON_CHIP}>
                      <MessageCircle className="size-4" aria-hidden />
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      WhatsApp
                      <ArrowUpRight
                        className="size-3.5 text-red-300/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-red-100/75 transition-colors hover:text-white"
                  >
                    <span className={ICON_CHIP}>
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium">{CLINIC.address}</span>
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Live hours band — status dot + one-tap booking */}
        <Reveal delay={0.08}>
          <div className="mt-12 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
            <div className="min-w-0">
              <p className="flex items-center gap-2.5 text-[15px] font-semibold text-white">
                <span className="relative flex size-2 shrink-0" aria-hidden>
                  {status?.open ? (
                    <>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                    </>
                  ) : (
                    <span className="inline-flex size-2 rounded-full bg-white/40" />
                  )}
                </span>
                {status ? status.label : "Open everyday"}
              </p>
              <p className="mt-1.5 pl-[18px] text-[13px] text-red-100/60">
                Everyday · 5:00 PM – 12:00 AM
              </p>
            </div>
            <Button
              onClick={() => openBooking()}
              className="h-11 w-full rounded-full bg-white px-6 text-[15px] font-semibold text-red-950 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-red-50 sm:w-auto sm:shrink-0"
            >
              <CalendarCheck className="size-5" aria-hidden />
              Book Appointment
            </Button>
          </div>
        </Reveal>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-red-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {CLINIC.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
