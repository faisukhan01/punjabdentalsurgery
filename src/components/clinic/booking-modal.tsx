"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Activity,
  Anchor,
  ArrowLeft,
  ArrowRight,
  Baby,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  Mail,
  NotebookPen,
  PenLine,
  Phone,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  TriangleAlert,
  User,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
}

interface ConfirmedAppointment {
  id: string;
  name: string;
  service: string;
  date: string;
  timeSlot: string;
  status: string;
}

const STEP_LABELS = ["Purpose", "Date & Time", "Details"] as const;
const CUSTOM_SLOT = "__custom__";
const PURPOSE_MAX = 300;
const OTHER = "__other__";

const emptyForm: BookingForm = { name: "", phone: "", email: "" };

/* --------------------- Treatment options (Step 1) --------------------- */

interface TreatmentOption {
  /** Canonical service name stored in the DB. */
  value: string;
  label: string;
  icon: LucideIcon;
}

/** One card per clinic service (matches the Services section 1:1). */
const TREATMENT_OPTIONS: readonly TreatmentOption[] = [
  { value: "General Dental Checkup", label: "General Checkup", icon: Stethoscope },
  { value: "Teeth Cleaning & Scaling", label: "Cleaning & Scaling", icon: Sparkles },
  { value: "Tooth Filling", label: "Tooth Filling", icon: Wrench },
  { value: "Root Canal Treatment", label: "Root Canal", icon: Activity },
  { value: "Tooth Extraction", label: "Extraction", icon: Syringe },
  { value: "Teeth Whitening", label: "Teeth Whitening", icon: Star },
  { value: "Braces & Orthodontics", label: "Braces & Aligners", icon: Smile },
  { value: "Dental Implants", label: "Dental Implants", icon: Anchor },
  { value: "Crown & Bridge", label: "Crown & Bridge", icon: Crown },
  { value: "Kids Dentistry", label: "Kids Dentistry", icon: Baby },
  { value: "Emergency Dental Care", label: "Pain / Emergency", icon: Zap },
];

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

/** Native 24h time ("18:45") -> 12h label ("6:45 PM"), or null. */
function fmt24to12(value: string): string | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${min} ${ampm}`;
}

/* ------------------------------ Component ----------------------------- */

export function BookingModal() {
  const { toast } = useToast();
  const bookingOpen = useClinicStore((s) => s.bookingOpen);
  const preselectedService = useClinicStore((s) => s.preselectedService);
  const closeBooking = useClinicStore((s) => s.closeBooking);

  const [step, setStep] = useState<Step>(1);
  const [dir, setDir] = useState<1 | -1>(1);

  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);

  const todayStr = useMemo(() => clinicTodayStr(), []);
  const maxDate = useMemo(() => maxDateStr(), []);

  const isOther = selected === OTHER;

  /** Service sent to the API: the selected treatment, or the typed reason for "Something else". */
  const effectiveService = useMemo(() => {
    if (!selected) return null;
    if (isOther) {
      const t = reason.trim();
      return t.length >= 3 ? t.slice(0, PURPOSE_MAX) : null;
    }
    return selected;
  }, [selected, isOther, reason]);

  /** Optional note for the doctor (the written reason/problem). */
  const doctorNote = useMemo(() => {
    if (!selected || isOther) return undefined;
    const t = reason.trim();
    return t ? t.slice(0, 500) : undefined;
  }, [selected, isOther, reason]);

  /** Resolved time slot: a dropdown label or the custom time as "6:45 PM". */
  const effectiveSlot = useMemo(() => {
    if (!slot) return null;
    if (slot !== CUSTOM_SLOT) return slot;
    return fmt24to12(customTime);
  }, [slot, customTime]);

  const customOutOfRange = useMemo(() => {
    if (slot !== CUSTOM_SLOT || !customTime) return false;
    const label = fmt24to12(customTime);
    if (!label) return true;
    const m = /^(\d{1,2}):(\d{2})\s*([AP]M)$/.exec(label);
    if (!m) return true;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h === 12) h = 0;
    const mins = (m[3] === "PM" ? 720 : 0) + h * 60 + min;
    return mins < 17 * 60 || mins >= 24 * 60;
  }, [slot, customTime]);

  const slotTaken = Boolean(effectiveSlot && availability?.taken.includes(effectiveSlot));

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
    const pre = preselectedService?.trim() ?? "";
    const match = TREATMENT_OPTIONS.find((o) => o.value === pre);
    setDir(1);
    setSelected(match ? match.value : null);
    setReason("");
    setStep(match ? 2 : 1);
    // Prefill today's date so patients see open slots immediately.
    const today = clinicTodayStr();
    setDate(today);
    setSlot(null);
    setCustomTime("");
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
    setCustomTime("");
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
    if (!effectiveService || !date || !effectiveSlot || !validateForm()) return;
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
          timeSlot: effectiveSlot,
          message: doctorNote,
        }),
      });

      if (res.status === 409) {
        setSlot(null);
        setCustomTime("");
        void loadAvailability(date);
        goTo(2);
        toast({
          variant: "destructive",
          title: "That time was just booked",
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
        description: `${prettyDate(data.appointment.date)} at ${data.appointment.timeSlot}.`,
      });
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Step rail ---------- */

  const railStep = Math.min(step, 3) as 1 | 2 | 3;

  return (
    <Dialog open={bookingOpen} onOpenChange={(open) => !open && closeBooking()}>
      <DialogContent
        showCloseButton={false}
        className={`
          gap-0 overflow-hidden p-0
          fixed inset-x-0 bottom-0 top-auto left-0 right-0
          translate-x-0 translate-y-0
          max-h-[94svh] w-full sm:max-w-lg
          rounded-t-[2rem] sm:rounded-[2rem]
          sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto
          sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:max-h-[92svh]
          border-border/60 shadow-[0_32px_90px_rgb(9,30,54,0.4)]
          data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
        `}
      >
        <div className="scrollbar-thin max-h-[94svh] overflow-y-auto sm:max-h-[92svh]">
          {/* ------------------------- Header ------------------------- */}
          <div className="relative border-b border-border/70 bg-gradient-to-b from-secondary/70 to-background px-5 pb-4 pt-5 sm:px-7">
            {/* Mobile grab handle */}
            <span
              className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border sm:hidden"
              aria-hidden
            />

            <button
              type="button"
              onClick={closeBooking}
              aria-label="Close booking dialog"
              className="absolute right-3.5 top-3.5 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <DialogHeader className="gap-0 pt-2 text-left sm:pt-0">
              <div className="flex items-center gap-3.5 pr-8">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#12588f] to-[#0f7f9c] text-white shadow-[0_10px_24px_rgb(18,88,143,0.35)]">
                  <CalendarCheck className="size-5.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="font-display text-[1.3rem] font-semibold leading-tight text-foreground">
                    Book an appointment
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 truncate text-[13px] text-muted-foreground">
                    Punjab Dental Surgery · Johar Town, Lahore
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Step rail */}
            <ol className="mt-4 flex items-center gap-2" aria-label="Booking steps">
              {STEP_LABELS.map((label, i) => {
                const n = (i + 1) as 1 | 2 | 3;
                const active = n === railStep && step !== 4;
                const done = n < railStep || step === 4;
                return (
                  <li key={label} className="contents">
                    <span
                      className={`flex items-center gap-2 ${
                        n === 3 ? "shrink-0" : ""
                      }`}
                      aria-current={active ? "step" : undefined}
                    >
                      <span
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          done
                            ? "bg-primary/10 text-primary"
                            : active
                              ? "bg-gradient-to-br from-[#12588f] to-[#0f7f9c] text-white shadow-[0_6px_16px_rgb(18,88,143,0.35)]"
                              : "border border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : n}
                      </span>
                      <span
                        className={`hidden text-[11px] font-bold uppercase tracking-[0.14em] sm:inline ${
                          done || active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </span>
                    {n < 3 && (
                      <span
                        className={`h-px flex-1 ${done ? "bg-primary/40" : "bg-border"}`}
                        aria-hidden
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ------------------------------ Steps body ------------------------------ */}
          <div className="bg-card px-5 py-6 sm:px-7">
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
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Stethoscope className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                        What brings you in today?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select a treatment to continue.
                      </p>
                    </div>
                  </div>

                  {/* Treatment selection grid */}
                  <div
                    className="grid grid-cols-2 gap-2.5"
                    role="group"
                    aria-label="Treatment options"
                  >
                    {TREATMENT_OPTIONS.map((opt) => {
                      const active = selected === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelected(opt.value)}
                          aria-pressed={active}
                          className={`group relative flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all duration-200 ${
                            active
                              ? "border-primary/70 bg-secondary shadow-[0_8px_20px_rgb(18,88,143,0.14)] ring-1 ring-primary/50"
                              : "border-border bg-background hover:border-primary/35 hover:bg-secondary/40"
                          }`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              active
                                ? "bg-gradient-to-br from-[#12588f] to-[#0f7f9c] text-white shadow-[0_4px_10px_rgb(18,88,143,0.35)]"
                                : "bg-secondary text-primary group-hover:bg-accent"
                            }`}
                            aria-hidden
                          >
                            <Icon className="size-4" />
                          </span>
                          <span
                            className={`text-[13px] font-semibold leading-tight ${
                              active ? "text-primary" : "text-foreground/85"
                            }`}
                          >
                            {opt.label}
                          </span>
                          {active && (
                            <span
                              className="absolute right-2 top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                              aria-hidden
                            >
                              <Check className="size-3" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Something else — free text becomes the purpose */}
                    <button
                      type="button"
                      onClick={() => setSelected(OTHER)}
                      aria-pressed={isOther}
                      className={`group relative flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all duration-200 ${
                        isOther
                          ? "border-primary/70 bg-secondary shadow-[0_8px_20px_rgb(18,88,143,0.14)] ring-1 ring-primary/50"
                          : "border-dashed border-border bg-background hover:border-primary/35 hover:bg-secondary/40"
                      }`}
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isOther
                            ? "bg-gradient-to-br from-[#12588f] to-[#0f7f9c] text-white shadow-[0_4px_10px_rgb(18,88,143,0.35)]"
                            : "bg-secondary text-primary group-hover:bg-accent"
                        }`}
                        aria-hidden
                      >
                        <PenLine className="size-4" />
                      </span>
                      <span
                        className={`text-[13px] font-semibold leading-tight ${
                          isOther ? "text-primary" : "text-foreground/85"
                        }`}
                      >
                        Something else
                      </span>
                      {isOther && (
                        <span
                          className="absolute right-2 top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          aria-hidden
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Optional reason / problem — box stays empty, no placeholder */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-end justify-between gap-3">
                      <Label htmlFor="booking-reason" className="text-[13px]">
                        {isOther ? (
                          "Describe your problem"
                        ) : (
                          <>
                            Reason or problem{" "}
                            <span className="font-normal text-muted-foreground">
                              (optional)
                            </span>
                          </>
                        )}
                      </Label>
                      {reason.length > 0 && (
                        <span className="tabular-nums text-xs text-muted-foreground/60">
                          {reason.length}/{PURPOSE_MAX}
                        </span>
                      )}
                    </div>
                    <Textarea
                      id="booking-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      maxLength={PURPOSE_MAX}
                      rows={3}
                      className="min-h-20 resize-none rounded-2xl border-border bg-background text-[15px] leading-relaxed"
                    />
                    {isOther && reason.trim().length > 0 && reason.trim().length < 3 ? (
                      <p className="text-xs text-destructive">Please write a little more.</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {isOther
                          ? "Tell us briefly what you are experiencing — the doctor will review it."
                          : "The doctor will review this before your visit."}
                      </p>
                    )}
                  </div>

                  <Button
                    className="mt-1 h-12 w-full rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-all hover:opacity-95 disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:shadow-none"
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
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Clock className="size-4" aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                          Date &amp; time slot
                        </h3>
                        <p className="text-sm text-muted-foreground">Open every day, 5 PM – 12 AM.</p>
                      </div>
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
                      className="h-12 rounded-2xl border-border bg-background"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-slot">Time slot</Label>
                    <Select
                      value={slot ?? undefined}
                      onValueChange={(v) => {
                        setSlot(v);
                        if (v !== CUSTOM_SLOT) setCustomTime("");
                      }}
                      disabled={!date || availLoading || Boolean(availability?.closed || availability?.past)}
                    >
                      <SelectTrigger
                        id="booking-slot"
                        aria-label="Choose a time slot"
                        className="h-12 w-full rounded-2xl border-border bg-background"
                      >
                        <SelectValue placeholder={date ? "Choose a time" : "Pick a date first"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 rounded-2xl">
                        {TIME_SLOTS.map((s) => {
                          const taken = availability?.taken.includes(s) ?? false;
                          return (
                            <SelectItem
                              key={s}
                              value={s}
                              disabled={taken}
                              className="rounded-xl"
                            >
                              <span className="flex items-center gap-2">
                                {s}
                                {taken && (
                                  <span className="text-[11px] font-medium text-muted-foreground/60">
                                    · booked
                                  </span>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}
                        <SelectSeparator />
                        <SelectItem value={CUSTOM_SLOT} className="rounded-xl">
                          <span className="flex items-center gap-2 font-medium text-primary">
                            <PenLine className="size-3.5" aria-hidden />
                            Write a custom time…
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom time entry */}
                  {slot === CUSTOM_SLOT && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1.5 rounded-2xl border border-primary/25 bg-secondary/50 p-4">
                        <Label htmlFor="booking-custom-time" className="text-[13px]">
                          Your preferred time
                        </Label>
                        <Input
                          id="booking-custom-time"
                          type="time"
                          value={customTime}
                          min="17:00"
                          max="23:45"
                          step={300}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="h-12 rounded-2xl border-border bg-card"
                        />
                        <p className="text-xs text-muted-foreground">
                          Clinic hours: 5:00 PM – 12:00 AM. Any time in between works — e.g. 6:45 PM.
                        </p>
                        {customOutOfRange && customTime && (
                          <p className="text-xs font-medium text-destructive">
                            Please pick a time between 5:00 PM and 12:00 AM.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

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
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-12 rounded-2xl" />
                    </div>
                  )}

                  {date && availability && !availLoading && !availability.closed && !availability.past && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="size-3.5 text-green-600" aria-hidden />
                      {availability.taken.length >= TIME_SLOTS.length
                        ? "All standard slots are booked for this day — you can still write a custom time."
                        : "Booked times are greyed out in the list."}
                    </p>
                  )}

                  <Button
                    className="mt-1 h-12 w-full rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-all hover:opacity-95 disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:shadow-none"
                    disabled={
                      !date ||
                      !effectiveSlot ||
                      customOutOfRange ||
                      slotTaken ||
                      Boolean(availability?.closed || availability?.past) ||
                      availLoading
                    }
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
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <User className="size-4" aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
                          Your details
                        </h3>
                        <p className="text-sm text-muted-foreground">We&apos;ll call to confirm.</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-9 shrink-0" onClick={back}>
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </Button>
                  </div>

                  {/* Summary card */}
                  <dl className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-secondary/50 px-4 py-3.5 text-[13px]">
                    <div className="flex items-start justify-between gap-4">
                      <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                        <NotebookPen className="size-3.5" aria-hidden />
                        Purpose
                      </dt>
                      <dd className="line-clamp-2 text-right font-semibold text-foreground">
                        {effectiveService}
                      </dd>
                    </div>
                    {doctorNote && (
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                          <PenLine className="size-3.5" aria-hidden />
                          Note
                        </dt>
                        <dd className="line-clamp-2 text-right text-foreground/80">
                          {doctorNote}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                        <CalendarCheck className="size-3.5" aria-hidden />
                        Date
                      </dt>
                      <dd className="font-semibold text-foreground">{prettyDate(date)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden />
                        Time
                      </dt>
                      <dd className="font-semibold text-foreground">{effectiveSlot}</dd>
                    </div>
                  </dl>

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
                          className="h-12 rounded-2xl border-border bg-background pl-10"
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
                          className="h-12 rounded-2xl border-border bg-background pl-10"
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
                          className="h-12 rounded-2xl border-border bg-background pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
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
                    className="mt-1 h-12 w-full rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-all hover:opacity-95 disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:shadow-none"
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

                  <dl className="w-full flex-col gap-2.5 rounded-2xl border border-border/70 bg-secondary/50 p-4 text-left text-sm sm:flex">
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

                  <div className="flex w-full flex-col gap-2.5 sm:flex-row">
                    <Button
                      className="h-12 flex-1 rounded-full bg-gradient-to-r from-[#12588f] to-[#0f7f9c] text-[15px] font-semibold shadow-[0_10px_28px_rgb(18,88,143,0.35)] transition-all hover:opacity-95 disabled:bg-muted disabled:bg-none disabled:text-muted-foreground disabled:shadow-none"
                      onClick={closeBooking}
                    >
                      Done
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-full text-[15px] font-semibold"
                      onClick={() => {
                        setConfirmed(null);
                        setSelected(null);
                        setReason("");
                        const today = clinicTodayStr();
                        setDate(today);
                        setSlot(null);
                        setCustomTime("");
                        setAvailability(null);
                        void loadAvailability(today);
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
