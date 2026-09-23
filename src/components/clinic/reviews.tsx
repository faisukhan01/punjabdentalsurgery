"use client";

import { Quote, Star } from "lucide-react";
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

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex w-[19rem] shrink-0 flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_rgb(88,18,24,0.05)] sm:w-[21.5rem]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 text-amber-500" aria-label="5 out of 5 stars" role="img">
          {Array.from({ length: 5 }).map((_, s) => (
            <Star key={s} className="size-4 fill-current" aria-hidden />
          ))}
        </div>
        <Quote className="size-5 text-primary/20" aria-hidden />
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
        “{review.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground"
          aria-hidden
        >
          {initials(review.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-foreground">
            {review.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{review.detail}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Reviews — an infinite, slow-drifting marquee of testimonial cards.
 * Pauses on hover, fades at the edges, honors reduced-motion.
 */
export function Reviews() {
  const row = [...REVIEWS, ...REVIEWS]; // duplicated for a seamless -50% loop

  return (
    <section id="reviews" className="scroll-mt-20 overflow-hidden py-20 sm:py-28">
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
      </div>

      <Reveal delay={0.15} className="mt-12">
        <div
          className={cn(
            "marquee group relative",
            "[mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
          )}
        >
          <div className="animate-marquee flex w-max gap-4 pr-4 group-hover:[animation-play-state:paused]">
            {row.map((review, i) => (
              <ReviewCard key={`${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
