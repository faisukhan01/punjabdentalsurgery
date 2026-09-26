"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Mail,
  NotebookPen,
  PenLine,
  Phone,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  User,
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
import { cn } from "@/lib/utils";
import { TIME_SLOTS, clinicTodayStr, formatToken } from "@/lib/clinic";
import { downloadReceiptPdf } from "@/lib/receipt-pdf";

/* ------------------------------- Types ------------------------------- */

type Step = 1 | 2 | 3 | 4;

interface Availability {
  closed: boolean;
  past: boolean;
}

interface BookingForm {
  name: string;
  phone: string;
  email: string;
}

interface ConfirmedAppointment {
  id: string;
  tokenNumber: number;
  name: string;
  service: string;
  date: string;
  timeSlot: string;
  status: string;
}

const STEP_LABELS = ["Purpose", "Date & Time", "Details"] as const;
const CUSTOM_SLOT = "__custom__";
const PURPOSE_MAX = 300;

const emptyForm: BookingForm = { name: "", phone: "", email: "" };

/** Slide direction-aware step transitions (dir: 1 = forward, -1 = back). */
const stepVariants = {
  initial: (d: number) => ({ opacity: 0, x: 28 * d }),
  animate: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: -28 * d }),
};

/* --------------------------- Style constants --------------------------- */

/** Micro section label — quiet, editorial. */
const MICRO =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground";

/** Single solid primary CTA — no gradients, no glow. */
const BTN_PRIMARY =
  "h-12 w-full rounded-xl text-[15px] font-semibold shadow-[0_8px_20px_rgb(18,88,143,0.16)] transition-all hover:shadow-[0_10px_24px_rgb(18,88,143,0.24)] active:scale-[0.99] disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:active:scale-100";

const INPUT_CLS = "h-12 rounded-xl border-border/80 bg-background";
const PANEL_CLS = "rounded-2xl border border-border/70 bg-secondary/45";

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
  const [receiptBusy, setReceiptBusy] = useState(false);

  const todayStr = useMemo(() => clinicTodayStr(), []);
  const maxDate = useMemo(() => maxDateStr(), []);

  /**
   * Visit type: a service tapped in the Services section, otherwise a
   * simple General Checkup. The written reason below travels as the note.
   */
  const visitService = useMemo(() => {
    const pre = preselectedService?.trim() ?? "";
    return pre.length >= 3 ? pre.slice(0, 120) : "General Dental Checkup";
  }, [preselectedService]);

  const visitLabel =
    visitService === "General Dental Checkup" ? "General Checkup" : visitService;

  /** Service sent to the API (always resolved — zero-friction step 1). */
  const effectiveService = visitService;

  /** Optional note for the doctor (the written problem / purpose). */
  const doctorNote = useMemo(() => {
    const t = reason.trim();
    return t ? t.slice(0, 500) : undefined;
  }, [reason]);

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

  /* ---------- Availability fetching ---------- */
  // Slots never close — several patients may share the same time. This check
  // only drives the "closed day" / "past date" notices below.
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
      });
    } catch {
      // Optimistic: treat the day as open if the check fails; server still guards.
      setAvailability({ closed: false, past: false });
    } finally {
      setAvailLoading(false);
    }
  }, []);

  /* ---------- Reset every time the dialog opens ---------- */
  useEffect(() => {
    if (!bookingOpen) return;
    setDir(1);
    setReason("");
    setStep(1);
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
        description: `Token ${formatToken(data.appointment.tokenNumber)} — ${prettyDate(
          data.appointment.date
        )} at ${data.appointment.timeSlot}.`,
      });
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Receipt download (Step 4) ---------- */
  const handleDownloadReceipt = useCallback(async () => {
    if (!confirmed) return;
    setReceiptBusy(true);
    try {
      await downloadReceiptPdf({
        tokenNumber: confirmed.tokenNumber,
        name: confirmed.name,
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        service: confirmed.service,
        date: confirmed.date,
        timeSlot: confirmed.timeSlot,
        message: doctorNote ?? null,
      });
      toast({
        title: "Receipt downloaded",
        description: `Token ${formatToken(confirmed.tokenNumber)} — keep it handy for the reception.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't generate the receipt",
        description: "Please try again, or take a screenshot of this screen instead.",
      });
    } finally {
      setReceiptBusy(false);
    }
  }, [confirmed, form.phone, form.email, doctorNote, toast]);

  /* ---------- Step rail ---------- */

  const railStep = Math.min(step, 3) as 1 | 2 | 3;

  return (
    <Dialog open={bookingOpen} onOpenChange={(open) => !open && closeBooking()}>
      <DialogContent
        showCloseButton={false}
        // Chromium lets clicks pass through its native <input type="date">
        // calendar popup onto the page (crbug 725566) — a stray click used to
        // land on the overlay and wipe a half-filled booking. Dismissal now
        // happens only via the X button or Escape (safer for a booking form).
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className={cn(
          "gap-0 overflow-hidden p-0",
          // Mobile: floating bottom sheet — 8px air on every side, fully rounded
          "fixed inset-x-2 bottom-2 top-auto left-auto right-auto",
          "translate-x-0 translate-y-0 w-full max-w-none",
          // Desktop: centered card
          "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto",
          "sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md",
          "max-h-[calc(100svh-1rem)] sm:max-h-[88svh]",
          "rounded-[1.75rem] border-border/60 bg-card",
          "shadow-[0_24px_70px_rgb(9,30,54,0.35),0_4px_16px_rgb(9,30,54,0.10)]",
          "data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:slide-out-to-bottom-4",
          "duration-300"
        )}
      >
        <div className="scrollbar-thin max-h-[calc(100svh-1rem)] overflow-y-auto sm:max-h-[88svh]">
          {/* ------------------------- Header ------------------------- */}
          <div className="relative border-b border-border/60 px-5 pb-5 pt-5 sm:px-7">
            {/* Mobile grab handle */}
            <span
              className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border/80 sm:hidden"
              aria-hidden
            />

            <button
              type="button"
              onClick={closeBooking}
              aria-label="Close booking dialog"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
                aria-hidden
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <DialogHeader className="gap-0 pt-2 text-left sm:pt-0">
              <div className="flex items-center gap-3.5 pr-10">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/70 ring-1 ring-inset ring-border/50">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={44}
                    height={44}
                    className="size-9 object-contain"
                  />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="font-display text-xl font-semibold leading-tight text-foreground">
                    Book an appointment
                  </DialogTitle>
                  <DialogDescription className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                    Punjab Dental Surgery · Johar Town, Lahore
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Quiet step progress — micro copy + hairline segments */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className={MICRO}>
                  {step === 4 ? "All set" : `Step ${railStep} of 3`}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground/70">
                  {step === 4 ? "Confirmed" : STEP_LABELS[railStep - 1]}
                </span>
              </div>
              <div className="mt-2.5 flex gap-1.5" aria-hidden>
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-300",
                      step === 4 || n < railStep
                        ? "bg-primary"
                        : n === railStep
                          ? "bg-primary/40"
                          : "bg-border/80"
                    )}
                  />
                ))}
              </div>
            </div>
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
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
                      How can we help you today?
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pick a visit type — you can add details below.
                    </p>
                  </div>

                  {/* Visit type */}
                  <div className="flex flex-col gap-2">
                    <span className={MICRO}>Visit type</span>
                    <div className="flex items-center gap-3.5 rounded-2xl border border-primary/30 bg-secondary/50 p-4">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                        aria-hidden
                      >
                        <Stethoscope className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-foreground">
                          {visitLabel}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                          {visitService === "General Dental Checkup"
                            ? "Not sure what you need? A checkup is the perfect start."
                            : "Selected from our services."}
                        </p>
                      </div>
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        aria-hidden
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    </div>
                  </div>

                  {/* Optional problem / purpose — box stays empty, no placeholder */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-end justify-between gap-3">
                      <Label
                        htmlFor="booking-reason"
                        className="text-[13px] font-medium text-foreground"
                      >
                        Anything we should know?{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
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
                      rows={4}
                      className="resize-none rounded-xl border-border/80 bg-background text-[15px] leading-relaxed"
                    />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Any pain, sensitivity or reason for your visit — the doctor
                      reviews this before you arrive.
                    </p>
                  </div>

                  <Button className={BTN_PRIMARY} onClick={() => goTo(2)}>
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
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
                        Date &amp; time
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Open every day, 5 PM – 12 AM.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={back}
                    >
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-date" className={MICRO}>
                      Appointment date
                    </Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={date}
                      min={todayStr}
                      max={maxDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="booking-slot" className={MICRO}>
                      Time slot
                    </Label>
                    <Select
                      value={slot ?? undefined}
                      onValueChange={(v) => {
                        setSlot(v);
                        if (v !== CUSTOM_SLOT) setCustomTime("");
                      }}
                      disabled={
                        !date ||
                        availLoading ||
                        Boolean(availability?.closed || availability?.past)
                      }
                    >
                      <SelectTrigger
                        id="booking-slot"
                        aria-label="Choose a time slot"
                        className={cn(INPUT_CLS, "w-full")}
                      >
                        <SelectValue
                          placeholder={date ? "Choose a time" : "Pick a date first"}
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 rounded-2xl">
                        {TIME_SLOTS.map((s) => (
                          <SelectItem key={s} value={s} className="rounded-xl">
                            {s}
                          </SelectItem>
                        ))}
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
                      <div className="flex flex-col gap-2 rounded-2xl border border-primary/25 bg-secondary/50 p-4">
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
                          className={INPUT_CLS}
                        />
                        <p className="text-xs text-muted-foreground">
                          Clinic hours: 5:00 PM – 12:00 AM. Any time in between works
                          — e.g. 6:45 PM.
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
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50 p-3.5 text-sm text-amber-900">
                      <TriangleAlert
                        className="mt-0.5 size-4 shrink-0 text-amber-500"
                        aria-hidden
                      />
                      The clinic is closed on that day — please pick another day.
                    </div>
                  )}
                  {date && availability?.past && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50 p-3.5 text-sm text-amber-900">
                      <TriangleAlert
                        className="mt-0.5 size-4 shrink-0 text-amber-500"
                        aria-hidden
                      />
                      That date has already passed — please pick today or a future
                      date.
                    </div>
                  )}

                  {date && availLoading && (
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-12 rounded-xl" />
                    </div>
                  )}

                  {date && availability && !availLoading && !availability.closed && !availability.past && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="size-3.5 text-green-600" aria-hidden />
                      All times stay open — several patients can share the same
                      time, you&apos;ll get your token on arrival.
                    </p>
                  )}

                  <Button
                    className={BTN_PRIMARY}
                    disabled={
                      !date ||
                      !effectiveSlot ||
                      customOutOfRange ||
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
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
                        Your details
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We&apos;ll call to confirm.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={back}
                    >
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </Button>
                  </div>

                  {/* Summary card — quiet receipt with hairline dividers */}
                  <dl className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-secondary/40">
                    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
                      <dt className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                        <NotebookPen className="size-3.5" aria-hidden />
                        Purpose
                      </dt>
                      <dd className="line-clamp-2 text-right text-[13px] font-semibold text-foreground">
                        {effectiveService}
                      </dd>
                    </div>
                    {doctorNote && (
                      <div className="flex items-start justify-between gap-4 px-4 py-2.5">
                        <dt className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                          <PenLine className="size-3.5" aria-hidden />
                          Note
                        </dt>
                        <dd className="line-clamp-2 text-right text-[13px] text-foreground/80">
                          {doctorNote}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                        <CalendarCheck className="size-3.5" aria-hidden />
                        Date
                      </dt>
                      <dd className="text-right text-[13px] font-semibold text-foreground">
                        {prettyDate(date)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                      <dt className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden />
                        Time
                      </dt>
                      <dd className="text-[13px] font-semibold text-foreground">
                        {effectiveSlot}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="booking-name">Full name *</Label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <Input
                          id="booking-name"
                          value={form.name}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, name: e.target.value }))
                          }
                          placeholder="e.g. Ali Raza"
                          autoComplete="name"
                          aria-invalid={Boolean(errors.name)}
                          className={cn(INPUT_CLS, "pl-10")}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
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
                          onChange={(e) =>
                            setForm((f) => ({ ...f, phone: e.target.value }))
                          }
                          placeholder="03XX-XXXXXXX"
                          autoComplete="tel"
                          aria-invalid={Boolean(errors.phone)}
                          className={cn(INPUT_CLS, "pl-10")}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
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
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                          placeholder="you@example.com"
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                          className={cn(INPUT_CLS, "pl-10")}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 shrink-0 text-green-600" aria-hidden />
                    No advance payment — you pay at the clinic after your visit.
                  </p>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    By booking you agree to our{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Privacy Policy
                    </a>{" "}
                    — your details are used only to manage your appointment.
                  </p>

                  {submitError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-red-50 p-3.5 text-sm text-destructive"
                    >
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {submitError}
                    </div>
                  )}

                  <Button
                    className={BTN_PRIMARY}
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
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-5 pb-2 pt-3 text-center"
                >
                  <div className="relative">
                    {/* Soft celebratory sparkles */}
                    {[
                      { c: "bg-primary/70", x: "-34px", y: "-6px", d: 0.15 },
                      { c: "bg-teal-400/80", x: "30px", y: "-14px", d: 0.2 },
                      { c: "bg-green-400/80", x: "-22px", y: "26px", d: 0.28 },
                      { c: "bg-sky-400/80", x: "26px", y: "22px", d: 0.24 },
                      { c: "bg-primary/50", x: "0px", y: "-26px", d: 0.32 },
                    ].map((s, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0.9],
                          scale: [0, 1.15, 0.85],
                          x: s.x,
                          y: s.y,
                        }}
                        transition={{ delay: 0.25 + s.d, duration: 0.5, ease: "easeOut" }}
                        className={`absolute left-1/2 top-1/2 size-2 rounded-full ${s.c}`}
                        aria-hidden
                      />
                    ))}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 16,
                        delay: 0.05,
                      }}
                      className="flex size-20 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-100/60"
                    >
                      <CheckCircle2 className="size-10 text-green-600" aria-hidden />
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      You&apos;re booked in!
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We&apos;ll call you shortly to confirm — please arrive 10
                      minutes early.
                    </p>
                  </div>

                  {/* Token number — the patient's queue position for the day */}
                  <div className="w-full rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
                    <p className={cn(MICRO, "text-center")}>Your token number</p>
                    <p
                      aria-label={`Token number ${formatToken(confirmed.tokenNumber)}`}
                      className="mt-1.5 text-center font-display text-[2.75rem] font-bold leading-none tabular-nums tracking-wide text-primary"
                    >
                      {formatToken(confirmed.tokenNumber)}
                    </p>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Show this number at the reception when you arrive.
                    </p>
                  </div>

                  <dl className="w-full divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-secondary/40 text-left">
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="truncate font-semibold text-foreground">
                        {confirmed.name}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="shrink-0 text-muted-foreground">Purpose</dt>
                      <dd className="max-w-52 truncate font-semibold text-foreground">
                        {confirmed.service}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="shrink-0 text-muted-foreground">Date</dt>
                      <dd className="text-right font-semibold text-foreground">
                        {prettyDate(confirmed.date)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                      <dt className="shrink-0 text-muted-foreground">Time</dt>
                      <dd className="font-semibold text-foreground">
                        {confirmed.timeSlot}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    className={BTN_PRIMARY}
                    onClick={handleDownloadReceipt}
                    disabled={receiptBusy}
                  >
                    {receiptBusy ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                        Preparing receipt…
                      </>
                    ) : (
                      <>
                        <Download className="size-4" aria-hidden />
                        Download Receipt (PDF)
                      </>
                    )}
                  </Button>

                  <div className="flex w-full flex-col gap-2.5 sm:flex-row">
                    <Button
                      variant="outline"
                      className="h-12 w-full flex-1 rounded-xl text-[15px] font-semibold"
                      onClick={closeBooking}
                    >
                      Done
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 w-full flex-1 rounded-xl text-[15px] font-semibold"
                      onClick={() => {
                        setConfirmed(null);
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
