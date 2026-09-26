"use client";

import { CalendarCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const POINTS = [
  "Comfort-first techniques — every step explained before it happens",
  "Fully sterilized instruments & modern equipment",
  "Honest advice — no treatment you do not need, no surprise charges",
  "Everything quoted upfront, in writing, before anything starts",
] as const;

/** What a visit here is actually like — real features of the clinic. */
const VISIT_FACTS = [
  {
    title: "Book in under a minute",
    desc: "Choose your service and time online — you get an instant confirmation with a PDF receipt.",
  },
  {
    title: "Your own token number",
    desc: "Every booking gets a token for the day, so there is no waiting-room confusion about whose turn it is.",
  },
  {
    title: "Open every evening",
    desc: "5:00 PM to 12:00 AM, every day of the week — after work, after school, after dinner.",
  },
  {
    title: "Direct line to the clinic",
    desc: `Call or WhatsApp ${CLINIC.phone} — questions answered before you book.`,
  },
] as const;

/**
 * About — the doctor's profile with qualifications explained, what the
 * clinic stands for, and what a visit is actually like. Only verified,
 * clinic-specific facts (per the website audit).
 */
export function About() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <section id="about" className="scroll-mt-20 bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
            About the Doctor
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance text-foreground sm:text-4xl">
            Meet {CLINIC.doctor}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            A graduate dental surgeon dedicated to careful, honest dentistry.
            Every patient is listened to first, treated gently, and charged
            fairly — the way dental care should be.
          </p>
        </Reveal>

        {/* Qualifications — explained for patients */}
        <Reveal delay={0.08}>
          <div className="mt-8 rounded-2xl border border-primary/10 bg-card p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Qualifications
            </h3>
            <dl className="mt-4 space-y-3.5 text-[15px] leading-relaxed">
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 font-bold text-primary">BDS</dt>
                <dd className="text-muted-foreground">
                  Bachelor of Dental Surgery — the professional dental degree
                  required to practice dentistry.
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 font-bold text-primary">RDS</dt>
                <dd className="text-muted-foreground">
                  Registered Dental Surgeon — registered and licensed to
                  practice dentistry in Pakistan.
                </dd>
              </div>
            </dl>
          </div>
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
                <span className="text-[15px] font-medium text-foreground/85">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* What a visit is actually like */}
        <Reveal delay={0.12}>
          <h3 className="mt-12 font-display text-xl font-semibold text-foreground sm:text-2xl">
            What a visit here is like
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {VISIT_FACTS.map((fact) => (
              <div
                key={fact.title}
                className="rounded-2xl border border-border/70 bg-card p-5"
              >
                <p className="text-[15px] font-semibold text-foreground">
                  {fact.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {fact.desc}
                </p>
              </div>
            ))}
          </div>
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
