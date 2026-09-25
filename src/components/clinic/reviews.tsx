"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/clinic/reveal";
import { cn } from "@/lib/utils";

interface Review {
  quote: string;
  name: string;
  detail: string;
}

const REVIEWS: Review[] = [
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
  {
    quote:
      "Got my braces done here. Every visit was quick, careful and always on time. Wonderful experience.",
    name: "Fatima Noor",
    detail: "Braces & Orthodontics",
  },
  {
    quote:
      "My implant feels just like a natural tooth. The doctor explained each step patiently before starting.",
    name: "Usman Tariq",
    detail: "Dental Implant",
  },
  {
    quote:
      "Whitening results were amazing after just one session. The clinic is clean and staff is very polite.",
    name: "Hira Aslam",
    detail: "Teeth Whitening",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

const ARROW_BTN =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-card text-primary shadow-[0_6px_16px_rgb(18,88,143,0.12)] transition-all hover:bg-primary hover:text-primary-foreground active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Reviews — one elegant testimonial card at a time. The carousel always
 * glides to the next review every 5 seconds on its own — no clicking
 * needed — and patients can also step with the left / right arrow buttons
 * (side arrows on desktop, thumb-friendly arrows around the dots on
 * mobile) or jump straight to a review via the dots.
 */
export function Reviews() {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);
  // Bumped after every manual arrow / dot tap so the 5s countdown restarts
  // and the card never double-jumps right after the patient steps manually.
  const [cycle, setCycle] = useState(0);

  const go = useCallback((dir: number) => {
    setIndex(([i]) => [(i + dir + REVIEWS.length) % REVIEWS.length, dir]);
    setCycle((c) => c + 1);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      if (target === index) return;
      setIndex(() => [target, target > index ? 1 : -1]);
      setCycle((c) => c + 1);
    },
    [index]
  );

  // Auto-advance — the next review glides in every 5 seconds, no clicking
  // needed. Runs unconditionally (a paused-on-hover state froze the loop on
  // desktop and touch devices before), manual taps just restart the timer.
  useEffect(() => {
    const t = setInterval(() => {
      setIndex(([i]) => [(i + 1) % REVIEWS.length, 1]);
    }, 5000);
    return () => clearInterval(t);
  }, [cycle]);

  const review = REVIEWS[index];

  return (
    <section id="reviews" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          kicker="Patient Reviews"
          title="Trusted by families like yours"
          subtitle="Real words from real patients — gentle treatment, honest pricing and smiles that last."
        />

        <Reveal delay={0.1} className="mt-7 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs font-semibold text-foreground/80 shadow-sm">
            <span className="flex gap-0.5 text-amber-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="size-3.5 fill-current" />
              ))}
            </span>
            5.0 rated by patients
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-12">
          <div className="relative mx-auto max-w-3xl">
            {/* Desktop arrows — in the gutters beside the card */}
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => go(-1)}
              className={cn(ARROW_BTN, "absolute left-0 top-1/2 hidden -translate-y-1/2 sm:inline-flex")}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => go(1)}
              className={cn(ARROW_BTN, "absolute right-0 top-1/2 hidden -translate-y-1/2 sm:inline-flex")}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>

            {/* The card */}
            <div className="mx-auto max-w-2xl sm:px-16" aria-live="polite">
              <motion.figure
                key={index}
                initial={{ opacity: 0, x: 40 * direction }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="relative flex min-h-[300px] flex-col overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-b from-card to-secondary/40 p-7 shadow-[0_20px_45px_-20px_rgba(18,88,143,0.3)] sm:min-h-[280px] sm:p-10"
              >
                <Quote
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-4 size-32 rotate-12 text-primary/[0.06]"
                />

                <div className="flex items-center justify-between">
                  <div
                    className="flex gap-1 text-amber-500"
                    aria-label="5 out of 5 stars"
                    role="img"
                  >
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-4 fill-current" aria-hidden />
                    ))}
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                    {review.detail}
                  </span>
                </div>

                <blockquote className="mt-6 flex-1 text-lg font-medium leading-relaxed text-foreground sm:text-xl sm:leading-relaxed">
                  “{review.quote}”
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-primary/10 pt-5">
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_6px_14px_rgb(18,88,143,0.3)]"
                    aria-hidden
                  >
                    {initials(review.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-foreground">
                      {review.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Verified patient
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            </div>

            {/* Controls — arrows flank the dots on mobile; dots only on desktop */}
            <div className="mt-7 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Previous review"
                onClick={() => go(-1)}
                className={cn(ARROW_BTN, "sm:hidden")}
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>

              <div className="flex items-center gap-2" role="tablist" aria-label="Choose review">
                {REVIEWS.map((r, i) => (
                  <button
                    key={r.name}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Review ${i + 1} of ${REVIEWS.length} — ${r.name}`}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === index
                        ? "w-7 bg-primary"
                        : "w-2 bg-primary/20 hover:bg-primary/45"
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next review"
                onClick={() => go(1)}
                className={cn(ARROW_BTN, "sm:hidden")}
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
