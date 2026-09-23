"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------ Reveal ------------------------------ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** seconds */
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Fade + slide-up reveal when the element scrolls into view. */
export function Reveal({ children, className, delay = 0, y = 26, once = true }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------- SectionHeading -------------------------- */

interface SectionHeadingProps {
  kicker: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
}

/** Uppercase crimson kicker + serif display title used across sections. */
export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-[0.28em]",
          dark ? "text-sky-300" : "text-primary"
        )}
      >
        {kicker}
      </span>
      <h2
        className={cn(
          "font-display text-3xl leading-tight text-balance sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed sm:text-base",
            dark ? "text-sky-100/80" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

/* ------------------------------ CountUp ------------------------------ */

interface CountUpProps {
  to: number;
  decimals?: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
}

/** Animated count-up that starts when scrolled into view. */
export function CountUp({ to, decimals = 0, duration = 1.8, format, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  const display =
    format?.(value) ??
    value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}
