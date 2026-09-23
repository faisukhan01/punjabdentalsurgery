"use client";

import { CalendarCheck, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const DETAILS = [
  {
    icon: Phone,
    label: "Call us",
    value: CLINIC.phone,
    href: CLINIC.phoneHref,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with the clinic",
    href: CLINIC.whatsapp,
    external: true,
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: CLINIC.address,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${CLINIC.name} ${CLINIC.address}`
    )}`,
    external: true,
  },
] as const;

/** Contact — one heading, three quiet detail cards, one call to action. */
export function Contact() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <section id="contact" className="scroll-mt-20 pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="Contact"
          title="Book your visit today"
          subtitle="Call, message or book online — we will confirm your appointment right away."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {DETAILS.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex h-full flex-col items-start gap-3 rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className="text-[15px] font-semibold leading-snug text-foreground">
                  {item.value}
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-900 via-red-950 to-red-950 px-6 py-14 text-center sm:px-12 sm:py-16">
            {/* Soft glows + hairline ring + logo watermark */}
            <div
              className="pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-red-500/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-amber-400/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-white/10"
              aria-hidden
            />
            <img
              src="/logo.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 size-48 opacity-[0.07]"
            />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-200/90">
                Book Your Visit
              </p>
              <p className="mt-3 font-display text-3xl font-semibold text-balance text-white sm:text-4xl">
                Ready for a healthier smile?
              </p>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-red-50/85">
                Book online in under a minute — choose your service, pick a time, and we will see
                you soon.
              </p>
              <Button
                size="lg"
                className="mt-8 h-12 rounded-full bg-white px-8 text-base font-semibold text-red-950 shadow-[0_16px_40px_rgb(0,0,0,0.35)] hover:bg-red-50"
                onClick={() => openBooking()}
              >
                <CalendarCheck className="size-5" aria-hidden />
                Book Appointment Online
              </Button>
              <p dir="rtl" lang="ur" className="mt-6 text-sm text-red-100/60">
                {CLINIC.taglineUr}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
