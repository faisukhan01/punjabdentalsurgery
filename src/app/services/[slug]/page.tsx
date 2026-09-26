import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CLINIC } from "@/lib/clinic";
import { SERVICES, findService } from "@/lib/services-content";
import { ServicePage } from "@/components/clinic/service-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) return {};

  const url = `/services/${service.slug}`;
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url,
      siteName: "Punjab Dental Surgery",
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${service.name} — Punjab Dental Surgery, ${CLINIC.address}`,
        },
      ],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();

  return <ServicePage service={service} />;
}
