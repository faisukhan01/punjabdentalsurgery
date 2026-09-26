import Link from "next/link";
import { Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/clinic/navbar";
import { Footer } from "@/components/clinic/footer";
import { CLINIC } from "@/lib/clinic";

export const metadata = {
  title: "Page not found | Punjab Dental Surgery",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar solid />
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-32">
        <div className="mx-auto max-w-md text-center">
          <p className="font-display text-7xl font-semibold text-primary/20">404</p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            This page went hiding
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            The page you are looking for does not exist or has moved. Your
            smile is still exactly where you left it though.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <Link href="/">
                <Home className="size-5" aria-hidden />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-7">
              <a href={CLINIC.phoneHref}>
                <Phone className="size-5" aria-hidden />
                {CLINIC.phone}
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
