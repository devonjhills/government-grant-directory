import type { Metadata, ResolvingMetadata } from "next"; // Import Metadata types
import type { Opportunity } from "@/types";
import { unifiedOpportunityService } from "@/app/services/unifiedOpportunityService";
import { enhancedDataEnrichment } from "@/app/lib/enhanced-data-enrichment";
import GrantDetailClient from "./GrantDetailClient";

interface GrantDetailPageProps {
  params: { id: string };
}

export async function generateMetadata(
  { params }: GrantDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const opportunity = await unifiedOpportunityService.getOpportunityById(
    params.id,
  );

  if (!opportunity) {
    return {
      title: "Grant Not Found",
      description: "The grant you are looking for could not be found.",
    };
  }

  // Helper function to determine if a title is meaningful
  function isMeaningfulTitle(title: string): boolean {
    const codePattern = /^[A-Z0-9\-]+$/;
    return !codePattern.test(title);
  }

  // Compose a meaningful title for metadata
  function getMeaningfulTitle(opp: Opportunity): string {
    if (opp.title && isMeaningfulTitle(opp.title)) {
      return opp.title;
    }
    if (opp.agency && opp.opportunityNumber) {
      return `${opp.agency} ${opp.type === "grant" ? "Grant" : "Contract"} - Opportunity ${opp.opportunityNumber}`;
    }
    if (opp.agency) {
      return `${opp.agency} ${opp.type === "grant" ? "Grant" : "Contract"} Opportunity`;
    }
    return "Government Funding Opportunity";
  }

  const meaningfulTitle = getMeaningfulTitle(opportunity);

  // Enhanced description with funding amount and deadline info
  let enhancedDescription = opportunity.description
    ? opportunity.description.replace(/<[^>]*>/g, "").substring(0, 120)
    : "Explore this government funding opportunity.";

  if (opportunity.amount > 0) {
    enhancedDescription += ` Funding: $${opportunity.amount.toLocaleString()}.`;
  }

  if (opportunity.deadline) {
    const deadline = new Date(opportunity.deadline);
    enhancedDescription += ` Deadline: ${deadline.toLocaleDateString()}.`;
  }

  enhancedDescription = enhancedDescription.substring(0, 160);

  // Enhanced keywords with opportunity type and categories
  const keywords = [
    ...(opportunity.categories || []),
    opportunity.agency,
    `government ${opportunity.type}`,
    "federal funding",
    "grants.gov",
    opportunity.type,
    ...(opportunity.industryCategories || []),
    params.id,
  ].filter(Boolean);

  const ogUrl = `/grants/${opportunity.id}`;

  return {
    title: meaningfulTitle,
    description: enhancedDescription,
    keywords: keywords,
    openGraph: {
      title: meaningfulTitle,
      description: enhancedDescription,
      type: "article",
      url: ogUrl,
      images: [
        {
          url: "/og-image-grant-specific.png",
          width: 1200,
          height: 630,
          alt: `Details for ${meaningfulTitle}`,
        },
      ],
      siteName:
        (await parent).openGraph?.siteName || "Government Grant Directory",
    },
    twitter: {
      card: "summary_large_image",
      title: meaningfulTitle,
      description: enhancedDescription,
      images: ["/og-image-grant-specific.png"],
    },
    // Enhanced structured data for better SEO
    alternates: {
      canonical: ogUrl,
    },
  };
}

export default function GrantDetailPage({ params }: GrantDetailPageProps) {
  return <GrantDetailClient params={params} />;
}
