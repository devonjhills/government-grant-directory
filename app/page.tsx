"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation for App Router
import SearchBar from "@/app/components/SearchBar"; // Using alias from tsconfig.json
import GrantList from "@/app/components/GrantList"; // Using alias from tsconfig.json
import type { Grant } from "@/types"; // Using alias from tsconfig.json
import { searchGrants } from "@/app/services/grantsGovService"; // Import the searchGrants function

// Metadata is now handled in a separate file since this is a Client Component

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

export default function HomePage() {
  const router = useRouter();
  const [featuredGrants, setFeaturedGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch a few grants, e.g., 5, with a general keyword or recent status
        const response = await searchGrants({
          keyword: "business",
          rows: 5,
          oppStatuses: "posted",
        });
        setFeaturedGrants(response.grants);
      } catch (err) {
        console.error("Failed to fetch featured grants:", err);
        setError("Could not load featured grants. Using mock data instead.");
        // Use mock data as fallback
        setFeaturedGrants(mockGrantsData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []); // Empty dependency array to run once on mount

  const handleSearch = (searchTerm: string) => {
    router.push(`/grants?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "20px" }}>
      <header style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1>Welcome to the Government Grant Finder</h1>
        <p style={{ fontSize: "1.1em", color: "#555" }}>
          Your one-stop portal to discover and apply for government grants. Use
          the search below to find opportunities relevant to your needs.
        </p>
      </header>

      <SearchBar onSearch={handleSearch} />

      <section style={{ marginTop: "30px" }}>
        <h2>Featured Grants</h2>
        {isLoading ? (
          <p>Loading featured grants...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : featuredGrants.length > 0 ? (
          <GrantList grants={featuredGrants} />
        ) : (
          <GrantList grants={mockGrantsData} />
        )}
      </section>
    </main>
  );
}
