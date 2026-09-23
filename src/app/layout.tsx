import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Punjab Dental Surgery — Dr. Muhammad Siddique (BDS, RDS) | Book Online",
  description:
    "Punjab Dental Surgery — modern, gentle dental care by Dr. Muhammad Siddique (BDS, RDS). Book your appointment online in under a minute. Cleanings, fillings, root canals, braces, implants, whitening & kids dentistry.",
  keywords: [
    "Punjab Dental Surgery",
    "Dr Muhammad Siddique",
    "dentist Punjab",
    "dental clinic Pakistan",
    "book dentist online",
    "teeth whitening",
    "root canal",
    "braces",
    "dental implants",
  ],
  authors: [{ name: "Punjab Dental Surgery" }],
  openGraph: {
    title: "Punjab Dental Surgery — Dr. Muhammad Siddique (BDS, RDS)",
    description:
      "Modern, gentle dental care. Book your appointment online in under a minute.",
    siteName: "Punjab Dental Surgery",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12588f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
