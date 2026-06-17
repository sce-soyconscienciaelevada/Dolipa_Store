import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/products";

const SITE_URL = process.env["NEXT_PUBLIC_SITE_URL"] || "https://dolipa-store.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/productos/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...categoryUrls,
    ...productUrls,
  ];
}
