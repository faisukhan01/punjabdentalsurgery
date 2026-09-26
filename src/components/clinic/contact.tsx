"use client";

import { CalendarCheck, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { WhatsAppIcon } from "@/components/clinic/whatsapp-icon";
import { CLINIC, MAPS_URL } from "@/lib/clinic";
import { handleWhatsAppClick } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const DETAILS = [
  {
    icon: Phone,
    chip: "bg-secondary text-primary",
    label: "Call us",
    value: CLINIC.phone,
    href: CLINIC.phoneHref,
    external: false,
  },
  {
    icon: WhatsAppIcon,
    chip: "bg-[#25D366] text-white",
    label: "WhatsApp",
    value: "Chat with the clinic",
    href: CLINIC.whatsapp,
    external: true,
    isWhatsApp: true,
  },
  {
    icon: MapPin,
    chip: "bg-secondary text-primary",
    label: "Visit us",
    value: CLINIC.address,
    href: MAPS_URL,
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
                onClick={"isWhatsApp" in item ? handleWhatsAppClick : undefined}
                className="flex h-full flex-col items-start gap-3 rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    item.chip
                  )}
                >
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
          <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#10406b] via-[#0c3054] to-[#0a2946] px-6 py-14 text-center sm:px-12 sm:py-16">
            {/* Soft glows + hairline ring + logo watermark */}
            <div
              className="pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-sky-400/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-teal-300/10 blur-3xl"
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
              className="pointer-events-none absolute -right-10 -top-12 size-48 opacity-[0.1]"
            />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200/90">
                Book Your Visit
              </p>
              <p className="mt-3 font-display text-3xl font-semibold text-balance text-white sm:text-4xl">
                Ready for a healthier smile?
              </p>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-sky-50/85">
                Book online in under a minute — choose your service, pick a time, and we will see
                you soon.
              </p>
              <Button
                size="lg"
                className="mt-8 h-12 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-[0_16px_40px_rgb(0,0,0,0.35)] hover:bg-sky-50"
                onClick={() => openBooking()}
              >
                <CalendarCheck className="size-5" aria-hidden />
                Book Appointment Online
              </Button>
              <p dir="rtl" lang="ur" className="mt-6 text-sm text-sky-100/60">
                {CLINIC.taglineUr}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
