"use client";

import Link from "next/link";
import { ArrowRight, Baby, Gem, Sparkles, Stethoscope, Activity, Smile } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { SERVICE_NAMES } from "@/lib/clinic";
import { SERVICES } from "@/lib/services-content";

/** Service detail page slugs by bookable service name. */
const SERVICE_SLUGS = Object.fromEntries(
  SERVICES.map((s) => [s.name, s.slug])
);

/** Six featured treatments shown as a quiet icon grid — each links to its
 *  own detail page, and the Book button pre-selects it in the wizard. */
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
    desc: "Save an infected tooth with gentle care",
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

/** The remaining treatments actually provided at the clinic. */
const ALSO_OFFERED = [
  SERVICE_NAMES[2], // Tooth Filling
  SERVICE_NAMES[4], // Tooth Extraction
  SERVICE_NAMES[7], // Dental Implants
  SERVICE_NAMES[8], // Crown & Bridge
  SERVICE_NAMES[10], // Emergency Dental Care
];

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
          {FEATURED.map((item, i) => {
            const slug = SERVICE_SLUGS[item.service];
            return (
              <Reveal key={item.service} delay={i * 0.06}>
                <div className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_10px_30px_rgb(18,88,143,0.08)]">
                  <Link
                    href={`/services/${slug}`}
                    className="flex-1 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label={`Learn more about ${item.service}`}
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                      <item.icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      {item.service}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">
                      Details
                      <ArrowRight
                        className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openBooking(item.service)}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-secondary/60 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Book
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
            Also offering: {ALSO_OFFERED.join(" · ")} —{" "}
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 transition-colors hover:underline"
            >
              book an appointment for a free consultation
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </p>
          <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-relaxed text-muted-foreground/80">
            The consultation with the doctor is free. If any treatment is
            needed, it is explained and quoted upfront before it starts — you
            only go ahead if you are comfortable.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
