"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const TRUST = ["Sterilized & Safe", "Painless Treatment", "Same-Day Appointments"] as const;

/**
 * Hero — full-screen clinic video behind a calm teal veil,
 * one headline, one supporting line, two actions. Nothing else.
 */
export function Hero() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <section id="home" className="relative flex min-h-[92svh] items-center overflow-hidden">
      {/* Background video */}
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
      <div
        className="absolute inset-0 bg-teal-950/80 bg-gradient-to-b from-teal-950/85 via-teal-900/75 to-teal-950/85"
        aria-hidden
      />

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } } }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 py-28 text-center sm:px-6"
      >
        <motion.p
          variants={item}
          className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-200"
        >
          {CLINIC.name} · Punjab, Pakistan
        </motion.p>

        <motion.h1
          variants={item}
          className="mx-auto mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.12] text-balance text-white sm:text-5xl lg:text-6xl"
        >
          Gentle dentistry for a healthy, confident smile
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-teal-50/85 sm:text-lg"
        >
          {CLINIC.doctor} ({CLINIC.qualifications}) — careful, honest treatment for your whole
          family.
        </motion.p>

        <motion.p
          variants={item}
          dir="rtl"
          lang="ur"
          className="mt-3 text-base text-teal-200/90"
        >
          {CLINIC.taglineUr}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
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
            className="h-12 w-full rounded-full border-white/35 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <a href={CLINIC.phoneHref}>
              <Phone className="size-5" aria-hidden />
              Call Now
            </a>
          </Button>
        </motion.div>

        {/* Single quiet trust line — no chips, no cards */}
        <motion.p
          variants={item}
          className="mt-10 text-sm font-medium text-teal-100/75"
        >
          {TRUST.join("  ·  ")}
        </motion.p>
      </motion.div>
    </section>
  );
}
