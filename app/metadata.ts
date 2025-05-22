import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Search Government Grants", // Will use template: "Search Government Grants | Grant Finder"
  description:
    "Find and explore a wide directory of government grants for small businesses and non-profits. Start your search today!",
  keywords: [
    "grant search",
    "funding opportunities",
    "small business",
    "non-profit",
    "government funding",
  ],
  openGraph: {
    title: "Search Government Grants | Grant Finder", // Explicit full title for OG
    description:
      "Find and explore a wide directory of government grants for small businesses and non-profits. Start your search today!",
    type: "website",
    url: "/", // In a real app, this should be the absolute URL to the homepage
  },
};
