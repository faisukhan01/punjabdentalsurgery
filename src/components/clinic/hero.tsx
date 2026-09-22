"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC, getOpenStatus, type OpenStatus } from "@/lib/clinic";

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const TRUST = [
  { icon: ShieldCheck, label: "Sterilized & safe" },
  { icon: HeartHandshake, label: "Painless treatment" },
  { icon: Clock, label: "Same-day appointments" },
] as const;

/**
 * Hero — cinematic clinic video behind a smart gradient (dark on the text
 * side, scene visible on the other), editorial content on the left and a
 * floating glass clinic card with live open/closed status on the right.
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
    // Deferred (not synchronous in effect body) to avoid cascading renders.
    const initial = setTimeout(update, 0);
    const t = setInterval(update, 60_000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(t);
    };
  }, []);

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
        aria-hidden
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      {/* Smart overlay — frosted on the text side, scene stays visible */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/10 max-md:from-white/88 max-md:via-white/70 max-md:to-white/45"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:pb-16 lg:pt-20">
        {/* Copy */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
        >
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-900 shadow-sm backdrop-blur-sm"
          >
            <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden />
            Rated 4.9 by local families
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-6 max-w-xl font-display text-[2.6rem] font-semibold leading-[1.08] text-balance text-teal-950 sm:text-6xl"
          >
            Better care.{" "}
            <em className="font-medium italic text-primary">Brighter smiles.</em>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-md text-base leading-relaxed text-teal-950/70 sm:text-lg"
          >
            {CLINIC.doctor} ({CLINIC.qualifications}) — gentle, honest dentistry for your whole
            family.
          </motion.p>

          <motion.p
            variants={item}
            dir="rtl"
            lang="ur"
            className="mt-3 text-base text-teal-900"
          >
            {CLINIC.taglineUr}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              size="lg"
              className="h-12 w-full rounded-full px-8 text-base font-semibold shadow-[0_12px_32px_rgb(13,148,136,0.4)] sm:w-auto"
              onClick={() => openBooking()}
            >
              <CalendarCheck className="size-5" aria-hidden />
              Book Appointment
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 w-full rounded-full border-teal-900/15 bg-white/70 px-8 text-base font-semibold text-teal-950 shadow-sm backdrop-blur-sm hover:bg-white hover:text-teal-950 sm:w-auto"
            >
              <a href={CLINIC.phoneHref}>
                <Phone className="size-5" aria-hidden />
                Call Now
              </a>
            </Button>
          </motion.div>

          {/* Quiet trust row — icons only, no boxes */}
          <motion.ul
            variants={item}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5"
          >
            {TRUST.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm font-medium text-teal-950/75">
                <t.icon className="size-4 text-primary" aria-hidden />
                {t.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Floating glass clinic card */}
        <motion.aside
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md justify-self-center rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_24px_60px_rgb(15,60,70,0.14)] backdrop-blur-xl lg:justify-self-end"
          aria-label="Clinic information"
        >
          {/* Doctor */}
          <div className="flex items-center gap-4">
            <img
              src="/images/doctor.png"
              alt=""
              className="size-14 rounded-full border-2 border-white object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold text-teal-950">
                {CLINIC.doctor}
              </p>
              <p className="text-sm text-teal-900/70">{CLINIC.qualifications} · Dental Surgeon</p>
            </div>
          </div>

          <div className="my-5 h-px bg-teal-950/10" aria-hidden />

          {/* Live status */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-sm font-medium text-teal-950">
              <Clock className="size-4.5 text-primary" aria-hidden />
              {status ? (
                status.label
              ) : (
                <span className="inline-block h-4 w-40 animate-pulse rounded-full bg-teal-950/15" aria-hidden />
              )}
            </span>
            {status ? (
              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  status.open
                    ? "bg-emerald-500/15 text-emerald-700"
                    : "bg-teal-950/8 text-teal-900/80"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    status.open ? "bg-emerald-600" : "bg-teal-900/50"
                  }`}
                  aria-hidden
                />
                {status.open ? "Open" : "Closed"}
              </span>
            ) : null}
          </div>

          {/* Address */}
          <div className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-teal-950/75">
            <MapPin className="mt-0.5 size-4.5 shrink-0 text-primary" aria-hidden />
            {CLINIC.address}
          </div>

          <Button
            className="mt-6 h-12 w-full rounded-full text-[15px] font-semibold"
            onClick={() => openBooking()}
          >
            <CalendarCheck className="size-5" aria-hidden />
            Book Appointment
          </Button>
        </motion.aside>
      </div>
    </section>
  );
}
