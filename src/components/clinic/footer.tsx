"use client";

import { Clock, Lock, MapPin, MessageCircle, Phone } from "lucide-react";
import { scrollToSection } from "@/components/clinic/scroll";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

const COLUMN_HEAD =
  "text-[11px] font-bold uppercase tracking-[0.24em] text-red-200/70";

/**
 * Footer — brand mark, quick links, contact details and the clinic hours
 * (timings intentionally live here, at the very end of the page).
 */
export function Footer() {
  const setView = useClinicStore((s) => s.setView);

  return (
    <footer className="mt-auto bg-red-950 text-red-50">
      <div className="mx-auto max-w-6xl px-4 pb-[92px] pt-16 sm:px-6 md:pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.25fr_0.7fr_1fr_1.15fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt={`${CLINIC.name} logo`}
                className="size-12 drop-shadow-[0_6px_16px_rgba(0,0,0,0.35)]"
              />
              <div>
                <p className="font-display text-lg font-semibold leading-tight text-white">
                  {CLINIC.name}
                </p>
                <p className="text-xs text-red-100/60">
                  {CLINIC.doctor} · {CLINIC.qualifications}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-red-100/70">
              Gentle, honest and painless dentistry for your whole family — from routine checkups
              to braces and implants.
            </p>
            <p dir="rtl" lang="ur" className="mt-3 text-sm text-red-200/80">
              {CLINIC.taglineUr}
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <h3 className={COLUMN_HEAD}>Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-red-100/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className={COLUMN_HEAD}>Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={CLINIC.phoneHref}
                  className="inline-flex items-start gap-2.5 text-red-100/75 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-red-200/60" aria-hidden />
                  {CLINIC.phone}
                </a>
              </li>
              <li>
                <a
                  href={CLINIC.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2.5 text-red-100/75 transition-colors hover:text-white"
                >
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-red-200/60" aria-hidden />
                  WhatsApp the clinic
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-red-100/75">
                <MapPin className="mt-0.5 size-4 shrink-0 text-red-200/60" aria-hidden />
                {CLINIC.address}
              </li>
            </ul>
          </div>

          {/* Clinic hours — kept at the end of the page */}
          <div>
            <h3 className={COLUMN_HEAD}>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-3.5" aria-hidden />
                Clinic Hours
              </span>
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              {CLINIC.hours.map((row) => (
                <div
                  key={row.days}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5"
                >
                  <dt className="text-red-100/75">{row.days}</dt>
                  <dd
                    className={
                      row.time === "Closed"
                        ? "font-medium text-amber-200/90"
                        : "text-red-50/85"
                    }
                  >
                    {row.time}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-red-200/60 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => setView("admin")}
            className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-white md:min-h-0"
          >
            <Lock className="size-3.5" aria-hidden />
            Admin Panel
          </button>
        </div>
      </div>
    </footer>
  );
}
