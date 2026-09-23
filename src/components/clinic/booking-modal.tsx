"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MoonStar,
  NotebookPen,
  Phone,
  ShieldCheck,
  Sparkles,
  Smile,
  Stethoscope,
  SunMedium,
  TriangleAlert,
  User,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useClinicStore } from "@/components/clinic/store";
import {
  TIME_SLOTS,
  clinicTodayStr,
} from "@/lib/clinic";

/* ------------------------------- Types ------------------------------- */

type Step = 1 | 2 | 3 | 4;

interface Availability {
  closed: boolean;
  past: boolean;
  taken: string[];
}

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  message: string;
}

interface ConfirmedAppointment {
  id: string;
  name: string;
  service: string;
  date: string;
  timeSlot: string;
  status: string;
}

const STEP_LABELS = ["Purpose", "Date & Time", "Details", "Done"] as const;

const MORNING_SLOTS = TIME_SLOTS.slice(0, 8) as readonly string[];
const EVENING_SLOTS = TIME_SLOTS.slice(8) as readonly string[];

/* Quick one-tap purposes — a short, friendly starting point. Patients can
   always describe their own reason instead. */
const QUICK_PURPOSES = [
  { value: "General Consultation", icon: Stethoscope, hint: "Exam & advice" },
  { value: "Tooth Pain / Emergency", icon: Zap, hint: "Fast relief" },
  { value: "Cleaning & Scaling", icon: Sparkles, hint: "Polish & shine" },
  { value: "Braces & Cosmetic", icon: Smile, hint: "Straighten & glow" },
] as const;

const emptyForm: BookingForm = { name: "", phone: "", email: "", message: "" };

/** Slide direction-aware step transitions (dir: 1 = forward, -1 = back). */
const stepVariants = {
  initial: (d: number) => ({ opacity: 0, x: 40 * d }),
  animate: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: -40 * d }),
};

/* --------------------------- Small helpers --------------------------- */

function prettyDate(dateStr: string): string {
  try {
    return format(parseISO(`${dateStr}T12:00:00`), "EEEE, d MMM yyyy");
  } catch {
    return dateStr;
  }
}

function maxDateStr(): string {
  const t = new Date();
  return new Date(
    t.getTime() + 5 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);
}

/* ------------------------------ Component ----------------------------- */

export function BookingModal() {
  const { toast } = useToast();
  const bookingOpen = useClinicStore((s) => s.bookingOpen);
  const preselectedService = useClinicStore((s) => s.preselectedService);
  const closeBooking = useClinicStore((s) => s.closeBooking);

  const [step, setStep] = useState<Step>(1);
  const [dir, setDir] = useState<1 | -1>(1);

  const [service, setService] = useState<string | null>(null);
  const [purposeText, setPurposeText] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);

  const todayStr = useMemo(() => clinicTodayStr(), []);
  const maxDate = useMemo(() => maxDateStr(), []);

  /** The purpose we ultimately send: a quick chip or the visitor's own words. */
  const effectiveService = useMemo(() => {
    if (service) return service;
    const t = purposeText.trim();
    return t.length >= 3 ? t.slice(0, 120) : null;
  }, [service, purposeText]);

  /* ---------- Availability fetching ---------- */
  const loadAvailability = useCallback(async (dateStr: string) => {
    if (!dateStr) return;
    setAvailLoading(true);
    try {
      const res = await fetch(
        `/api/appointments/availability?date=${encodeURIComponent(dateStr)}`
      );
      const data = (await res.json()) as Partial<Availability>;
      setAvailability({
        closed: Boolean(data.closed),
        past: Boolean(data.past),
        taken: Array.isArray(data.taken) ? data.taken : [],
      });
    } catch {
      // Optimistic: show all slots open if the check fails; server still guards.
      setAvailability({ closed: false, past: false, taken: [] });
    } finally {
      setAvailLoading(false);
    }
  }, []);

  /* ---------- Reset every time the dialog opens ---------- */
  useEffect(() => {
    if (!bookingOpen) return;
    const pre =
      preselectedService && preselectedService.trim().length >= 3
        ? preselectedService.trim().slice(0, 120)
        : null;
    setDir(1);
    setService(pre);
    setPurposeText("");
    setStep(pre ? 2 : 1);
    // Prefill today's date so patients see open slots immediately.
    const today = clinicTodayStr();
    setDate(today);
    setSlot(null);
    setAvailability(null);
    void loadAvailability(today);
    setForm(emptyForm);
    setErrors({});
    setSubmitError(null);
    setConfirmed(null);
  }, [bookingOpen, preselectedService, loadAvailability]);

  const handleDateChange = (value: string) => {
    setDate(value);
    setSlot(null);
    setAvailability(null);
    if (value) void loadAvailability(value);
  };

  /* ---------- Navigation ---------- */
  const goTo = (next: Step) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const back = () => {
    if (step === 2) goTo(1);
    if (step === 3) goTo(2);
  };

  /* ---------- Step 3 validation + submit ---------- */
  const validateForm = (): boolean => {
    const next: Partial<Record<keyof BookingForm, string>> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13)
      next.phone = "Enter a valid phone number (e.g. 03XX-XXXXXXX).";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "That email doesn't look right.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!effectiveService || !date || !slot || !validateForm()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          service: effectiveService,
          date,
          timeSlot: slot,
          message: form.message.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        setSlot(null);
        void loadAvailability(date);
        goTo(2);
        toast({
          variant: "destructive",
          title: "That slot was just booked",
          description: "Someone grabbed it before you — please pick another time.",
        });
        return;
      }

      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; appointment?: ConfirmedAppointment; error?: string }
        | null;

      if (!res.ok || !data?.appointment) {
        setSubmitError(
          data?.error ??
            "Something went wrong while booking. Please try again or call us directly."
        );
        return;
      }

      setConfirmed(data.appointment);
      goTo(4);
      toast({
        title: "Booking confirmed 🎉",
        description: `${data.appointment.service} — ${prettyDate(
          data.appointment.date
        )} at ${data.appointment.timeSlot}.`,
      });
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Render helpers ---------- */

  const slotButtonClass = (s: string) => {
    const taken = availability?.taken.includes(s) ?? false;
    const selected = slot === s;
    if (selected)
      return "border-transparent bg-gradient-to-br from-[#12588f] to-[#0f7f9c] text-white shadow-[0_8px_20px_rgb(18,88,143,0.35)]";
    if (taken) return "border-border/60 bg-muted text-muted-foreground/60 line-through";
    return "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary";
  };

  const renderSlotGroup = (label: string, icon: ReactNode, slots: readonly string[]) => (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((s) => {
          const taken = availability?.taken.includes(s) ?? false;
          return (
            <button
              key={s}
              type="button"
              disabled={!availability || taken}
              onClick={() => setSlot(s)}
              aria-pressed={slot === s}
              aria-label={`${s}${taken ? " (booked)" : ""}`}
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-xl border px-1 py-2 text-[13px] font-medium transition-all ${slotButtonClass(
                s
              )}`}
            >
              <span>{s}</span>
              {taken && <span className="text-[10px] no-underline">Booked</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dialog open={bookingOpen} onOpenChange={(open) => !open && closeBooking()}>
      <DialogContent
        showCloseButton={false}
        className={`
          gap-0 overflow-hidden p-0
          fixed inset-x-0 bottom-0 top-auto left-0 right-0
          translate-x-0 translate-y-0
          max-h-[94svh] w-full sm:max-w-lg
          rounded-t-[1.75rem] sm:rounded-[1.75rem]
          sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto
          sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:max-h-[92svh]
          border-border/50 shadow-[0_24px_80px_rgb(4,24,43,0.45)]
          data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
        `}
      >
        <div className="scrollbar-thin max-h-[94svh] overflow-y-auto sm:max-h-[92svh]">
          {/* ------------------------- Gradient header band ------------------------- */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0c3054] via-[#12588f] to-[#0f7f9c] px-5 pb-5 pt-6 text-white sm:px-7">
            {/* Decorative glows */}
            <div
              className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-white/10 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-10 bottom-[-52px] size-36 rounded-full bg-teal-300/20 blur-2xl"
              aria-hidden
            />

            {/* Custom close */}
            <button
              type="button"
              onClick={closeBooking}
              aria-label="Close booking dialog"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/25 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <DialogHeader className="gap-1.5 text-left">
              <DialogTitle className="flex items-center gap-3 pr-8 font-display text-xl text-white sm:text-[1.35rem]">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/25">
                  <CalendarCheck className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  Book Your Appointment
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-200/90">
                    Punjab Dental Surgery
                  </span>
                </span>
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-sky-100/80">
                Under a minute — tell us why you&apos;re coming, pick a time, done.
              </DialogDescription>
            </DialogHeader>

            {/* Progress */}
            <div className="mt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                  initial={false}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <ol className="mt-2.5 flex items-center justify-between" aria-label="Booking steps">
                {STEP_LABELS.map((label, i) => {
                  const n = (i + 1) as Step;
                  const active = n === step;
                  const done = n < step;
                  return (
                    <li
                      key={label}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs ${
                        active || done ? "text-white" : "text-sky-200/60"
                      }`}
                      aria-current={active ? "step" : undefined}
                    >
                      {done ? (
                        <span className="flex size-4 items-center justify-center rounded-full bg-white text-[#12588f]">
                          <Check className="size-2.5" strokeWidth={3.5} aria-hidden />
                        </span>
                      ) : (
                        <span
                          className={`size-2 rounded-full ${
                            active ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" : "bg-white/35"
                          }`}
                          aria-hidden
                        />
                      )}
                      {label}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* ------------------------------ Steps body ------------------------------ */}
          <div className="bg-gradient-to-b from-secondary/40 to-background p-5 sm:p-7">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {/* --------------------------- STEP 1: PURPOSE --------------------------- */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  variants={stepVariants}
                  custom={dir}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      What brings you in?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pick a common reason — or write your own below.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {QUICK_PURPOSES.map((p) => {
                      const selected = service === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => {
                            setService(selected ? null : p.value);
                            setPurposeText("");
                          }}
                          aria-pressed={selected}
                          className={`flex min-h-[76px] flex-col justify-center gap-1 rounded-2xl border p-3 text-left transition-all ${
                            selected
                              ? "border-primary bg-secondary shadow-[0_8px_24px_rgb(18,88,143,0.2)] ring-2 ring-primary/25"
                              : "border-border bg-card hover:border-primary/40 hover:bg-secondary/50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                selected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-primary"
                              }`}
                            >
                              <p.icon className="size-4" aria-hidden />
                            </span>
                            <span className="text-[13px] font-semibold leading-tight text-foreground">
                              {p.value}
                            </span>
                          </span>
                          <span className="pl-10 text-[11px] text-muted-foreground">{p.hint}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider — "or" */}
                  <div className="flex items-center gap-3" aria-hidden>
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      or write your own
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-purpose" className="flex items-center gap-1.5">
                      <NotebookPen className="size-3.5 text-primary" aria-hidden />
                      Purpose of visit / consultation
                    </Label>
                    <Textarea
                      id="booking-purpose"
                      value={purposeText}
                      onChange={(e) => {
                        setPurposeText(e.target.value);
                        setService(null);
                      }}
                      placeholder="Tell us in your own words — e.g. root canal follow-up, teeth whitening, kids' checkup…"
                      rows={3}
                      className="resize-none rounded-2xl border-border bg-card"
                    />
                    {purposeText.trim().length > 0 && purposeText.trim().length < 3 && (
                      <p className="text-xs text-destructive">
                        Please write at least a few letters.
                      </p>
                    )}
                  </div>

                  <Button
                    className="mt-1 h-12 rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-opacity hover:opacity-95"
                    disabled={!effectiveService}
                    onClick={() => goTo(2)}
                  >
                    Continue
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </motion.div>
              )}

              {/* --------------------------- STEP 2: DATE & TIME --------------------------- */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  variants={stepVariants}
                  custom={dir}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Choose date &amp; time
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {effectiveService && (
                          <span className="font-medium text-primary">{effectiveService}</span>
                        )}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-9 shrink-0" onClick={back}>
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-date">Appointment date</Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={date}
                      min={todayStr}
                      max={maxDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="h-11 rounded-xl border-border bg-card"
                    />
                  </div>

                  {date && availability?.closed && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300/70 bg-amber-50 p-3.5 text-sm text-amber-900">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                      The clinic is closed on that day — please pick another day.
                    </div>
                  )}
                  {date && availability?.past && (
                    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300/70 bg-amber-50 p-3.5 text-sm text-amber-900">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                      That date has already passed — please pick today or a future date.
                    </div>
                  )}

                  {date && availLoading && (
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-3.5 w-20" />
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-[44px] rounded-xl" />
                        ))}
                      </div>
                    </div>
                  )}

                  {date && availability && !availability.closed && !availability.past && !availLoading && (
                    <div className="flex flex-col gap-4">
                      {availability.taken.length >= TIME_SLOTS.length ? (
                        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300/70 bg-amber-50 p-3.5 text-sm text-amber-900">
                          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                          Every slot for {prettyDate(date)} is booked. Please try another day.
                        </div>
                      ) : (
                        <>
                          {renderSlotGroup("Morning", <SunMedium className="size-3.5" />, MORNING_SLOTS)}
                          {renderSlotGroup("Evening", <MoonStar className="size-3.5" />, EVENING_SLOTS)}
                        </>
                      )}
                    </div>
                  )}

                  {date && !availability && !availLoading && (
                    <p className="text-sm text-muted-foreground">
                      Select a date to see available times.
                    </p>
                  )}

                  <Button
                    className="mt-1 h-12 rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-opacity hover:opacity-95"
                    disabled={!date || !slot || Boolean(availability?.closed)}
                    onClick={() => goTo(3)}
                  >
                    Continue
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </motion.div>
              )}

              {/* ----------------------------- STEP 3: DETAILS ----------------------------- */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  variants={stepVariants}
                  custom={dir}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Your details
                      </h3>
                      <p className="text-sm text-muted-foreground">We&apos;ll call to confirm.</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-9 shrink-0" onClick={back}>
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </Button>
                  </div>

                  {/* Summary card (gradient border) */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#12588f] to-[#0f7f9c] p-px shadow-[0_10px_30px_rgb(18,88,143,0.15)]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[calc(1rem-1px)] bg-card px-4 py-3 text-[13px] text-foreground">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                        <NotebookPen className="size-3.5" aria-hidden />
                        <span className="max-w-44 truncate">{effectiveService}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarCheck className="size-3.5 text-primary" aria-hidden />
                        {prettyDate(date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5 text-primary" aria-hidden />
                        {slot}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="booking-name">Full name *</Label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="booking-name"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Ali Raza"
                          autoComplete="name"
                          aria-invalid={Boolean(errors.name)}
                          className="h-11 rounded-xl border-border bg-card pl-10"
                        />
                      </div>
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="booking-phone">Phone number *</Label>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="booking-phone"
                          type="tel"
                          inputMode="tel"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="03XX-XXXXXXX"
                          autoComplete="tel"
                          aria-invalid={Boolean(errors.phone)}
                          className="h-11 rounded-xl border-border bg-card pl-10"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="booking-email">Email (optional)</Label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="booking-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="you@example.com"
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                          className="h-11 rounded-xl border-border bg-card pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="booking-message">Message for the doctor (optional)</Label>
                      <Textarea
                        id="booking-message"
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Anything the doctor should know? Pain, allergies, previous treatment…"
                        rows={3}
                        className="resize-none rounded-xl border-border bg-card"
                      />
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 shrink-0 text-green-600" aria-hidden />
                    No advance payment — you pay at the clinic after your visit.
                  </p>

                  {submitError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-red-50 p-3.5 text-sm text-destructive"
                    >
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {submitError}
                    </div>
                  )}

                  <Button
                    className="mt-1 h-12 rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.4)] transition-opacity hover:opacity-95"
                    disabled={submitting}
                    onClick={() => void submit()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Booking…
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="size-4" aria-hidden />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* ------------------------------ STEP 4: DONE ------------------------------ */}
              {step === 4 && confirmed && (
                <motion.div
                  key="step-4"
                  variants={stepVariants}
                  custom={dir}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col items-center gap-4 pb-2 pt-2 text-center"
                >
                  <div className="relative">
                    {/* Confetti sparkles */}
                    {[
                      { c: "bg-primary", x: "-34px", y: "-6px", d: 0.15 },
                      { c: "bg-teal-400", x: "30px", y: "-14px", d: 0.2 },
                      { c: "bg-green-400", x: "-22px", y: "26px", d: 0.28 },
                      { c: "bg-sky-400", x: "26px", y: "22px", d: 0.24 },
                      { c: "bg-amber-400", x: "0px", y: "-26px", d: 0.32 },
                    ].map((s, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0.9], scale: [0, 1.15, 0.85], x: s.x, y: s.y }}
                        transition={{ delay: 0.25 + s.d, duration: 0.5, ease: "easeOut" }}
                        className={`absolute left-1/2 top-1/2 size-2.5 rounded-full ${s.c}`}
                        aria-hidden
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
                      className="flex size-20 items-center justify-center rounded-full bg-green-100 shadow-[0_12px_32px_rgb(22,163,74,0.25)]"
                    >
                      <CheckCircle2 className="size-12 text-green-600" aria-hidden />
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      Booking Confirmed!
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We&apos;ll call you shortly to confirm. Please arrive 10 minutes early.
                    </p>
                  </div>

                  <div className="w-full rounded-2xl bg-gradient-to-br from-[#12588f] to-[#0f7f9c] p-px shadow-[0_10px_30px_rgb(18,88,143,0.15)]">
                    <dl className="flex flex-col gap-2.5 rounded-[calc(1rem-1px)] bg-card p-4 text-left text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="font-semibold text-foreground">{confirmed.name}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Purpose</dt>
                        <dd className="max-w-52 truncate text-right font-semibold text-foreground">
                          {confirmed.service}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Date</dt>
                        <dd className="font-semibold text-foreground">
                          {prettyDate(confirmed.date)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Time</dt>
                        <dd className="font-semibold text-foreground">{confirmed.timeSlot}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex w-full flex-col gap-2.5 sm:flex-row">
                    <Button
                      className="h-12 flex-1 rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-opacity hover:opacity-95"
                      onClick={closeBooking}
                    >
                      Done
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-full text-[15px] font-semibold"
                      onClick={() => {
                        setConfirmed(null);
                        setService(null);
                        setPurposeText("");
                        setDate("");
                        setSlot(null);
                        setAvailability(null);
                        setForm(emptyForm);
                        setErrors({});
                        setSubmitError(null);
                        setDir(-1);
                        setStep(1);
                      }}
                    >
                      Book Another
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
