"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC, getOpenStatus, type OpenStatus } from "@/lib/clinic";

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Hero — real treatment footage behind a cinematic scrim, editorial
 * typography (vertically centered on mobile, anchored bottom-left on
 * desktop) and a slim hairline info strip along the bottom edge on
 * desktop. Mobile gets a glass status chip + two stacked full-width
 * actions above the sticky booking bar instead.
 */
export function Hero() {
  const openBooking = useClinicStore((s) => s.openBooking);
  // Computed after mount (Karachi clock) to avoid hydration mismatch.
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

  const statusDot = status?.open ? (
    <span className="relative flex size-2" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
    </span>
  ) : (
    <span className="inline-flex size-2 rounded-full bg-amber-300" aria-hidden />
  );

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* Background video — real dental treatment, no faces */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      {/* Neutral cinematic scrim — light touch, video stays clear */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent"
        aria-hidden
      />

      {/* Editorial copy — centered on mobile for balance, bottom-left on desktop */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } } }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-36 pt-24 text-center sm:justify-end sm:px-6 sm:pb-44 sm:pt-32 sm:text-left"
      >
        {/* Live open-status glass chip (mobile only — desktop strip carries it) */}
        <motion.p variants={item} className="mb-6 flex justify-center sm:mb-8 sm:hidden">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-[0_8px_24px_rgb(0,0,0,0.25)] backdrop-blur-md">
            {statusDot}
            <span className="text-white/95">
              {status ? status.label : "Open every day · 5:00 PM – 12:00 AM"}
            </span>
          </span>
        </motion.p>

        <motion.p
          variants={item}
          className="hidden items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70 sm:flex"
        >
          <span className="h-px w-10 bg-white/50" aria-hidden />
          Punjab Dental Surgery · Johar Town, Lahore
        </motion.p>

        <motion.h1
          variants={item}
          className="mx-auto mt-4 max-w-3xl font-display text-[2.7rem] font-semibold leading-[1.1] tracking-[-0.01em] text-balance text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.5)] sm:mx-0 sm:mt-5 sm:text-6xl sm:leading-[1.06] lg:text-[4.4rem]"
        >
          Where{" "}
          <em className="bg-gradient-to-br from-[#fff3d6] via-[#f7d489] to-[#e5a44a] bg-clip-text font-bold italic text-transparent drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            beautiful smiles
          </em>{" "}
          begin.
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/85 sm:mx-0 sm:max-w-lg sm:text-lg"
        >
          Kind, painless dentistry for your whole family — honest advice, careful
          treatment and a calm, comfortable visit, every time.
        </motion.p>

        <motion.div variants={item} className="mt-3 flex justify-center sm:justify-start">
          <p dir="rtl" lang="ur" className="text-[15px] text-amber-50/70">
            {CLINIC.taglineUr}
          </p>
        </motion.div>

        {/* Actions — stacked full-width pills on mobile, inline on desktop */}
        <motion.div
          variants={item}
          className="mt-9 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-7"
        >
          <Button
            size="lg"
            className="h-13 w-full rounded-full bg-white text-base font-semibold text-primary shadow-[0_16px_40px_rgb(0,0,0,0.35)] hover:bg-sky-50 sm:w-auto sm:px-8"
            onClick={() => openBooking()}
          >
            <CalendarCheck className="size-5" aria-hidden />
            Book Appointment
          </Button>
          <a
            href={CLINIC.phoneHref}
            className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full border border-white/30 bg-white/10 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:h-12 sm:w-auto sm:border-0 sm:bg-transparent sm:px-2 sm:font-semibold sm:backdrop-blur-none"
          >
            <Phone className="size-4" aria-hidden />
            {CLINIC.phone}
          </a>
        </motion.div>
      </motion.div>

      {/* Hairline info strip — desktop only (mobile has chip + floating bar) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-0 z-10 hidden border-t border-white/15 bg-black/40 backdrop-blur-sm sm:block"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-white/15 px-6">
          <div className="flex items-center gap-2.5 px-2 py-3.5">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              {statusDot}
              {status ? status.label : "Clinic hours"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-3.5">
            <MapPin className="size-3.5 shrink-0 text-white/50" aria-hidden />
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              {CLINIC.address}
            </span>
          </div>
          <a
            href={CLINIC.phoneHref}
            className="flex items-center gap-2.5 px-2 py-3.5 transition-colors hover:bg-white/5"
          >
            <Phone className="size-3.5 shrink-0 text-white/50" aria-hidden />
            <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              {CLINIC.phone}
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
