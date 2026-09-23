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
 * bottom-left typography and a slim hairline info strip along the bottom
 * edge (live open status · address · phone). No cards, no pills, no clutter.
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

      {/* Editorial copy — anchored bottom-left */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.13, delayChildren: 0.25 } } }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-40 pt-32 sm:px-6 sm:pb-44"
      >
        <motion.p
          variants={item}
          className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70"
        >
          <span className="h-px w-10 bg-white/50" aria-hidden />
          Punjab Dental Surgery
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-5 max-w-3xl font-display text-[2.75rem] font-semibold leading-[1.04] text-balance text-white sm:text-6xl lg:text-[4.5rem]"
        >
          Gentle dentistry,{" "}
          <em
            className="font-bold italic text-[#12588f] [text-shadow:0_2px_24px_rgba(255,255,255,0.55),0_0_10px_rgba(255,255,255,0.4)]"
          >
            beautiful smiles.
          </em>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-md text-base leading-relaxed text-white/75 sm:text-lg"
        >
          Honest, painless dental care for your whole family.
        </motion.p>

        <motion.div variants={item} className="mt-3 flex">
          <p dir="rtl" lang="ur" className="text-[15px] text-amber-50/70">
            {CLINIC.taglineUr}
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7"
        >
          <Button
            size="lg"
            className="h-12 w-full rounded-full bg-white px-8 text-base font-semibold text-primary shadow-[0_16px_40px_rgb(0,0,0,0.35)] hover:bg-sky-50 sm:w-auto"
            onClick={() => openBooking()}
          >
            <CalendarCheck className="size-5" aria-hidden />
            Book Appointment
          </Button>
          <a
            href={CLINIC.phoneHref}
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            <Phone className="size-4" aria-hidden />
            {CLINIC.phone}
          </a>
        </motion.div>
      </motion.div>

      {/* Hairline info strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-black/40 backdrop-blur-sm"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/15 px-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
          <div className="flex items-center gap-2.5 px-4 py-3 sm:px-2 sm:py-3.5">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
              <span className="relative flex size-1.5" aria-hidden>
                {status?.open ? (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                  </>
                ) : (
                  <span className="inline-flex size-1.5 rounded-full bg-white/50" />
                )}
              </span>
              {status ? status.label : "Clinic hours"}
            </span>
          </div>
          <div className="hidden items-center gap-2.5 px-2 py-3.5 sm:flex">
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
