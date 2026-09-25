"use client";

import { ArrowRight, Baby, Gem, Sparkles, Stethoscope, Activity, Smile } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { SERVICE_NAMES } from "@/lib/clinic";

/** Six featured treatments shown as a quiet icon grid — no photos, no clutter. */
const FEATURED = [
  {
    icon: Stethoscope,
    service: SERVICE_NAMES[0], // General Dental Checkup
    desc: "Complete examination and honest diagnosis",
  },
  {
    icon: Sparkles,
    service: SERVICE_NAMES[1], // Teeth Cleaning & Scaling
    desc: "Gentle cleaning for healthy gums",
  },
  {
    icon: Activity,
    service: SERVICE_NAMES[3], // Root Canal Treatment
    desc: "Save an infected tooth, pain-free",
  },
  {
    icon: Smile,
    service: SERVICE_NAMES[6], // Braces & Orthodontics
    desc: "Straighten teeth, for all ages",
  },
  {
    icon: Gem,
    service: SERVICE_NAMES[5], // Teeth Whitening
    desc: "A brighter smile in one visit",
  },
  {
    icon: Baby,
    service: SERVICE_NAMES[9], // Kids Dentistry
    desc: "Careful, friendly care for children",
  },
] as const;

export function Services() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <section id="services" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="Services"
          title="Everything your teeth need, in one place"
          subtitle="From routine checkups to complete treatments — all done carefully, at fair prices."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((item, i) => (
            <Reveal key={item.service} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => openBooking(item.service)}
                className="group flex h-full w-full flex-col items-start rounded-2xl border border-border/70 bg-card p-6 text-left transition-all duration-300 hover:border-primary/40 hover:shadow-[0_10px_30px_rgb(18,88,143,0.08)]"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {item.service}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Book
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
            Also offering many more treatments —{" "}
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              book an appointment for a free consultation
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
