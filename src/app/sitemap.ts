import type { MetadataRoute } from "next";
import { getAllPublishedPostSlugs, getCategories } from "@/lib/data";

const BASE_URL = "https://blog.puravive.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    getAllPublishedPostSlugs(),
    getCategories(),
  ]);

  return [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({
      url: `${BASE_URL}/categoria/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
