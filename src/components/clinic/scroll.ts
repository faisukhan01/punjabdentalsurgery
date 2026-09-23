/** Smooth-scrolls to a section id, respecting the sticky navbar via scroll-mt classes. */
export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
