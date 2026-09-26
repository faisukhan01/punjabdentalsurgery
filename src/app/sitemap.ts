import type { MetadataRoute } from "next";
import { CLINIC } from "@/lib/clinic";
import { SERVICES } from "@/lib/services-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${CLINIC.website}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...SERVICES.map((s) => ({
      url: `${CLINIC.website}/services/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${CLINIC.website}/privacy`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];
}
