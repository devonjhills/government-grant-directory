import { searchGrants } from "./services/grantsGovService";
import HomePageClient from "./HomePageClient";
import type { Grant } from "../types/index";

export default async function HomePage() {
  let featuredGrantsData: Grant[] = [];
  let pageError: string | null = null;

  try {
    const response = await searchGrants({
      keyword: "business", // Example search query
      rows: 5,
      oppStatuses: "posted",
    });
    featuredGrantsData = Array.isArray(response.grants) ? response.grants : [];

    if (featuredGrantsData.length === 0) {
      // This case might not be an "error" but rather an empty result.
      // Depending on desired UX, could set a specific message or let GrantList handle "No grants found".
      // For now, as per instructions, setting an informational message.
      pageError = "No featured grants found from API.";
    }
  } catch (err) {
    console.error("Failed to fetch featured grants for server page:", err);
    pageError = "Could not load featured grants.";
  }

  return (
    <HomePageClient
      initialFeaturedGrants={featuredGrantsData}
      initialError={pageError}
    />
  );
}
