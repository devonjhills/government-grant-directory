"use client";

import React from "react"; // Removed useState as it's not used in the current version
import SearchBar from "@/app/components/SearchBar"; // Using alias from tsconfig.json
import GrantList from "@/app/components/GrantList"; // Using alias from tsconfig.json
import type { Grant } from "@/types"; // Using alias from tsconfig.json

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
  // For now, the mock grants are directly used.
  // Later, this could be state managed by useState if grants are fetched/filtered dynamically.
  // const [grants, setGrants] = useState<Grant[]>(mockGrantsData);

  const handleSearch = (searchTerm: string) => {
    console.log("Search term:", searchTerm);
    // In a real application, this would trigger a search/filter operation
    // and potentially update the 'grants' state.
    // For now, with mock data, it will just log.
    // Example: if filtering mockGrantsData:
    // const filteredGrants = mockGrantsData.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
    // setGrants(filteredGrants);
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
        <h2>Available Grants</h2>
        <GrantList grants={mockGrantsData} />
      </section>
    </main>
  );
}
