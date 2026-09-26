"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/clinic/reveal";
import { scrollToSection } from "@/components/clinic/scroll";
import { WhatsAppIcon } from "@/components/clinic/whatsapp-icon";
import { CLINIC, MAPS_URL } from "@/lib/clinic";
import { handleWhatsAppClick } from "@/lib/whatsapp";
import { SERVICES } from "@/lib/services-content";

const EXPLORE_LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "FAQs", id: "faq" },
  { label: "Contact", id: "contact" },
] as const;

const COLUMN_HEAD =
  "text-[11px] font-bold uppercase tracking-[0.24em] text-primary/70";

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground";

/** WhatsApp gets its own brand-green chip so the link is instantly recognizable. */
const WA_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white ring-1 ring-[#25D366]/40 transition-colors group-hover:bg-[#1fb857]";

/**
 * Footer — a clean light-theme close that matches the site's warm palette,
 * with the brand mark, clinic tagline, treatment links, explore links and
 * contact details (NAP identical everywhere on the site).
 */
export function Footer() {
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
        className="pointer-events-none absolute inset-x-0 bottom-[-0.3em] select-none whitespace-nowrap text-center font-display text-[17vw] font-medium italic leading-none text-primary/[0.05] sm:text-[13vw]"
      >
        your smile, our responsibility.
      </p>

      <div className="relative mx-auto max-w-6xl px-4 pb-[92px] pt-14 sm:px-6 sm:pt-16 md:pb-12">
        <div className="grid gap-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-[1.25fr_0.55fr_0.9fr_1fr]">
          {/* Brand */}
          <Reveal className="sm:col-span-2 lg:col-span-1">
            <div>
              <img
                src="/logo.png"
                alt="Punjab Dental Surgery logo"
                width={960}
                height={766}
                className="h-auto w-24 drop-shadow-[0_10px_24px_rgba(18,88,143,0.22)] sm:w-32"
              />
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Gentle, honest dentistry for your whole family — from routine
                checkups to braces and implants, right here in Johar Town.
              </p>
              <p dir="rtl" lang="ur" className="mt-3 text-left text-sm text-primary/80">
                {CLINIC.taglineUr}
              </p>
            </div>
          </Reveal>

          {/* Explore */}
          <Reveal delay={0.06}>
            <nav aria-label="Footer navigation">
              <h3 className={COLUMN_HEAD}>Explore</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {EXPLORE_LINKS.map((link) => (
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
                <li>
                  <Link
                    href="/privacy"
                    className="group inline-flex items-center gap-1 text-foreground/70 transition-colors hover:text-primary"
                  >
                    Privacy Policy
                    <ArrowUpRight
                      className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                      aria-hidden
                    />
                  </Link>
                </li>
              </ul>
            </nav>
          </Reveal>

          {/* Treatments — internal links to detail pages */}
          <Reveal delay={0.09}>
            <nav aria-label="Treatments">
              <h3 className={COLUMN_HEAD}>Treatments</h3>
              <ul className="mt-5 space-y-2.5 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group inline-flex items-center gap-1 text-foreground/70 transition-colors hover:text-primary"
                    >
                      {s.navTitle}
                      <ArrowUpRight
                        className="size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
                        aria-hidden
                      />
                    </Link>
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
                    onClick={handleWhatsAppClick}
                    className="group flex items-center gap-3 text-foreground/75 transition-colors hover:text-primary"
                  >
                    <span className={WA_CHIP}>
                      <WhatsAppIcon className="size-4" aria-hidden />
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
                    className="group flex items-start gap-3 text-foreground/75 transition-colors hover:text-primary"
                  >
                    <span className={ICON_CHIP}>
                      <MapPin className="size-4" aria-hidden />
                    </span>
                    <span className="font-medium">{CLINIC.address}</span>
                  </a>
                </li>
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Open every day · 5:00 PM – 12:00 AM
              </p>
            </div>
          </Reveal>
        </div>

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
