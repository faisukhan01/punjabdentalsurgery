"use client";

import { CalendarCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const POINTS = [
  "Graduate dental surgeon — BDS, RDS",
  "Gentle, painless treatment techniques",
  "Fully sterilized instruments & modern equipment",
  "Honest advice and affordable pricing",
] as const;

/**
 * About — quiet, editorial text section: a short story and four proof
 * points. Clinic hours live in the footer, at the end of the page.
 */
export function About() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <section id="about" className="scroll-mt-20 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">About</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance text-foreground sm:text-4xl">
            Meet {CLINIC.doctor}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            A graduate dental surgeon dedicated to careful, honest dentistry. Every patient is
            listened to first, treated gently, and charged fairly — the way dental care should
            be.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-8 grid gap-3.5 sm:grid-cols-2 sm:gap-x-8">
            {POINTS.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-card/60 px-4 py-3.5"
              >
                <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" aria-hidden />
                </span>
                <span className="text-[15px] font-medium text-foreground/85">{point}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button size="lg" className="h-12 rounded-full px-7" onClick={() => openBooking()}>
              <CalendarCheck className="size-5" aria-hidden />
              Book with {CLINIC.doctor}
            </Button>
            <p className="text-sm text-muted-foreground">
              {CLINIC.qualifications} · Licensed dental surgeon
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
