import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import GrantsPageClient from "./GrantsPageClient";
import { searchGrants } from "@/app/services/grantsGovService"; // Using alias
import type { Grant } from "@/types"; // Using alias

const ITEMS_PER_PAGE = 10;

export async function generateMetadata(
  { searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const searchTerm = searchParams?.q?.toString() || '';
  const currentPage = parseInt(searchParams?.page?.toString() || "1", 10);
  const parentMetadata = await parent;

  let pageTitle = 'Browse Government Grants';
  let description = 'Browse all available government grants and funding opportunities from federal, state, and local sources.';
  
  if (searchTerm) {
    pageTitle = `"${searchTerm}" Grant Search Results`;
    description = `Find government grants and funding opportunities related to ${searchTerm}. Search results from federal agencies including NIH, NSF, and more.`;
    
    if (currentPage > 1) {
      pageTitle += ` - Page ${currentPage}`;
      description += ` Page ${currentPage} of search results.`;
    }
  } else if (currentPage > 1) {
    pageTitle += ` - Page ${currentPage}`;
    description += ` Page ${currentPage} of all available grants.`;
  }

  // Build URL with current search params
  const urlParams = new URLSearchParams();
  if (searchTerm) urlParams.set('q', searchTerm);
  if (currentPage > 1) urlParams.set('page', currentPage.toString());
  const canonical = `/grants${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      ...parentMetadata.openGraph,
      title: `${pageTitle} | Grant Finder`,
      url: canonical,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | Grant Finder`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

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

  // Fetch grants if there's a search term, filters, or show default grants
  const hasSearchParams = searchTerm || Object.keys(otherFilterParams).length > 0;

  try {
    if (hasSearchParams) {
      // Use the provided search/filter params
      const response = await searchGrants(searchPayload);
      grants = response.grants || [];
      totalPages = Math.ceil((response.totalRecords || 0) / ITEMS_PER_PAGE);
      if (totalPages === 0 && grants.length === 0 && searchTerm) {
        pageError = `No grants found for "${searchTerm}". Try a different search.`;
      }
    } else {
      // Show default grants when no search params (e.g., recent or featured grants)
      const response = await searchGrants({
        rows: ITEMS_PER_PAGE,
        oppStatuses: "posted|forecasted",
        startRecordNum: 0,
      });
      grants = response.grants || [];
      totalPages = Math.ceil((response.totalRecords || 0) / ITEMS_PER_PAGE);
    }
  } catch (err) {
    console.error("Failed to fetch grants for server page:", err);
    pageError = "Could not load grants due to a server error. Please try again later.";
    grants = [];
    totalPages = 1;
  }


  return (
    <Suspense fallback={<div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>}>
      <GrantsPageClient
        initialGrants={grants}
        initialTotalPages={totalPages}
        initialCurrentPage={currentPage}
        initialSearchTerm={searchTerm}
        initialFilters={otherFilterParams} // Pass the extracted filters
        error={pageError}
      />
    </Suspense>
  );
}
