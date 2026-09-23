"use client";

import { About } from "@/components/clinic/about";
import { BookingModal } from "@/components/clinic/booking-modal";
import { Contact } from "@/components/clinic/contact";
import { FloatingActions } from "@/components/clinic/floating-actions";
import { Footer } from "@/components/clinic/footer";
import { Hero } from "@/components/clinic/hero";
import { Navbar } from "@/components/clinic/navbar";
import { Reviews } from "@/components/clinic/reviews";
import { Services } from "@/components/clinic/services";

/**
 * The public website — intentionally minimal:
 * Hero → Services → About → Reviews → Contact → Footer.
 * One page, one accent colour, generous whitespace.
 */
export function SiteView() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main>
        <Hero />
        <Services />
        <About />
        <Reviews />
        <Contact />
      </main>

      <Footer />
      <FloatingActions />
      <BookingModal />
    </div>
  );
}
