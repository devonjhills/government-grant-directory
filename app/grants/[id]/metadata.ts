import type { Metadata, ResolvingMetadata } from "next";
import type { Grant } from "@/types";

// Mock data for grants
const detailedMockGrants: Grant[] = [
  {
    id: "srch-mock1",
    title: "Search Result Grant Alpha - Detailed View",
    agency: "Search Results Agency (SRA) - Department of Mock Initiatives",
    description:
      "This is the full, detailed description for Search Result Grant Alpha. It elaborates on the project's goals to foster innovation in renewable energy through comprehensive research grants. We are looking for proposals that outline clear methodologies, potential impacts, and a strong team. Successful applicants will contribute to a greener future.",
    eligibilityCriteria:
      "Eligible applicants include accredited universities, non-profit research institutions, and private sector companies with a proven track record in renewable energy research. Joint proposals are welcome. Applicants must be based in the mock country.",
    deadline: "2024-10-31",
    amount: 150000,
    linkToApply: "https://www.example.com/apply/srch-mock1",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00A-DETAILED",
    opportunityStatus: "posted",
    postedDate: "2024-03-01",
    categories: ["mock", "search", "energy", "research", "sustainability"],
  },
  {
    id: "srch-mock2",
    title: "Search Result Grant Beta - In-Depth Information",
    agency: "Search Results Agency (SRA) - Urban Development Office",
    description:
      "Grant Beta provides funding for community-led projects aimed at revitalizing urban areas. This detailed description outlines the types of projects we fund, including public space improvements, community center development, and local economic initiatives. We prioritize projects with strong community engagement and measurable outcomes.",
    eligibilityCriteria:
      "Eligible entities are non-profit community organizations with at least 3 years of operation, local government bodies, and community development corporations. Must serve designated urban renewal zones.",
    deadline: "2024-11-15",
    amount: 90000,
    linkToApply: "https://www.example.com/apply/srch-mock2",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00B-DETAILED",
    opportunityStatus: "posted",
    postedDate: "2024-03-05",
    categories: [
      "mock",
      "search",
      "community",
      "urban",
      "development",
      "non-profit",
    ],
  },
  {
    id: "mock-detail-only",
    title: "Special Grant - Not in General Search",
    agency: "Secret Mock Agency (SMA)",
    description:
      "This is a special grant available only via direct link for testing purposes. It focuses on advanced theoretical mock physics.",
    eligibilityCriteria:
      "Post-doctoral researchers with a PhD in mock physics.",
    deadline: "2025-03-01",
    amount: 250000,
    linkToApply: "https://www.example.com/apply/mock-detail-only",
    sourceAPI: "MockSecretDB",
    opportunityNumber: "SECRET-MOCK-OPP-00X",
    opportunityStatus: "forecasted",
    postedDate: "2024-04-01",
    categories: ["mock", "secret", "physics", "research"],
  },
];

function fetchMockGrantById(id: string): Grant | undefined {
  return detailedMockGrants.find((grant) => grant.id === id);
}

interface GrantDetailPageProps {
  params: { id: string };
}

// Metadata generation function
export async function generateMetadata(
  { params }: GrantDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const grant = fetchMockGrantById(params.id);

  if (!grant) {
    return {
      title: "Grant Not Found",
      description: "The grant you are looking for could not be found.",
    };
  }

  const descriptionSnippet = grant.description
    ? grant.description.substring(0, 160) + "..."
    : "No description available.";
  const keywords = grant.categories
    ? [...grant.categories, grant.agency, "government grant", params.id]
    : [grant.agency, "government grant", params.id];

  const ogUrl = `/grants/${grant.id}`;

  return {
    title: grant.title,
    description: descriptionSnippet,
    keywords: keywords,
    openGraph: {
      title: grant.title,
      description: descriptionSnippet,
      type: "article",
      url: ogUrl,
      images: [
        {
          url: "/og-image-grant-detail.jpg",
          width: 1200,
          height: 630,
          alt: `Details for ${grant.title}`,
        },
      ],
      siteName: (await parent).openGraph?.siteName || "Grant Finder",
    },
    twitter: {
      card: "summary_large_image",
      title: grant.title,
      description: descriptionSnippet,
      images: ["/og-image-grant-detail.jpg"],
    },
  };
}

// Export the mock data and helper function for use in the client component
export { detailedMockGrants, fetchMockGrantById };
