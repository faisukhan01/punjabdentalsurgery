"use client";

import {
  ArrowUpRight,
  CalendarCheck,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/clinic/reveal";
import { scrollToSection } from "@/components/clinic/scroll";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${CLINIC.name} ${CLINIC.address}`
)}`;

const COLUMN_HEAD =
  "text-[11px] font-bold uppercase tracking-[0.24em] text-primary/70";

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground";

/**
 * Footer — a clean light-theme close that matches the site's warm ivory
 * palette: crimson ribbon hairline, soft blush glows, a giant italic
 * "beautiful smiles." watermark, a large brand mark and a one-tap booking
 * button.
 */
export function Footer() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <footer className="relative mt-auto overflow-hidden bg-card text-foreground">
      {/* Ambient scene — ribbon hairline, top light, glows, giant watermark */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(18,88,143,0.05),transparent)]"
      />
      <div
        aria-hidden
        className="absolute -left-28 top-16 size-80 rounded-full bg-primary/[0.05] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-24 bottom-24 size-[26rem] rounded-full bg-primary/[0.04] blur-3xl"
      />
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-0.3em] select-none whitespace-nowrap text-center font-display text-[19vw] font-medium italic leading-none text-primary/[0.05] sm:text-[15vw]"
      >
        beautiful smiles.
      </p>

      <div className="relative mx-auto max-w-6xl px-4 pb-[92px] pt-14 sm:px-6 sm:pt-16 md:pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.6fr_1fr] lg:gap-8">
          {/* Brand */}
          <Reveal className="md:col-span-2 lg:col-span-1">
            <div>
              <img
                src="/logo.png"
                alt="Punjab Dental Surgery logo"
                className="size-20 drop-shadow-[0_10px_24px_rgba(18,88,143,0.22)] sm:size-24"
              />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Gentle, honest and painless dentistry for your whole family — from
                routine checkups to braces and implants.
              </p>
              <p dir="rtl" lang="ur" className="mt-3 text-sm text-primary/80">
                {CLINIC.taglineUr}
              </p>
            </div>
          </Reveal>

          {/* Explore */}
          <Reveal delay={0.06}>
            <nav aria-label="Footer navigation">
              <h3 className={COLUMN_HEAD}>Explore</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {LINKS.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className="group inline-flex items-center gap-1 text-foreground/70 transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ArrowUpRight
                        className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.12}>
            <div>
              <h3 className={COLUMN_HEAD}>Contact</h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a
                    href={CLINIC.phoneHref}
                    className="group flex items-center gap-3 text-foreground/75 transition-colors hover:text-primary"
                  >
                    <span className={ICON_CHIP}>
                      <Phone className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium">{CLINIC.phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={CLINIC.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-foreground/75 transition-colors hover:text-primary"
                  >
                    <span className={ICON_CHIP}>
                      <MessageCircle className="size-4" aria-hidden />
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      WhatsApp
                      <ArrowUpRight
                        className="size-3.5 text-primary/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 text-foreground/75 transition-colors hover:text-primary"
                  >
                    <span className={ICON_CHIP}>
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium">{CLINIC.address}</span>
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        {/* One-tap booking */}
        <Reveal delay={0.08}>
          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => openBooking()}
              className="h-12 w-full rounded-full bg-primary px-8 text-[15px] font-semibold shadow-[0_10px_30px_rgb(18,88,143,0.3)] hover:bg-primary/90 sm:w-auto"
            >
              <CalendarCheck className="size-5" aria-hidden />
              Book Appointment
            </Button>
          </div>
        </Reveal>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-border/80 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden />
            {CLINIC.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
