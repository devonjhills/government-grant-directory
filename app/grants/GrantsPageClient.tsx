"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import FilterControls from "@/app/components/FilterControls";
import GrantList from "@/app/components/GrantList";
import Pagination from "@/app/components/Pagination";
import type { Grant } from "@/types";

const ITEMS_PER_PAGE = 10; // Number of grants to display per page, can be prop or global config

interface GrantsPageClientProps {
  initialGrants: Grant[];
  initialTotalPages: number;
  initialCurrentPage: number;
  initialSearchTerm?: string;
  initialFilters?: any; // Define more strictly if possible
  error?: string | null;
}

export default function GrantsPageClient({
  initialGrants,
  initialTotalPages,
  initialCurrentPage,
  initialSearchTerm,
  initialFilters,
  error: initialError,
}: GrantsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchResults, setSearchResults] = useState<Grant[]>(initialGrants);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(
    initialSearchTerm || "",
  );
  const [currentFilters, setCurrentFilters] = useState<any>(
    initialFilters || {},
  ); // Define more strictly
  const [isLoading, setIsLoading] = useState<boolean>(false); // False initially, data comes from server
  const [error, setError] = useState<string | null>(initialError || null);

  // Helper function to update URL with search params
  const updateUrlParams = (
    params: Record<string, string | number | undefined>,
  ) => {
    setIsLoading(true); // Show loading state during navigation

    const url = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== 0) {
        url.set(key, String(value));
      } else {
        url.delete(key);
      }
    });

    // Remove page param if it's 1 (default)
    if (url.get("page") === "1") {
      url.delete("page");
    }

    const newUrl = `/grants${url.toString() ? `?${url.toString()}` : ""}`;
    router.push(newUrl);
  };

  // Sync client state with server props when URL changes
  useEffect(() => {
    setSearchResults(initialGrants);
    setCurrentPage(initialCurrentPage);
    setTotalPages(initialTotalPages);
    setCurrentSearchTerm(initialSearchTerm || "");
    setCurrentFilters(initialFilters || {});
    setError(initialError || null);
    setIsLoading(false);
  }, [
    initialGrants,
    initialCurrentPage,
    initialTotalPages,
    initialSearchTerm,
    initialFilters,
    initialError,
  ]);

  // handleSearch will update URL params, triggering page reload with new search
  const handleSearch = (searchTerm: string) => {
    updateUrlParams({
      q: searchTerm,
      page: undefined, // Reset to page 1
      // Reset other filter params if needed
    });
  };

  // handleApplyFilters will update URL params with filter values
  const handleApplyFilters = (filters: any) => {
    updateUrlParams({
      q: currentSearchTerm,
      page: undefined, // Reset to page 1
      ...filters, // Spread filter params into URL
    });
  };

  // handlePageChange will update URL params with new page number
  const handlePageChange = (pageNumber: number) => {
    updateUrlParams({
      q: currentSearchTerm,
      page: pageNumber > 1 ? pageNumber : undefined, // Only include page if > 1
      ...currentFilters, // Maintain current filters
    });
  };

  // The grants displayed are now directly from searchResults, not a separate 'paginatedGrants'
  // as the API calls for handleSearch, handleApplyFilters, and handlePageChange
  // should fetch the correct slice of data.

  return (
    <main className="">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Grant Search Results
        </h1>
      </header>

      <SearchBar onSearch={handleSearch} initialValue={initialSearchTerm} />
      <FilterControls onApplyFilters={handleApplyFilters} />

      <section className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-muted-foreground">Loading grants...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive font-medium text-lg mb-4">{error}</p>
            <p className="text-muted-foreground">
              Try refreshing the page or searching with different terms.
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <GrantList grants={searchResults} />
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              {currentSearchTerm
                ? `No grants found for "${currentSearchTerm}"`
                : "No grants available"}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentSearchTerm
                ? "Try searching with different keywords or browse all grants."
                : "Please try refreshing the page."}
            </p>
          </div>
        )}
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
