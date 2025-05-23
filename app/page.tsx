import type { Metadata } from 'next';
import HomePageClient from "./HomePageClient";
import { searchGrants } from "@/app/services/grantsGovService"; // Corrected alias path
import type { Grant } from "@/types"; // Using alias

export const metadata: Metadata = {
  title: 'Find Government Grants | Grant Finder',
  description: 'Your central hub for discovering government grants. Search and find funding opportunities for your projects.',
  // OpenGraph and Twitter cards will be inherited from app/layout.tsx or can be overridden here.
};

// Mock data for grants - kept here for fallback as per instructions
const mockGrantsData: Grant[] = [
  {
    id: "mock1",
    title: "Mock Grant Title 1 for Small Businesses",
    agency: "Mock Agency of Funding (MAF)",
    description:
      "This is a detailed mock description for the first grant. It's designed to help small businesses innovate and grow within the mock state. The funds can be used for research, development, and operational improvements.",
    eligibilityCriteria:
      "Eligible for registered small businesses in the mock state with fewer than 50 employees.",
    deadline: "2024-12-31",
    amount: 50000,
    linkToApply: "#apply-mock1",
    sourceAPI: "MockSourceDB",
    opportunityNumber: "MOCK-OPP-001",
    opportunityStatus: "posted",
    postedDate: "2024-01-01",
    categories: ["mock", "business", "innovation"],
  },
  {
    id: "mock2",
    title: "Mock Grant for Educational Non-Profits",
    agency: "Another Mock Agency (AMA)",
    description:
      "The second mock grant description is aimed at showcasing the list component with multiple entries. This grant supports non-profit organizations focusing on enhancing mock educational programs for underserved communities.",
    eligibilityCriteria:
      "Non-profit organizations with a focus on mock education. Must have 501(c)(3) status.",
    deadline: "2025-01-15",
    amount: 75000,
    linkToApply: "#apply-mock2",
    sourceAPI: "MockSourceDB",
    opportunityNumber: "MOCK-OPP-002",
    opportunityStatus: "forecasted",
    postedDate: "2024-02-01",
    categories: ["mock", "education", "non-profit"],
  },
  {
    id: "mock3",
    title: "Community Health Initiative Grant",
    agency: "Community Wellness Foundation (CWF)",
    description:
      "This grant aims to fund projects that improve community health outcomes, focusing on preventative care and health education. Pilot programs and innovative approaches are encouraged.",
    eligibilityCriteria:
      "Local government entities, non-profits, and community groups.",
    deadline: "2024-11-30",
    amount: 120000,
    linkToApply: "#apply-mock3",
    sourceAPI: "MockSourceDB",
    opportunityNumber: "MOCK-OPP-003",
    opportunityStatus: "posted",
    postedDate: "2024-03-15",
    categories: ["mock", "health", "community"],
  },
];

export default async function HomePage() {
  let featuredGrantsData: Grant[] = [];
  let pageError: string | null = null;

  try {
    const response = await searchGrants({
      keyword: "business", // Example search query
      rows: 5,
      oppStatuses: "posted",
    });
    featuredGrantsData = response.grants;

    if (featuredGrantsData.length === 0) {
      // This case might not be an "error" but rather an empty result.
      // Depending on desired UX, could set a specific message or let GrantList handle "No grants found".
      // For now, as per instructions, setting an informational message.
      pageError = "No featured grants found from API. Displaying mock data as fallback.";
      featuredGrantsData = mockGrantsData; // Fallback to mock data if API returns empty
    }
  } catch (err) {
    console.error("Failed to fetch featured grants for server page:", err);
    pageError = "Could not load featured grants. Displaying mock data instead.";
    featuredGrantsData = mockGrantsData; // Use mock data as fallback
  }

  return (
    <HomePageClient 
      initialFeaturedGrants={featuredGrantsData} 
      initialError={pageError} 
    />
  );
}
