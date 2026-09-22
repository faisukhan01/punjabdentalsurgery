"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { CLINIC } from "@/lib/clinic";

interface PinGateProps {
  onVerified: (pin: string) => void;
}

/** Full-screen PIN entry gate for the admin panel. */
export function PinGate({ onVerified }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [checking, setChecking] = useState(false);

  const submit = async (value: string) => {
    if (value.length !== 4 || checking) return;
    setChecking(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });
      if (res.ok) {
        onVerified(value);
        return;
      }
      setError(true);
      setErrorCount((c) => c + 1);
      setPin("");
    } catch {
      setError(true);
      setErrorCount((c) => c + 1);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <motion.div
        key={errorCount}
        initial={error ? { x: 0 } : { opacity: 0, y: 16 }}
        animate={
          error
            ? { x: [0, -12, 12, -9, 9, -5, 5, 0] }
            : { opacity: 1, y: 0 }
        }
        transition={error ? { duration: 0.5 } : { duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-7 text-center shadow-[0_16px_48px_rgb(13,148,136,0.14)] sm:p-8"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <LockKeyhole className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          Enter Admin PIN
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {CLINIC.name} staff access only.
        </p>

        <div className="mt-6 flex justify-center">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(v) => {
              setPin(v);
              setError(false);
              if (v.length === 4) void submit(v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit(pin);
            }}
            disabled={checking}
            aria-label="4-digit admin PIN"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-12 rounded-xl border-2 text-lg" />
              <InputOTPSlot index={1} className="size-12 rounded-xl border-2 text-lg" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={2} className="size-12 rounded-xl border-2 text-lg" />
              <InputOTPSlot index={3} className="size-12 rounded-xl border-2 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-destructive">
            Incorrect PIN — please try again.
          </p>
        )}

        <Button
          className="mt-5 h-12 w-full rounded-full text-[15px] font-semibold"
          disabled={checking || pin.length !== 4}
          onClick={() => void submit(pin)}
        >
          {checking ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Checking…
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" aria-hidden />
              Unlock Admin Panel
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
