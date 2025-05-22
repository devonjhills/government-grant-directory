import type { Metadata, ResolvingMetadata } from "next"; // Import Metadata types
import type { Grant } from "@/types";
import { fetchMockGrantById } from "./metadata";
import GrantDetailClient from "./GrantDetailClient";

interface GrantDetailPageProps {
  params: { id: string };
}

export async function generateMetadata(
  { params }: GrantDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const grant = fetchMockGrantById(params.id); // Uses the mock fetcher defined in this file

  if (!grant) {
    return {
      title: "Grant Not Found",
      description: "The grant you are looking for could not be found.",
    };
  }

  // Helper function to determine if a title is meaningful
  function isMeaningfulTitle(title: string): boolean {
    // Consider titles with mostly uppercase letters, dashes, and numbers as codes (non-meaningful)
    const codePattern = /^[A-Z0-9\-]+$/;
    return !codePattern.test(title);
  }

  // Compose a meaningful title for metadata
  function getMeaningfulTitle(grant: Grant): string {
    if (grant.title && isMeaningfulTitle(grant.title)) {
      return grant.title;
    }
    // Fallback: combine agency and opportunityNumber or generic label
    if (grant.agency && grant.opportunityNumber) {
      return `${grant.agency} Grant - Opportunity ${grant.opportunityNumber}`;
    }
    if (grant.agency) {
      return `${grant.agency} Grant Opportunity`;
    }
    return "Government Grant Details";
  }

  const meaningfulTitle = getMeaningfulTitle(grant);

  const descriptionSnippet = grant.description
    ? grant.description.substring(0, 160) + "..."
    : "No description available.";
  const keywords = grant.categories
    ? [...grant.categories, grant.agency, "government grant", params.id]
    : [grant.agency, "government grant", params.id];

  // Assuming metadataBase is set in app/layout.tsx (e.g., https://www.grantfinder.example.com)
  // The URL for Open Graph should be absolute.
  const ogUrl = `/grants/${grant.id}`; // metadataBase will prepend the domain

  return {
    title: meaningfulTitle, // Use meaningful title for SEO
    description: descriptionSnippet,
    keywords: keywords,
    openGraph: {
      title: meaningfulTitle, // Use meaningful title for SEO
      description: descriptionSnippet,
      type: "article",
      url: ogUrl,
      images: [
        {
          url: "/og-image-grant-specific.png", // New grant specific OG image
          width: 1200,
          height: 630,
          alt: `Details for ${meaningfulTitle}`,
        },
      ],
      siteName: (await parent).openGraph?.siteName || "Grant Finder", // Inherit siteName
    },
    twitter: {
      // Optional: Add Twitter specific card
      card: "summary_large_image",
      title: meaningfulTitle,
      description: descriptionSnippet,
      images: ["/og-image-grant-specific.png"], // New grant specific OG image
    },
  };
}

export default function GrantDetailPage({ params }: GrantDetailPageProps) {
  return <GrantDetailClient params={params} />;
}
