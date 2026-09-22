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
  MoonStar,
  SunMedium,
  TriangleAlert,
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
  SERVICE_NAMES,
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

const STEP_LABELS = ["Service", "Date & Time", "Details", "Done"] as const;

const MORNING_SLOTS = TIME_SLOTS.slice(0, 8) as readonly string[];
const EVENING_SLOTS = TIME_SLOTS.slice(8) as readonly string[];

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
      preselectedService &&
      (SERVICE_NAMES as readonly string[]).includes(preselectedService)
        ? preselectedService
        : null;
    setDir(1);
    setService(pre);
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
    if (!service || !date || !slot || !validateForm()) return;
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
          service,
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
      return "border-primary bg-primary text-primary-foreground shadow-[0_6px_18px_rgb(156,28,35,0.35)]";
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
      <DialogContent className="scrollbar-thin max-h-[92svh] w-[95vw] gap-0 overflow-y-auto rounded-3xl p-0 sm:max-w-lg">
        <DialogHeader className="gap-1.5 border-b border-border/60 p-5 text-left sm:p-6">
          <DialogTitle className="flex items-center gap-2.5 font-display text-xl">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CalendarCheck className="size-4.5" aria-hidden />
            </span>
            Book Your Appointment
          </DialogTitle>
          <DialogDescription>
            Under a minute — pick a service, choose a time, done.
          </DialogDescription>

          {/* Progress */}
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
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
                      active
                        ? "text-primary"
                        : done
                          ? "text-red-600"
                          : "text-muted-foreground/70"
                    }`}
                    aria-current={active ? "step" : undefined}
                  >
                    {done ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : (
                      <span
                        className={`size-1.5 rounded-full ${
                          active ? "bg-primary" : "bg-muted-foreground/40"
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
        </DialogHeader>

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {/* ------------------------------ STEP 1: SERVICE ------------------------------ */}
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
                  <h3 className="font-display text-lg font-semibold">What do you need help with?</h3>
                  <p className="text-sm text-muted-foreground">Pick a service to continue.</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {SERVICE_NAMES.map((name) => {
                    const selected = service === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setService(name)}
                        aria-pressed={selected}
                        className={`flex min-h-[44px] items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-left text-[13px] font-medium leading-snug transition-all ${
                          selected
                            ? "border-primary bg-secondary text-primary shadow-[0_6px_18px_rgb(156,28,35,0.18)]"
                            : "border-border bg-card text-foreground/85 hover:border-primary/40 hover:bg-secondary/50"
                        }`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                          aria-hidden
                        >
                          {selected && <Check className="size-3" />}
                        </span>
                        {name}
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="mt-1 h-12 rounded-full text-[15px] font-semibold"
                  disabled={!service}
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
                    <h3 className="font-display text-lg font-semibold">Choose date & time</h3>
                    <p className="text-sm text-muted-foreground">
                      {service && <span className="font-medium text-primary">{service}</span>}
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
                    className="h-11 rounded-xl"
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
                  className="mt-1 h-12 rounded-full text-[15px] font-semibold"
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
                    <h3 className="font-display text-lg font-semibold">Your details</h3>
                    <p className="text-sm text-muted-foreground">We&apos;ll call to confirm.</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-9 shrink-0" onClick={back}>
                    <ArrowLeft className="size-4" aria-hidden />
                    Back
                  </Button>
                </div>

                {/* Summary line */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-secondary/70 px-4 py-3 text-[13px] text-secondary-foreground">
                  <span className="font-semibold">{service}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarCheck className="size-3.5" aria-hidden />
                    {prettyDate(date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {slot}
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-name">Full name *</Label>
                    <Input
                      id="booking-name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Ali Raza"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      className="h-11 rounded-xl"
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-phone">Phone number *</Label>
                    <Input
                      id="booking-phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="03XX-XXXXXXX"
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.phone)}
                      className="h-11 rounded-xl"
                    />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-email">Email (optional)</Label>
                    <Input
                      id="booking-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      className="h-11 rounded-xl"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="booking-message">Message (optional)</Label>
                    <Textarea
                      id="booking-message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Anything the doctor should know? Pain, allergies, previous treatment…"
                      rows={3}
                      className="resize-none rounded-xl"
                    />
                  </div>
                </div>

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
                  className="mt-1 h-12 rounded-full text-[15px] font-semibold shadow-[0_10px_28px_rgb(156,28,35,0.35)]"
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
                className="flex flex-col items-center gap-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
                  className="flex size-20 items-center justify-center rounded-full bg-green-100"
                >
                  <CheckCircle2 className="size-12 text-green-600" aria-hidden />
                </motion.div>

                <div>
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    Booking Confirmed!
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;ll call you shortly to confirm. Please arrive 10 minutes early.
                  </p>
                </div>

                <div className="w-full rounded-2xl border border-border/70 bg-secondary/50 p-4 text-left">
                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-semibold text-foreground">{confirmed.name}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Service</dt>
                      <dd className="font-semibold text-foreground">{confirmed.service}</dd>
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
                    className="h-12 flex-1 rounded-full text-[15px] font-semibold"
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
      </DialogContent>
    </Dialog>
  );
}
