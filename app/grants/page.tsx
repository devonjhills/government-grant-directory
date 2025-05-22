"use client";

import React, { useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import FilterControls from "@/app/components/FilterControls";
import GrantList from "@/app/components/GrantList";
import Pagination from "@/app/components/Pagination";
import type { Grant } from "@/types";

// Metadata is now handled in a separate file since this is a Client Component

// Remove mock data

const itemsPerPage = 10; // Number of grants to display per page

export default function GrantsPage() {
  const [searchResults, setSearchResults] = useState<Grant[]>([]); // Initialize with empty array
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grants/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: searchTerm }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch grants");
      }

      const data = await response.json();
      setSearchResults(data.grants);
      setTotalPages(Math.ceil(data.totalRecords / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch grants. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // useEffect will trigger fetchData
  };

  // Simple pagination logic for display
  const paginatedGrants = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Placeholder for applying filters - in a real app, this would trigger API calls
  const handleApplyFilters = async (filters: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grants/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch grants");
      }

      const data = await response.json();
      setSearchResults(data.grants);
      setTotalPages(Math.ceil(data.totalRecords / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch grants. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container: Replaced inline styles with Tailwind classes
    <main className="container mx-auto px-4 py-8">
      {/* Header section: Styled using Tailwind typography */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Grant Search Results
        </h1>
      </header>

      {/* SearchBar: Already refactored */}
      <SearchBar onSearch={handleSearch} />

      {/* FilterControls: Now refactored, pass the onApplyFilters prop */}
      {/* Consider wrapping SearchBar and FilterControls in a Card or a div for better grouping if desired */}
      <FilterControls onApplyFilters={handleApplyFilters} />

      {/* Results Section: Styled with Tailwind */}
      <section className="mt-8">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading grants...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : (
          <GrantList grants={paginatedGrants} />
        )}
      </section>

      {/* Pagination: Already refactored */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
