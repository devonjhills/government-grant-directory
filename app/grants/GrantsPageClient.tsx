"use client";

import React, { useState } from "react";
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
  const [searchResults, setSearchResults] = useState<Grant[]>(initialGrants);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>(
    initialSearchTerm || ""
  );
  const [currentFilters, setCurrentFilters] = useState<any>(
    initialFilters || {}
  ); // Define more strictly
  const [isLoading, setIsLoading] = useState<boolean>(false); // False initially, data comes from server
  const [error, setError] = useState<string | null>(initialError || null);

  // handleSearch will be used for subsequent client-side searches
  const handleSearch = async (searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
    setCurrentFilters({}); // Reset filters on new search term
    setCurrentPage(1); // Reset to first page
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grants/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: searchTerm,
          rows: ITEMS_PER_PAGE,
          startRecordNum: 0,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch grants");
      const data = await response.json();
      setSearchResults(data.grants || []);
      setTotalPages(Math.ceil((data.totalRecords || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError("Failed to fetch grants. Please try again later.");
      setSearchResults([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // handleApplyFilters will be used for subsequent client-side filter applications
  const handleApplyFilters = async (filters: any) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Reset to first page
    setIsLoading(true);
    setError(null);
    try {
      // Combine searchTerm with filters for the API call
      const payload = {
        ...filters,
        keyword: currentSearchTerm,
        rows: ITEMS_PER_PAGE,
        startRecordNum: 0,
      };
      const response = await fetch("/api/grants/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to fetch grants");
      const data = await response.json();
      setSearchResults(data.grants || []);
      setTotalPages(Math.ceil((data.totalRecords || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError("Failed to apply filters. Please try again later.");
      setSearchResults([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // handlePageChange will fetch data for the new page
  const handlePageChange = async (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...currentFilters,
        keyword: currentSearchTerm,
        rows: ITEMS_PER_PAGE,
        startRecordNum: (pageNumber - 1) * ITEMS_PER_PAGE,
      };
      const response = await fetch("/api/grants/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok)
        throw new Error("Failed to fetch grants for page " + pageNumber);
      const data = await response.json();
      setSearchResults(data.grants || []);
      // totalPages should ideally remain the same, but API might recalculate
      setTotalPages(Math.ceil((data.totalRecords || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(`Failed to load page ${pageNumber}. Please try again.`);
      setSearchResults([]); // Clear results on page load error
    } finally {
      setIsLoading(false);
    }
  };

  // The grants displayed are now directly from searchResults, not a separate 'paginatedGrants'
  // as the API calls for handleSearch, handleApplyFilters, and handlePageChange
  // should fetch the correct slice of data.

  return (
    <main className="">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Grant Search Results
        </h1>
      </header>

      <SearchBar onSearch={handleSearch} />
      <FilterControls onApplyFilters={handleApplyFilters} />

      <section className="mt-8">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading grants...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : (
          <GrantList grants={searchResults} /> // Use searchResults directly
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
