"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClinicStore } from "@/components/clinic/store";
import { WhatsAppIcon } from "@/components/clinic/whatsapp-icon";
import { CLINIC } from "@/lib/clinic";
import { handleWhatsAppClick } from "@/lib/whatsapp";

/**
 * Mobile sticky bottom bar — the "Book Appointment" bar with WhatsApp and
 * call shortcuts slides in only after scrolling down past the hero CTAs.
 */
const SCROLL_THRESHOLD = 320;

export function FloatingActions() {
  const openBooking = useClinicStore((s) => s.openBooking);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const mq = window.matchMedia("(max-width: 767px)");
    const onMqChange = () => setIsMobile(mq.matches);
    onMqChange();
    mq.addEventListener("change", onMqChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onMqChange);
    };
  }, []);

  const barVisible = isMobile && scrolled;

  return (
    <motion.div
      initial={false}
      animate={{ y: barVisible ? 0 : 140, opacity: barVisible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/90 p-3 backdrop-blur-md md:hidden [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]"
      style={{ pointerEvents: barVisible ? "auto" : "none" }}
      aria-hidden={!barVisible}
      inert={!barVisible}
    >
      <div className="flex items-center gap-2.5">
        <Button
          className="h-11 flex-1 rounded-full text-[15px] font-semibold shadow-[0_8px_24px_rgb(18,88,143,0.35)]"
          onClick={() => openBooking()}
        >
          <CalendarCheck className="size-5" aria-hidden />
          Book Appointment
        </Button>
        <a
          href={CLINIC.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          aria-label="Chat with us on WhatsApp"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_22px_rgba(37,211,102,0.45)] transition-transform active:scale-95"
        >
          <WhatsAppIcon className="size-5" aria-hidden />
        </a>
        <a
          href={CLINIC.phoneHref}
          aria-label="Call the clinic now"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-secondary text-primary transition-transform active:scale-95"
        >
          <Phone className="size-5" aria-hidden />
        </a>
      </div>
    </motion.div>
  );
}
