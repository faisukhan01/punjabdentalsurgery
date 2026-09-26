import type { Metadata, Viewport } from "next";
import { Fredoka, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CLINIC } from "@/lib/clinic";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Dentist in Johar Town Lahore | Punjab Dental Surgery";
const SITE_DESCRIPTION =
  "Punjab Dental Surgery — a dental clinic in Johar Town, Lahore, led by Dr. Muhammad Siddique (BDS, RDS). Gentle dental checkups, teeth scaling, root canal treatment, braces, whitening and kids dentistry. Open every day 5 PM – 12 AM. Book online in under a minute.";

export const metadata: Metadata = {
  metadataBase: new URL(CLINIC.website),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "dentist in Johar Town Lahore",
    "dental clinic in Johar Town Lahore",
    "Punjab Dental Surgery",
    "Dr Muhammad Siddique dentist Lahore",
    "root canal treatment in Johar Town",
    "teeth scaling in Johar Town",
    "dental checkup Lahore",
    "braces and orthodontics Lahore",
    "teeth whitening Lahore",
    "kids dentist Johar Town",
    "emergency dental care Lahore",
    "book dentist online Pakistan",
  ],
  authors: [{ name: "Punjab Dental Surgery" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_TITLE,
    description:
      "Gentle, honest dental care by Dr. Muhammad Siddique (BDS, RDS) — Johar Town, Lahore. Open every day 5 PM – 12 AM. Book online in under a minute.",
    url: "/",
    siteName: "Punjab Dental Surgery",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Punjab Dental Surgery — dental clinic in Johar Town, Lahore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description:
      "Gentle, honest dental care by Dr. Muhammad Siddique (BDS, RDS) — Johar Town, Lahore. Open every day 5 PM – 12 AM.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12588f",
};

/** LocalBusiness / Dentist structured data — verified clinic information only. */
const dentistJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  "@id": `${CLINIC.website}/#dentist`,
  name: CLINIC.name,
  description:
    "Dental clinic in Johar Town, Lahore led by Dr. Muhammad Siddique (BDS, RDS) — gentle, honest dentistry for the whole family. Open every day 5 PM to 12 midnight.",
  url: `${CLINIC.website}/`,
  telephone: CLINIC.phone,
  image: `${CLINIC.website}/logo.png`,
  logo: `${CLINIC.website}/logo.png`,
  medicalSpecialty: "Dentistry",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Johar Town",
    addressLocality: "Lahore",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "17:00",
      closes: "00:00",
    },
  ],
  employee: {
    "@type": "Dentist",
    name: CLINIC.doctor,
    honorificSuffix: "BDS, RDS",
    jobTitle: "Dental Surgeon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${fredoka.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
