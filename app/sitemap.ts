import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.grantfinder.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Static pages with enhanced structure for AI crawling
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/grants`,
      lastModified: currentDate,
      changeFrequency: "hourly", // Frequent updates for opportunity listings
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contracts`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/procurement`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics/nonprofit-funding`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics/small-business-grants`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics/federal-contracts`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics/state-opportunities`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/glossary`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Category pages for better AI discovery
    {
      url: `${BASE_URL}/categories/research-development`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories/healthcare`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories/education`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories/technology`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories/infrastructure`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories/environmental`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    // Agency-specific pages
    {
      url: `${BASE_URL}/agencies/nsf`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/agencies/nih`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/agencies/dod`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/agencies/sba`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    // Set-aside specific pages
    {
      url: `${BASE_URL}/set-asides/8a`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/set-asides/hubzone`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/set-asides/sdvosb`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/set-asides/wosb`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Dynamic opportunity routes would be added here in production
  // For now, we'll include placeholder routes that indicate dynamic content
  const dynamicPlaceholderRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/opportunities/recent`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/opportunities/closing-soon`,
      lastModified: currentDate,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/opportunities/high-value`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...dynamicPlaceholderRoutes];
}

// Separate sitemap for opportunities to avoid overwhelming main sitemap
export async function generateOpportunitiesSitemap(): Promise<MetadataRoute.Sitemap> {
  // This would fetch recent opportunities and generate URLs
  // Implementation would go here when APIs are connected
  return [];
}
