"use client";

import React, { useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import FilterControls from "@/app/components/FilterControls";
import GrantList from "@/app/components/GrantList";
import Pagination from "@/app/components/Pagination";
import type { Grant } from "@/types";

// Metadata is now handled in a separate file since this is a Client Component

const mockGrantsData: Grant[] = [
  {
    id: "srch-mock1",
    title: "Search Result Grant Alpha",
    agency: "Search Results Agency (SRA)",
    description:
      "This is a mock grant specifically for the search results page, demonstrating initial data rendering. Alpha grant focuses on renewable energy research.",
    eligibilityCriteria: "Universities and research institutions.",
    deadline: "2024-10-31",
    amount: 150000,
    linkToApply: "#apply-srch-mock1",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00A",
    opportunityStatus: "posted",
    postedDate: "2024-03-01",
    categories: ["mock", "search", "energy"],
  },
  {
    id: "srch-mock2",
    title: "Search Result Grant Beta",
    agency: "Search Results Agency (SRA)",
    description:
      "Beta grant is designed to support community development projects in urban areas. This grant appears on the search results page to show multiple items.",
    eligibilityCriteria:
      "Non-profit community organizations with at least 3 years of operation.",
    deadline: "2024-11-15",
    amount: 90000,
    linkToApply: "#apply-srch-mock2",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00B",
    opportunityStatus: "posted",
    postedDate: "2024-03-05",
    categories: ["mock", "search", "community", "urban"],
  },
];

const itemsPerPage = 10; // Number of grants to display per page

export default function GrantsPage() {
  const [searchResults, setSearchResults] = useState<Grant[]>([]); // Initialize with empty array
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Calculate total pages based on mock data for this example
  const [totalPages, setTotalPages] = useState<number>(
    Math.ceil(mockGrantsData.length / itemsPerPage)
  );

  const handleSearch = (searchTerm: string) => {
    console.log("Search results page - Search term:", searchTerm);
    // Placeholder: In a real app, fetch new data based on searchTerm
    // For now, you might filter mockGrantsData or just log
    // const filtered = mockGrantsData.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
    // setSearchResults(filtered);
    // setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    // setCurrentPage(1);
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
  const handleApplyFilters = (filters: any) => { // TODO: Use GrantFilters type from FilterControls
    console.log("Applying filters:", filters);
    // Example: Fetch new data based on filters and searchTerm
    // For now, mock data is static so this won't visually change the list.
  };

  return (
    // Main container: Replaced inline styles with Tailwind classes
    <main className="container mx-auto px-4 py-8">
      {/* Header section: Styled using Tailwind typography */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-4">Grant Search Results</h1>
      </header>

      {/* SearchBar: Already refactored */}
      <SearchBar onSearch={handleSearch} />

      {/* FilterControls: Now refactored, pass the onApplyFilters prop */}
      {/* Consider wrapping SearchBar and FilterControls in a Card or a div for better grouping if desired */}
      <FilterControls onApplyFilters={handleApplyFilters} />

      {/* Results Section: Styled with Tailwind */}
      <section className="mt-8">
        {/* TODO: Add loading/error states here if data fetching is implemented */}
        {/* For example:
        {isLoading ? <p className="text-center text-muted-foreground">Loading grants...</p> :
         error ? <p className="text-center text-destructive">{error}</p> : */}
        <GrantList grants={paginatedGrants} />
        {/* } */}
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
