"use client";

import React from "react";
import type { Grant } from "@/types";
import Link from "next/link"; // For "Back to Search" link

interface GrantDetailPageProps {
  params: { id: string };
}

// Mock data and fetch function (assuming it's here or imported)
const detailedMockGrants: Grant[] = [
  {
    id: "srch-mock1", // Should match an ID from a list item
    title: "Search Result Grant Alpha - Detailed View",
    agency: "Search Results Agency (SRA) - Department of Mock Initiatives",
    description:
      "This is the full, detailed description for Search Result Grant Alpha. It elaborates on the project's goals to foster innovation in renewable energy through comprehensive research grants. We are looking for proposals that outline clear methodologies, potential impacts, and a strong team. Successful applicants will contribute to a greener future.",
    eligibilityCriteria:
      "Eligible applicants include accredited universities, non-profit research institutions, and private sector companies with a proven track record in renewable energy research. Joint proposals are welcome. Applicants must be based in the mock country.",
    deadline: "2024-10-31",
    amount: 150000,
    linkToApply: "https://www.example.com/apply/srch-mock1",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00A-DETAILED",
    opportunityStatus: "posted",
    postedDate: "2024-03-01",
    categories: ["mock", "search", "energy", "research", "sustainability"],
  },
  {
    id: "srch-mock2", // Should match an ID from a list item
    title: "Search Result Grant Beta - In-Depth Information",
    agency: "Search Results Agency (SRA) - Urban Development Office",
    description:
      "Grant Beta provides funding for community-led projects aimed at revitalizing urban areas. This detailed description outlines the types of projects we fund, including public space improvements, community center development, and local economic initiatives. We prioritize projects with strong community engagement and measurable outcomes.",
    eligibilityCriteria:
      "Eligible entities are non-profit community organizations with at least 3 years of operation, local government bodies, and community development corporations. Must serve designated urban renewal zones.",
    deadline: "2024-11-15",
    amount: 90000,
    linkToApply: "https://www.example.com/apply/srch-mock2",
    sourceAPI: "MockSearchResultsDB",
    opportunityNumber: "SRCH-MOCK-OPP-00B-DETAILED",
    opportunityStatus: "posted",
    postedDate: "2024-03-05",
    categories: [
      "mock",
      "search",
      "community",
      "urban",
      "development",
      "non-profit",
    ],
  },
  {
    id: "mock-detail-only",
    title: "Special Grant - Not in General Search",
    agency: "Secret Mock Agency (SMA)",
    description:
      "This is a special grant available only via direct link for testing purposes. It focuses on advanced theoretical mock physics.",
    eligibilityCriteria:
      "Post-doctoral researchers with a PhD in mock physics.",
    deadline: "2025-03-01",
    amount: 250000,
    linkToApply: "https://www.example.com/apply/mock-detail-only",
    sourceAPI: "MockSecretDB",
    opportunityNumber: "SECRET-MOCK-OPP-00X",
    opportunityStatus: "forecasted",
    postedDate: "2024-04-01",
    categories: ["mock", "secret", "physics", "research"],
  },
];

// This function can be used by both generateMetadata and the page component
function fetchMockGrantById(id: string): Grant | undefined {
  return detailedMockGrants.find((grant) => grant.id === id);
}

// Metadata is now handled in a separate file since this is a Client Component

const GrantDetailPage = ({ params }: GrantDetailPageProps) => {
  const grant = fetchMockGrantById(params.id);

  if (!grant) {
    return (
      <main
        style={{
          maxWidth: "800px",
          margin: "20px auto",
          padding: "20px",
          textAlign: "center",
        }}>
        <p>Grant not found.</p>
        <Link href="/grants">Back to Search Results</Link>
      </main>
    );
  }

  // Simple currency formatting
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Assuming USD, adjust if grant data includes currency
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // Show whole dollars for simplicity
  }).format(grant.amount);

  // Construct JSON-LD data
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "GovernmentGrant", // Or "WebPage" if GovernmentGrant is too specific/not fitting
    name: grant.title,
    description: grant.description,
    url: `https://www.grantfinder.example.com/grants/${grant.id}`, // Placeholder domain
    provider: {
      "@type": "GovernmentOrganization", // Or "Organization"
      name: grant.agency,
    },
    datePosted: grant.postedDate,
    applicationDeadline: grant.deadline,
    grantAmount: {
      "@type": "MonetaryAmount",
      value: grant.amount,
      currency: "USD", // Assuming USD
    },
    eligibility: grant.eligibilityCriteria,
    keywords: grant.categories.join(", "),
  };

  return (
    <React.Fragment>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <main
        style={{
          maxWidth: "800px",
          margin: "20px auto",
          padding: "20px",
          border: "1px solid #eee",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
        <header
          style={{
            marginBottom: "30px",
            borderBottom: "1px solid #eee",
            paddingBottom: "20px",
          }}>
          <h1 style={{ fontSize: "2.5em", marginBottom: "0.5em" }}>
            {grant.title}
          </h1>
          <p style={{ fontSize: "1.1em", color: "#555" }}>
            <strong>Agency:</strong> {grant.agency}
          </p>
          <p style={{ fontSize: "1em", color: "#555" }}>
            <strong>Opportunity Number:</strong> {grant.opportunityNumber}
          </p>
          <p style={{ fontSize: "1em", color: "#555" }}>
            <strong>Status:</strong> {grant.opportunityStatus}
          </p>
        </header>

        <section style={{ marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "1.8em",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}>
            Grant Overview
          </h2>
          <p style={{ lineHeight: "1.7" }}>{grant.description}</p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "1.8em",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}>
            Eligibility
          </h2>
          <p style={{ lineHeight: "1.7" }}>{grant.eligibilityCriteria}</p>
        </section>

        <section
          style={{
            marginBottom: "30px",
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
          }}>
          <h2
            style={{
              fontSize: "1.8em",
              marginTop: 0,
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}>
            Key Information
          </h2>
          <p>
            <strong>Deadline:</strong> {grant.deadline}
          </p>
          <p>
            <strong>Posted Date:</strong> {grant.postedDate}
          </p>
          <p>
            <strong>Funding Amount:</strong> {formattedAmount}
          </p>
          <p>
            <strong>Categories:</strong> {grant.categories.join(", ")}
          </p>
          <p>
            <strong>Data Source:</strong> {grant.sourceAPI}
          </p>
        </section>

        <section
          style={{
            textAlign: "center",
            marginTop: "40px",
            marginBottom: "20px",
          }}>
          <a
            href={grant.linkToApply}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 25px",
              backgroundColor: "#0070f3",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "1.2em",
              fontWeight: "bold",
            }}>
            Apply Here
          </a>
        </section>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <Link href="/grants">&larr; Back to Search Results</Link>
        </div>
      </main>
    </React.Fragment>
  );
};

export default GrantDetailPage;
