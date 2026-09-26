"use client";

import { About } from "@/components/clinic/about";
import { BookingModal } from "@/components/clinic/booking-modal";
import { Contact } from "@/components/clinic/contact";
import { Faq } from "@/components/clinic/faq";
import { FloatingActions } from "@/components/clinic/floating-actions";
import { Footer } from "@/components/clinic/footer";
import { Hero } from "@/components/clinic/hero";
import { Navbar } from "@/components/clinic/navbar";
import { Reviews } from "@/components/clinic/reviews";
import { Services } from "@/components/clinic/services";

/**
 * The public website:
 * Hero → Services → About → Reviews → FAQs → Contact → Footer.
 * One page, one accent colour, generous whitespace — plus detailed
 * treatment pages under /services for organic search coverage.
 */
export function SiteView() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Accessibility — skip straight to content on keyboard tab */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <Services />
        <About />
        <Reviews />
        <Faq />
        <Contact />
      </main>

      <Footer />
      <FloatingActions />
      <BookingModal />
    </div>
  );
}
