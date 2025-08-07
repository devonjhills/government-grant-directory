import type { Metadata } from "next";
import NonprofitFundingClient from "./NonprofitFundingClient";
import { searchGrants } from "@/app/services/grantsGovService";
import type { Grant } from "@/types";

// Metadata copied from the old client page
export const metadata: Metadata = {
  title: "Nonprofit Funding Opportunities | Grant Finder",
  description:
    "Discover grants and funding opportunities tailored for nonprofit organizations. Support your mission with the right financial resources.",
  keywords: [
    "nonprofit grants",
    "charity funding",
    "foundation grants",
    "501c3 grants",
  ],
  openGraph: {
    title: "Nonprofit Funding Opportunities | Grant Finder",
    description:
      "Support your mission with the right financial resources through various grant programs.",
    url: "/topics/nonprofit-funding", // Relative to metadataBase
    images: [
      {
        url: "/og-image-grant-listings.png", // New grant listings OG image
        width: 1200,
        height: 630,
        alt: "Funding for Nonprofits on Grant Finder",
      },
    ],
    siteName: "Grant Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nonprofit Funding Opportunities | Grant Finder",
    description: "Support your mission with the right financial resources.",
    images: ["/og-image-grant-listings.png"], // New grant listings OG image
  },
};

export default async function NonprofitFundingPage() {
  let grantsData: Grant[] = [];
  let pageError: string | null = null;

  let featuredGrantsData: Grant[] = [];
  let featuredError: string | null = null;

  try {
    const response = await searchGrants({
      keyword: "nonprofit OR community",
      oppStatuses: "posted",
      rows: 6,
    });
    grantsData = response.grants || [];
    if (grantsData.length === 0) {
      pageError =
        "No featured grants for nonprofit funding found at this time.";
    }
  } catch (err) {
    console.error("Failed to fetch nonprofit grants for server page:", err);
    pageError = "Failed to load grants. Please try again later.";
    // grantsData will remain empty
  }

  try {
    const featuredResponse = await searchGrants({
      keyword: "business",
      oppStatuses: "posted",
      rows: 5,
    });
    featuredGrantsData = Array.isArray(featuredResponse.grants)
      ? featuredResponse.grants
      : [];
    if (featuredGrantsData.length === 0) {
      featuredError = "No featured grants found from API.";
    }
  } catch (err) {
    console.error(
      "Failed to fetch featured grants for nonprofit funding page:",
      err,
    );
    featuredError = "Could not load featured grants.";
  }

  return (
    <NonprofitFundingClient
      initialGrants={grantsData}
      initialError={pageError}
      initialFeaturedGrants={featuredGrantsData}
      initialFeaturedError={featuredError}
    />
  );
}
