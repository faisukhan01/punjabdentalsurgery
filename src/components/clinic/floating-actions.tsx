"use client";

import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";

/** WhatsApp float (all screens) + mobile-only sticky bottom booking bar. */
export function FloatingActions() {
  const openBooking = useClinicStore((s) => s.openBooking);

  return (
    <>
      {/* WhatsApp circular float */}
      <a
        href={CLINIC.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-[92px] right-4 z-40 flex size-13 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_28px_rgb(18,88,143,0.45)] transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:size-14"
      >
        <MessageCircle className="size-6 md:size-7" aria-hidden />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40 [animation-duration:2.5s]" />
      </a>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/90 p-3 backdrop-blur-md md:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5">
          <Button
            className="h-11 flex-1 rounded-full text-[15px] font-semibold shadow-[0_8px_24px_rgb(18,88,143,0.35)]"
            onClick={() => openBooking()}
          >
            <CalendarCheck className="size-5" aria-hidden />
            Book Appointment
          </Button>
          <a
            href={CLINIC.phoneHref}
            aria-label="Call the clinic now"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-transform active:scale-95"
          >
            <Phone className="size-5" aria-hidden />
          </a>
        </div>
      </div>
    </>
  );
}
