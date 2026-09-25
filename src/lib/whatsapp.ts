import { CLINIC } from "@/lib/clinic";

/**
 * Click handler for every WhatsApp link on the site.
 *
 * The universal wa.me short-link first bounces through a 302 to an
 * api.whatsapp.com web page — patients saw that as "it trips through a
 * website before WhatsApp opens". This skips the hop entirely:
 * - phones & tablets: the whatsapp:// deep link opens the installed app
 *   straight away (no browser page in between);
 * - desktop: opens the WhatsApp Web chat for the clinic number directly,
 *   in a new tab so the clinic site stays open.
 * The anchors keep their wa.me href as a graceful no-JS fallback.
 */
export function handleWhatsAppClick(e: { preventDefault(): void }): void {
  e.preventDefault();

  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const mobileUA = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (coarse || mobileUA) {
    // Straight into the installed app — no interstitial page.
    window.location.href = `whatsapp://send?phone=${CLINIC.whatsappNumber}`;
    return;
  }
  // Desktop — straight to the WhatsApp Web chat in a new tab.
  window.open(
    `https://web.whatsapp.com/send?phone=${CLINIC.whatsappNumber}`,
    "_blank",
    "noopener,noreferrer"
  );
}
