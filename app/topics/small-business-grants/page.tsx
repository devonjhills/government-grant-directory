import type { Metadata } from "next";
import SmallBusinessGrantsClient from "./SmallBusinessGrantsClient";
import { searchGrants } from "@/app/services/grantsGovService";
import type { Grant } from "@/types";

// Metadata copied from the old client page
export const metadata: Metadata = {
  title: "Small Business Grants | Grant Finder",
  description:
    "Explore a wide range of grants specifically for small businesses. Find funding for startup, growth, innovation, and more.",
  keywords: [
    "small business grants",
    "sme funding",
    "startup grants",
    "business financing",
  ],
  openGraph: {
    title: "Small Business Grants | Grant Finder",
    description:
      "Find funding for startup, growth, innovation, and more through various grant programs.",
    url: "/topics/small-business-grants", // Relative to metadataBase
    images: [
      {
        url: "/og-image-grant-listings.png", // New grant listings OG image
        width: 1200,
        height: 630,
        alt: "Grants for Small Businesses on Grant Finder",
      },
    ],
    siteName: "Grant Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Small Business Grants | Grant Finder",
    description: "Find funding for startup, growth, innovation, and more.",
    images: ["/og-image-grant-listings.png"],
  },
};

export default async function SmallBusinessGrantsPage() {
  let grantsData: Grant[] = [];
  let pageError: string | null = null;

  try {
    const response = await searchGrants({
      keyword: "small business",
      oppStatuses: "posted",
      rows: 6,
    });
    grantsData = response.grants || [];
    if (grantsData.length === 0) {
      pageError = "No featured grants for small businesses found at this time.";
    }
  } catch (err) {
    console.error(
      "Failed to fetch small business grants for server page:",
      err
    );
    pageError = "Failed to load grants. Please try again later.";
    // grantsData will remain empty
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
      <SmallBusinessGrantsClient
        initialGrants={grantsData}
        initialError={pageError}
      />
    </div>
  );
}
