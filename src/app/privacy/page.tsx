import type { Metadata } from "next";
import { Navbar } from "@/components/clinic/navbar";
import { Footer } from "@/components/clinic/footer";
import { CLINIC } from "@/lib/clinic";

export const metadata: Metadata = {
  title: "Privacy Policy | Punjab Dental Surgery",
  description:
    "How Punjab Dental Surgery collects, uses and protects the information you share when booking an appointment — plain language, no legal fog.",
  alternates: { canonical: "/privacy" },
};

const SECTION =
  "mt-8 rounded-2xl border border-border/70 bg-card p-5 sm:p-6";
const H2 = "font-display text-xl font-semibold text-foreground";
const P = "mt-2.5 text-[15px] leading-relaxed text-muted-foreground";

/**
 * Privacy Policy — plain-language statement covering exactly what this
 * website collects (booking details + anonymous visit counter) and how it
 * is used. Last updated date shown for transparency.
 */
export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar solid />

      <main id="main" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
            Legal
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Punjab Dental Surgery · {CLINIC.address} · Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className={P}>
            We keep this short and in plain language. If anything here is
            unclear, call or WhatsApp {CLINIC.phone} and we will explain it.
          </p>

          <section className={SECTION}>
            <h2 className={H2}>What we collect</h2>
            <p className={P}>This website collects only what it needs:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground/80">Booking details</strong>{" "}
                — your name, phone number, the treatment you selected, your
                chosen date and time, and (optionally) a short note about why
                you are coming.
              </li>
              <li>
                <strong className="text-foreground/80">
                  Anonymous visit counts
                </strong>{" "}
                — a random ID stored in your browser, used only to count
                website visits. It contains no name, no phone number and
                nothing personal.
              </li>
            </ul>
          </section>

          <section className={SECTION}>
            <h2 className={H2}>How your booking details are used</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
              <li>To manage your appointment — confirming, preparing for your visit, and managing the day&rsquo;s queue (your token number).</li>
              <li>To contact you about this appointment, by phone or WhatsApp, if needed.</li>
              <li>Nothing else. We do not sell, rent or share your details with anyone, and we do not send marketing messages.</li>
            </ul>
          </section>

          <section className={SECTION}>
            <h2 className={H2}>Health information</h2>
            <p className={P}>
              The booking note is optional — please share only what helps the
              clinic prepare for your visit. Detailed medical history is
              discussed at the clinic itself, not collected through this
              website.
            </p>
          </section>

          <section className={SECTION}>
            <h2 className={H2}>Your choices</h2>
            <p className={P}>
              You can ask us at any time to show, correct or delete your
              booking details — call or WhatsApp {CLINIC.phone} and it will be
              done. You can also clear the anonymous visit ID any time by
              clearing your browser storage.
            </p>
          </section>

          <section className={SECTION}>
            <h2 className={H2}>Terms of use</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
              <li>
                The information on this website is general in nature — it is
                not a diagnosis or a substitute for an in-clinic examination
                by a qualified dental surgeon.
              </li>
              <li>
                An online booking is a request for an appointment slot; if
                anything needs to change, the clinic will contact you on the
                number you provided.
              </li>
              <li>
                Treatment costs are always quoted before treatment starts;
                website content does not constitute a price offer.
              </li>
              <li>
                For dental emergencies, call {CLINIC.phone} directly rather
                than waiting for an online reply.
              </li>
            </ul>
          </section>

          <section className={SECTION}>
            <h2 className={H2}>Contact</h2>
            <p className={P}>
              Questions about this policy: {CLINIC.doctor}, {CLINIC.name} —{" "}
              {CLINIC.phone} (call or WhatsApp), {CLINIC.address}.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
