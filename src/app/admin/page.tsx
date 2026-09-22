import type { Metadata } from "next";
import { AdminPanel } from "@/components/clinic/admin/admin-panel";

export const metadata: Metadata = {
  title: "Admin Panel — Punjab Dental Surgery",
  // Keep the dashboard out of search engines; it is reachable by direct URL only.
  robots: { index: false, follow: false },
};

/**
 * /admin — private dashboard, intentionally unlinked from the public site.
 * Access is gated by the PIN screen inside AdminPanel.
 */
export default function AdminPage() {
  return <AdminPanel />;
}
