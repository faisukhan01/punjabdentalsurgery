"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";
import { useClinicStore } from "@/components/clinic/store";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { CLINIC } from "@/lib/clinic";

/** Genuine patient questions with honest, comfort-first answers. */
const FAQS = [
  {
    q: "Where exactly is Punjab Dental Surgery located?",
    a: `We are in ${CLINIC.address}. Call or WhatsApp ${CLINIC.phone} and we will guide you right to the door.`,
  },
  {
    q: "What are your opening hours?",
    a: "Every day — Monday to Sunday — from 5:00 PM to 12:00 midnight. Evening hours mean no school or work needs to be missed.",
  },
  {
    q: "How do I book an appointment?",
    a: `Book online right here on the website in under a minute, or call/WhatsApp ${CLINIC.phone}. You will get an instant confirmation with your own token number for the day.`,
  },
  {
    q: "Do you see walk-in patients?",
    a: "Evening slots fill up quickly, so booking ahead is the surest way to be seen at your preferred time. If you need to come urgently, call or WhatsApp and we will do our best to fit you in the same evening.",
  },
  {
    q: "Will the treatment hurt?",
    a: "Comfort comes first here. Numbing is given properly and given time to work, every step is explained before it happens, and if anything ever feels uncomfortable we stop and adjust. Many patients tell us their visit was far easier than they had feared — and that is the standard we work to.",
  },
  {
    q: "How much does treatment cost?",
    a: "You will know before anything starts. After the examination, the doctor explains what is needed and gives you the cost of each step in writing. No treatment begins without your go-ahead — and there are no surprise charges afterwards.",
  },
  {
    q: "Is the consultation really free?",
    a: "Yes — your consultation with the doctor is free. If any treatment is needed afterwards, it is explained and quoted separately, and you decide in your own time.",
  },
  {
    q: "Do you treat children?",
    a: "Yes. First visits for children are kept short, friendly and mostly about trust — a ride on the chair and a look inside is a successful first visit. See our Kids Dentistry page for details.",
  },
  {
    q: "What is the token number on my receipt?",
    a: "When you book, you get a PDF receipt with a token number — that is your queue number for that day at the clinic. Show it when you arrive; no waiting-room confusion about whose turn it is.",
  },
] as const;

/**
 * FAQs — patient questions answered honestly, with matching FAQPage
 * structured data so search engines can surface the answers directly.
 */
export function Faq() {
  const openBooking = useClinicStore((s) => s.openBooking);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          kicker="FAQs"
          title="Questions patients ask us"
          subtitle="Straight answers about booking, costs, comfort and how the clinic works."
        />

        <Reveal delay={0.1} className="mt-10">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-border/70 bg-card px-5 last:border-b sm:px-6"
              >
                <AccordionTrigger className="text-left text-[15px] font-semibold text-foreground hover:no-underline sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Still unsure about something? Call us — the doctor answers
            questions before you book.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-12 rounded-full px-7"
              onClick={() => openBooking()}
            >
              Book Appointment
            </Button>
            <a
              href={CLINIC.phoneHref}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/25 bg-card px-6 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
            >
              <Phone className="size-4" aria-hidden />
              {CLINIC.phone}
            </a>
          </div>
        </Reveal>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
