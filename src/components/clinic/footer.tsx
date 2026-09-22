"use client";

import { Lock } from "lucide-react";
import { scrollToSection } from "@/components/clinic/scroll";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

const LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

/** Minimal footer — brand line, quick links, small print. */
export function Footer() {
  const setView = useClinicStore((s) => s.setView);

  return (
    <footer className="mt-auto bg-red-950 text-red-50">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-[92px] sm:px-6 md:pb-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* Brand */}
          <div>
            <p className="font-display text-lg font-semibold text-white">{CLINIC.name}</p>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-red-100/70">
              {CLINIC.doctor} ({CLINIC.qualifications}) · {CLINIC.tagline}
            </p>
            <p dir="rtl" lang="ur" className="mt-1.5 text-sm text-red-200/80">
              {CLINIC.taglineUr}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-red-100/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="text-sm text-red-100/80">
            <p>{CLINIC.phone}</p>
            <p className="mt-1">{CLINIC.address}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-red-800/60 pt-6 text-xs text-red-200/60 sm:flex-row sm:items-center">
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
