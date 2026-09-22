"use client";

import { Star } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";

const REVIEWS = [
  {
    quote:
      "Very gentle treatment and clear explanation of everything. My root canal was completely painless.",
    name: "Ahmed Raza",
    detail: "Root Canal Treatment",
  },
  {
    quote:
      "I was scared of dentists my whole life. Dr. Sahib made me comfortable and the cleaning felt easy.",
    name: "Ayesha Khan",
    detail: "Cleaning & Scaling",
  },
  {
    quote:
      "Took my 7-year-old son for a filling. He left smiling. Honest doctor, fair price. Highly recommended.",
    name: "Bilal Hussain",
    detail: "Kids Dentistry",
  },
] as const;

/** Three quiet testimonial cards — no photo grids, no badges. */
export function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="Patient Reviews"
          title="Trusted by families like yours"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6">
                <div
                  className="flex gap-0.5 text-amber-500"
                  aria-label="5 out of 5 stars"
                  role="img"
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-4 fill-current" aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
                  “{review.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-border/60 pt-4">
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.detail}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
