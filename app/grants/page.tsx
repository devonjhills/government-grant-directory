import React, { useState } from 'react';
import type { Metadata } from 'next'; // Import Metadata type
import SearchBar from '@/app/components/SearchBar';
import FilterControls from '@/app/components/FilterControls';
import GrantList from '@/app/components/GrantList';
import Pagination from '@/app/components/Pagination';
import type { Grant } from '@/types';

export const metadata: Metadata = {
  title: 'Grant Search Results', // Will use template: "Grant Search Results | Grant Finder"
  description: 'Explore grant search results based on your criteria. Filter and find the best funding opportunities for your needs.',
  openGraph: {
    title: 'Grant Search Results | Grant Finder', // Explicit full title for OG
    description: 'Explore grant search results based on your criteria. Filter and find the best funding opportunities.',
    type: 'website',
    url: '/grants' // In a real app, this should be an absolute URL
  }
};

const mockGrantsData: Grant[] = [
  {
    id: "srch-mock1",
    title: "Search Result Grant Alpha",
    agency: "Search Results Agency (SRA)",
    description: "This is a mock grant specifically for the search results page, demonstrating initial data rendering. Alpha grant focuses on renewable energy research.",
    eligibilityCriteria: "Universities and research institutions.",
    deadline: "2024-10-31",
    amount: 150000,
    linkToApply: "#apply-srch-mock1",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00A",
    opportunityStatus: "posted",
    postedDate: "2024-03-01",
    categories: ["mock", "search", "energy"]
  },
  {
    id: "srch-mock2",
    title: "Search Result Grant Beta",
    agency: "Search Results Agency (SRA)",
    description: "Beta grant is designed to support community development projects in urban areas. This grant appears on the search results page to show multiple items.",
    eligibilityCriteria: "Non-profit community organizations with at least 3 years of operation.",
    deadline: "2024-11-15",
    amount: 90000,
    linkToApply: "#apply-srch-mock2",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00B",
    opportunityStatus: "posted",
    postedDate: "2024-03-05",
    categories: ["mock", "search", "community", "urban"]
  }
];

const itemsPerPage = 10; // Example, can be adjusted

export default function GrantsPage() {
  const [searchResults, setSearchResults] = useState<Grant[]>(mockGrantsData);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Calculate total pages based on mock data for this example
  const [totalPages, setTotalPages] = useState<number>(Math.ceil(mockGrantsData.length / itemsPerPage));

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
    console.log("Page changed to:", pageNumber);
    // In a real app, you might fetch data for the new page
  };
  
  // Simple pagination logic for display
  const paginatedGrants = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Grant Search Results</h1>
      </header>
      
      <SearchBar onSearch={handleSearch} />
      <FilterControls /> {/* Placeholder, no props needed yet */}
      
      <section style={{ marginTop: '30px' }}>
        <GrantList grants={paginatedGrants} />
      </section>
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </main>
  );
}
