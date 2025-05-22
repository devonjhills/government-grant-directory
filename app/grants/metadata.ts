import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Grant Search Results", // Will use template: "Grant Search Results | Grant Finder"
  description:
    "Explore grant search results based on your criteria. Filter and find the best funding opportunities for your needs.",
  openGraph: {
    title: "Grant Search Results | Grant Finder", // Explicit full title for OG
    description:
      "Explore grant search results based on your criteria. Filter and find the best funding opportunities.",
    type: "website",
    url: "/grants", // In a real app, this should be an absolute URL
  },
};
