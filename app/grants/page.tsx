"use client"; // Add "use client" directive

import React, { useState, useEffect } from 'react'; // Import useEffect
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import SearchBar from '@/app/components/SearchBar';
import FilterControls from '@/app/components/FilterControls';
import GrantList from '@/app/components/GrantList';
import Pagination from '@/app/components/Pagination';
import type { Grant } from '@/types';
import { searchGrants } from '@/app/services/grantsGovService'; // Import searchGrants

// Note: Page-level static metadata (export const metadata = ...) is removed
// as it's not standard for "use client" components to export this directly.
// If dynamic title/meta tags are needed, they can be set via useEffect or a HOC.

const itemsPerPage = 10; // Number of grants to display per page

export default function GrantsPage() {
  const [searchResults, setSearchResults] = useState<Grant[]>([]); // Initialize with empty array
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1); // Initialize with 1 page
  const searchParams = useSearchParams(); // Get search parameters
  const initialSearchTerm = searchParams.get('q') || ""; // Get 'q' from URL or default
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true for initial fetch
  const [error, setError] = useState<string | null>(null); // State for error messages

  const fetchData = async (term: string, page: number) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await searchGrants({ 
        keyword: term || undefined, // Pass undefined if term is empty, depending on API behavior
        rows: itemsPerPage, 
        startRecordNum: (page - 1) * itemsPerPage,
        oppStatuses: "posted|forecasted" // Example: Fetch posted and forecasted grants
      });
      setSearchResults(response.grants);
      setTotalPages(Math.ceil(response.totalRecords / itemsPerPage) || 1); // Ensure totalPages is at least 1
    } catch (err) {
      console.error("Error fetching grants:", err);
      setSearchResults([]); // Clear results on error
      setTotalPages(1);     // Reset pages on error
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching grants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // When initialSearchTerm from URL changes (e.g., on navigation with new ?q=), update searchTerm state
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    // This effect now correctly uses the searchTerm from state,
    // which is initialized/updated from the URL query parameter.
    // Use a default keyword like "funding" if searchTerm is empty after initialization.
    fetchData(searchTerm || "funding", currentPage);
  }, [searchTerm, currentPage]); // Keep dependencies as searchTerm and currentPage

  const handleSearch = (newSearchTerm: string) => {
    // This function is for searches initiated from the search bar *on* this page
    setSearchTerm(newSearchTerm); 
    setCurrentPage(1); // Reset to first page on new search
    // Note: We don't need to push to router here as the URL is already /grants
    // and the change in searchTerm state will trigger useEffect to re-fetch.
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // useEffect will trigger fetchData
  };

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Grant Search Results</h1>
      </header>
      
      <SearchBar onSearch={handleSearch} />
      <FilterControls /> {/* Placeholder */}
      
      <section style={{ marginTop: '30px' }}>
        {isLoading ? (
          <p>Loading grants...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : searchResults.length === 0 ? (
          <p>No grants found matching your criteria.</p>
        ) : (
          <GrantList grants={searchResults} /> // GrantList now receives searchResults directly
        )}
      </section>
      
      {/* Only show pagination if not loading, no error, and there are results */}
      {!isLoading && !error && searchResults.length > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </main>
  );
}
