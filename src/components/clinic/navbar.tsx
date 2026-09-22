"use client";

import { useState } from "react";
import { CalendarCheck, Lock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useClinicStore } from "@/components/clinic/store";
import { scrollToSection } from "@/components/clinic/scroll";
import { CLINIC } from "@/lib/clinic";

const NAV_LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

/** Simple, airy sticky navbar — logo, four links, one primary action. */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openBooking = useClinicStore((s) => s.openBooking);
  const setView = useClinicStore((s) => s.setView);

  const go = (id: string) => {
    setMenuOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex min-h-11 items-center gap-2.5 text-left"
          aria-label="Back to top"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
              <path d="M12 2C9.5 2 8.6 3.2 7 3.2 4.8 3.2 3 5.4 3 8.6c0 2.5.8 4 1.6 6.2.6 1.7.8 4.6 1.7 6 .6.9 1.7.7 2.1-.3.5-1.2.9-3.6 1.6-5 .4-.8 1.2-.8 1.6 0 .7 1.4 1.1 3.8 1.6 5 .4 1 1.5 1.2 2.1.3.9-1.4 1.1-4.3 1.7-6C17.4 12.6 21 11 21 8.6 21 5.4 19.2 3.2 17 3.2c-1.6 0-2.5-1.2-5-1.2Z" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-display text-[17px] font-semibold tracking-tight text-foreground">
              Punjab Dental Surgery
            </span>
            <span className="hidden truncate text-[11px] font-medium text-muted-foreground sm:block">
              {CLINIC.doctor} · {CLINIC.qualifications}
            </span>
          </span>
        </button>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => go(link.id)}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground hover:text-foreground"
            aria-label="Admin panel"
            title="Admin panel"
            onClick={() => setView("admin")}
          >
            <Lock className="size-[18px]" aria-hidden />
          </Button>

          <Button
            size="sm"
            className="hidden h-10 rounded-full px-5 sm:inline-flex"
            onClick={() => openBooking()}
          >
            <CalendarCheck className="size-4" aria-hidden />
            Book Appointment
          </Button>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-xl lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 rounded-l-2xl p-0">
              <SheetHeader className="border-b border-border/60 p-5 text-left">
                <SheetTitle className="font-display text-base font-semibold">
                  Punjab Dental Surgery
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => go(link.id)}
                    className="min-h-11 rounded-xl px-4 text-left text-[15px] font-medium text-foreground/85 transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="mt-3 border-t border-border/60 pt-4">
                  <Button
                    className="h-11 w-full rounded-xl"
                    onClick={() => {
                      setMenuOpen(false);
                      openBooking();
                    }}
                  >
                    <CalendarCheck className="size-4" aria-hidden />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
