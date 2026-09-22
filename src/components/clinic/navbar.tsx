"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { CLINIC } from "@/lib/clinic";

const NAV_LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

/**
 * Navbar — fixed over the hero video: transparent with white text at the
 * top of the page, turning into a solid porcelain bar once scrolled.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openBooking = useClinicStore((s) => s.openBooking);
  const setView = useClinicStore((s) => s.setView);

  useEffect(() => {
    let cancelled = false;
    const onScroll = () => {
      if (!cancelled) setScrolled(window.scrollY > 32);
    };
    // Deferred initial check — avoids synchronous setState in the effect body.
    const initial = setTimeout(onScroll, 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelled = true;
      clearTimeout(initial);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (id: string) => {
    setMenuOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-teal-950/50 to-transparent"
      )}
    >
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
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              scrolled ? "bg-primary text-primary-foreground" : "bg-white/15 text-white backdrop-blur-sm"
            )}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
              <path d="M12 2C9.5 2 8.6 3.2 7 3.2 4.8 3.2 3 5.4 3 8.6c0 2.5.8 4 1.6 6.2.6 1.7.8 4.6 1.7 6 .6.9 1.7.7 2.1-.3.5-1.2.9-3.6 1.6-5 .4-.8 1.2-.8 1.6 0 .7 1.4 1.1 3.8 1.6 5 .4 1 1.5 1.2 2.1.3.9-1.4 1.1-4.3 1.7-6C17.4 12.6 21 11 21 8.6 21 5.4 19.2 3.2 17 3.2c-1.6 0-2.5-1.2-5-1.2Z" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className={cn(
                "truncate font-display text-[17px] font-semibold tracking-tight transition-colors",
                scrolled ? "text-foreground" : "text-white"
              )}
            >
              Punjab Dental Surgery
            </span>
            <span
              className={cn(
                "hidden truncate text-[11px] font-medium transition-colors sm:block",
                scrolled ? "text-muted-foreground" : "text-white/60"
              )}
            >
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
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  scrolled
                    ? "text-foreground/75 hover:bg-secondary hover:text-foreground"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                )}
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
            className={cn(
              "size-10 transition-colors",
              scrolled
                ? "text-muted-foreground hover:text-foreground"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
            aria-label="Admin panel"
            title="Admin panel"
            onClick={() => setView("admin")}
          >
            <Lock className="size-[18px]" aria-hidden />
          </Button>

          <Button
            size="sm"
            className={cn(
              "hidden h-10 rounded-full px-5 transition-colors sm:inline-flex",
              scrolled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-white text-teal-950 shadow-lg hover:bg-teal-50"
            )}
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
                className={cn(
                  "size-10 rounded-xl transition-colors lg:hidden",
                  scrolled
                    ? "border-border bg-transparent text-foreground"
                    : "border-white/30 bg-white/10 text-white"
                )}
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
