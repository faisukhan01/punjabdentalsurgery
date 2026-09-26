"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Menu } from "lucide-react";
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

const NAV_LINKS = [
  { label: "Services", id: "services" },
  { label: "About", id: "about" },
  { label: "Reviews", id: "reviews" },
  { label: "Contact", id: "contact" },
] as const;

/**
 * Navbar — fixed over the hero video: transparent with white text at the
 * top of the page, turning into a solid porcelain bar once scrolled.
 * Subpages (service pages, privacy) pass `solid` so the bar is always solid.
 */
export function Navbar({ solid = false }: { solid?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(solid);
  const openBooking = useClinicStore((s) => s.openBooking);

  useEffect(() => {
    let cancelled = false;
    const onScroll = () => {
      if (!cancelled) setScrolled(solid || window.scrollY > 32);
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
          : "border-b border-transparent"
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-6",
          scrolled ? "h-16" : "h-[72px] sm:h-[92px]"
        )}
        aria-label="Main navigation"
      >
        {/* Logo — transparent, big and glowing over the video; carries the full
            clinic name so no extra text is needed */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex min-h-11 items-center text-left"
          aria-label="Punjab Dental Surgery — back to top"
        >
          <img
            src="/logo.png"
            alt="Punjab Dental Surgery"
            width={960}
            height={766}
            className={cn(
              "w-auto shrink-0 transition-all duration-300",
              scrolled
                ? "h-9 sm:h-11"
                : "h-14 sm:h-20 [filter:brightness(1.06)_drop-shadow(0_2px_10px_rgba(0,0,0,0.45))_drop-shadow(0_0_22px_rgba(255,255,255,0.55))]"
            )}
          />
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
            size="sm"
            className={cn(
              "hidden h-10 rounded-full px-5 transition-colors sm:inline-flex",
              scrolled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-white text-primary shadow-lg hover:bg-sky-50"
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
