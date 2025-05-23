import GrantsPageClient from "./GrantsPageClient";
import { searchGrants } from "@/app/services/grantsGovService"; // Using alias
import type { Grant } from "@/types"; // Using alias

const ITEMS_PER_PAGE = 10;

export default async function GrantsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const searchTerm = searchParams?.q?.toString() || "";
  const currentPage = parseInt(searchParams?.page?.toString() || "1", 10);
  
  // Extract other filter params - example for oppStatuses
  // In a real app, you'd extract all relevant filter keys you expect
  const oppStatuses = searchParams?.oppStatuses?.toString() || undefined; 
  // Add other filter extractions here, e.g., agency, eligibility, etc.
  // For simplicity, we'll make a basic filter object for now
  const otherFilterParams: any = {};
  if (oppStatuses) {
    otherFilterParams.oppStatuses = oppStatuses;
  }
  // ... add more filters to otherFilterParams as they are defined and extracted

  const searchPayload: any = {
    keyword: searchTerm,
    rows: ITEMS_PER_PAGE,
    startRecordNum: (currentPage - 1) * ITEMS_PER_PAGE,
    ...otherFilterParams, // Spread the extracted filter parameters
  };

  let grants: Grant[] = [];
  let totalPages = 1;
  let pageError: string | null = null;

  // Only fetch if there's a search term or active filters
  // Modify this condition if you want to load initial grants even without search/filters
  const hasSearchParams = searchTerm || Object.keys(otherFilterParams).length > 0;

  if (hasSearchParams) {
    try {
      const response = await searchGrants(searchPayload);
      grants = response.grants || []; // Ensure grants is always an array
      totalPages = Math.ceil((response.totalRecords || 0) / ITEMS_PER_PAGE);
      if (totalPages === 0 && grants.length === 0 && searchTerm) { // No results for a specific search
        pageError = `No grants found for "${searchTerm}". Try a different search.`;
      }
    } catch (err) {
      console.error("Failed to fetch grants for server page:", err);
      pageError = "Could not load grants due to a server error. Please try again later.";
      grants = []; // Ensure grants is empty on error
      totalPages = 1; // Reset total pages on error
    }
  } else {
    // Optional: Could set a message like "Please enter a search term or apply filters to see grants."
    // For now, it will just render with empty grants if no search params.
  }


  return (
    <GrantsPageClient
      initialGrants={grants}
      initialTotalPages={totalPages}
      initialCurrentPage={currentPage}
      initialSearchTerm={searchTerm}
      initialFilters={otherFilterParams} // Pass the extracted filters
      error={pageError}
    />
  );
}
