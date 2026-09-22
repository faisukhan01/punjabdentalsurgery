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
 * About — the single photo section of the page: the doctor portrait,
 * a short story and four quiet proof points. Clinic hours live in the
 * footer, at the end of the page.
 */
export function About() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <section id="about" className="scroll-mt-20 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Portrait — the only image on the page */}
        <Reveal className="mx-auto w-full max-w-md lg:max-w-none">
          <figure className="relative">
            <div
              className="absolute -inset-3 rounded-[2rem] border border-primary/15"
              aria-hidden
            />
            <img
              src="/images/doctor.png"
              alt={`Portrait of ${CLINIC.doctor}, ${CLINIC.qualifications}`}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-[1.75rem] object-cover shadow-[0_24px_60px_rgb(88,18,24,0.18)]"
            />
          </figure>
        </Reveal>

        {/* Copy */}
        <div>
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
            <ul className="mt-7 space-y-3.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-[15px] font-medium text-foreground/85">{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
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
      </div>
    </section>
  );
}
