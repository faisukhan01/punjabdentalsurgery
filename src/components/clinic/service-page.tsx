"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  HeartHandshake,
  Info,
  Phone,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/clinic/navbar";
import { Footer } from "@/components/clinic/footer";
import { FloatingActions } from "@/components/clinic/floating-actions";
import { BookingModal } from "@/components/clinic/booking-modal";
import { useClinicStore } from "@/components/clinic/store";
import { CLINIC } from "@/lib/clinic";
import type { ServiceDetail } from "@/lib/services-content";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * Individual treatment page (client shell). Static, honest, locally
 * targeted content per the website audit: what's included, comfort-first
 * expectations, good-to-know logistics and service-specific FAQs — with
 * booking pre-selecting this exact treatment.
 */
export function ServicePage({ service }: { service: ServiceDetail }) {
  const openBooking = useClinicStore((s) => s.openBooking);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${CLINIC.website}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: service.navTitle,
        item: `${CLINIC.website}/services/${service.slug}`,
      },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.name,
    description: service.metaDescription,
    procedureType: "https://schema.org/TherapeuticProcedure",
    provider: {
      "@type": "Dentist",
      name: CLINIC.name,
      telephone: CLINIC.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Johar Town",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar solid />

      <motion.main
        id="main"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="flex-1"
      >
        {/* Header band */}
        <header className="border-b border-primary/10 bg-secondary/40">
          <div className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
            <motion.nav
              variants={fadeUp}
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <Link
                href="/"
                className="rounded transition-colors hover:text-primary"
              >
                Home
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <Link
                href="/#services"
                className="rounded transition-colors hover:text-primary"
              >
                Services
              </Link>
              <ChevronRight className="size-3.5" aria-hidden />
              <span aria-current="page" className="text-primary">
                {service.navTitle}
              </span>
            </motion.nav>

            <motion.h1
              variants={fadeUp}
              className="mt-5 font-display text-3xl font-semibold leading-tight text-balance text-foreground sm:text-4xl"
            >
              {service.h1}
            </motion.h1>

            {service.intro.map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base"
              >
                {p}
              </motion.p>
            ))}

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                className="h-12 rounded-full px-7"
                onClick={() => openBooking(service.name)}
              >
                <CalendarCheck className="size-5" aria-hidden />
                Book {service.navTitle}
              </Button>
              <a
                href={CLINIC.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
              >
                <Phone className="size-4" aria-hidden />
                {CLINIC.phone}
              </a>
            </motion.div>
          </div>
        </header>

        {/* What's included */}
        <section aria-labelledby="included-h" className="py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <motion.h2
              variants={fadeUp}
              id="included-h"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              What&rsquo;s included
            </motion.h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {service.included.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-border/70 bg-card p-5"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Check className="size-4.5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comfort */}
        <section
          aria-labelledby="comfort-h"
          className="border-y border-primary/10 bg-secondary/40 py-14 sm:py-16"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <motion.h2
              variants={fadeUp}
              id="comfort-h"
              className="flex items-center gap-2.5 font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              <HeartHandshake className="size-6 text-primary" aria-hidden />
              Your comfort comes first
            </motion.h2>
            <ul className="mt-7 space-y-3.5">
              {service.comfort.map((point) => (
                <motion.li
                  key={point}
                  variants={fadeUp}
                  className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-card/70 px-5 py-4"
                >
                  <Check
                    className="mt-0.5 size-4.5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span className="text-[15px] leading-relaxed text-foreground/85">
                    {point}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Good to know */}
        <section aria-labelledby="gtk-h" className="py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <motion.h2
              variants={fadeUp}
              id="gtk-h"
              className="flex items-center gap-2.5 font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              <Info className="size-6 text-primary" aria-hidden />
              Good to know
            </motion.h2>
            <motion.div
              variants={fadeUp}
              className="mt-7 overflow-hidden rounded-3xl border border-primary/10 bg-card"
            >
              <ul className="divide-y divide-border/70">
                {service.goodToKnow.map((line) => (
                  <li key={line} className="flex items-start gap-3.5 px-5 py-4 sm:px-6">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      {line.includes("token") ? (
                        <ReceiptText className="size-4" aria-hidden />
                      ) : line.includes("PM") ? (
                        <Clock className="size-4" aria-hidden />
                      ) : (
                        <Check className="size-4" aria-hidden />
                      )}
                    </span>
                    <span className="text-[15px] leading-relaxed text-foreground/85">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Service FAQ */}
        {service.faqs.length > 0 && (
          <section
            aria-labelledby="faq-h"
            className="border-t border-primary/10 bg-secondary/40 py-14 sm:py-16"
          >
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <motion.h2
                variants={fadeUp}
                id="faq-h"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                Common questions
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-6">
                <Accordion type="single" collapsible className="space-y-3">
                  {service.faqs.map((f, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="rounded-2xl border border-border/70 bg-card px-5 last:border-b"
                    >
                      <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground hover:no-underline">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            </div>
          </section>
        )}

        {/* Booking CTA band */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#10406b] via-[#0c3054] to-[#0a2946] px-6 py-12 text-center sm:px-12"
            >
              <div
                className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-sky-400/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-28 -right-16 size-72 rounded-full bg-teal-300/10 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-white/10"
                aria-hidden
              />
              <div className="relative">
                <p className="font-display text-2xl font-semibold text-balance text-white sm:text-3xl">
                  Ready to book {service.navTitle.toLowerCase()}?
                </p>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-sky-50/85">
                  Choose your time online, get your token number instantly, and
                  we will see you at the clinic. Open every day, 5 PM – 12 AM.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="h-12 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-[0_16px_40px_rgb(0,0,0,0.35)] hover:bg-sky-50"
                    onClick={() => openBooking(service.name)}
                  >
                    <CalendarCheck className="size-5" aria-hidden />
                    Book Appointment
                  </Button>
                  <a
                    href={CLINIC.phoneHref}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    <Phone className="size-4" aria-hidden />
                    {CLINIC.phone}
                  </a>
                </div>
                <p dir="rtl" lang="ur" className="mt-6 text-sm text-sky-100/60">
                  {CLINIC.taglineUr}
                </p>
              </div>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:underline"
              >
                Back to Punjab Dental Surgery
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.p>
          </div>
        </section>
      </motion.main>

      <Footer />
      <FloatingActions />
      <BookingModal />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
    </div>
  );
}
