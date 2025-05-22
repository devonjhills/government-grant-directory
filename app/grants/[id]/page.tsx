import type { Metadata, ResolvingMetadata } from 'next'; // Import Metadata types
import type { Grant } from "@/types";
// Note: `getGrantDetails` is imported below for the client component, 
// but for generateMetadata, we might need a separate server-side fetcher or use the mock.
// For this task, `fetchMockGrantById` will be used in `generateMetadata` as it's already defined.

// Moved and enhanced generateMetadata function:
interface GrantDetailPageProps {
  params: { id: string };
}

// This function needs to be defined BEFORE the default export of the page component.
// Also, this `fetchMockGrantById` needs to be accessible here or redefined.
// For simplicity, let's assume detailedMockGrants is accessible here or passed.
// The `detailedMockGrants` array is already defined below in the file.
// The `fetchMockGrantById` function is also already defined below in the file.

export async function generateMetadata(
  { params }: GrantDetailPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const grant = fetchMockGrantById(params.id); // Uses the mock fetcher defined in this file

  if (!grant) {
    return {
      title: "Grant Not Found",
      description: "The grant you are looking for could not be found.",
    };
  }

  const descriptionSnippet = grant.description ? grant.description.substring(0, 160) + '...' : 'No description available.';
  const keywords = grant.categories ? [...grant.categories, grant.agency, 'government grant', params.id] : [grant.agency, 'government grant', params.id];

  // Assuming metadataBase is set in app/layout.tsx (e.g., https://www.grantfinder.example.com)
  // The URL for Open Graph should be absolute.
  const ogUrl = `/grants/${grant.id}`; // metadataBase will prepend the domain

  return {
    title: grant.title, // Next.js will automatically use the template from layout.tsx
    description: descriptionSnippet,
    keywords: keywords,
    openGraph: {
      title: grant.title, // Can be more specific if needed, e.g., `${grant.title} | Grant Details`
      description: descriptionSnippet,
      type: 'article',
      url: ogUrl, 
      images: [
        {
          url: '/og-image-grant-detail.jpg', // Placeholder image, relative to metadataBase
          width: 1200,
          height: 630,
          alt: `Details for ${grant.title}`,
        },
      ],
      siteName: (await parent).openGraph?.siteName || 'Grant Finder', // Inherit siteName
    },
    twitter: { // Optional: Add Twitter specific card
      card: 'summary_large_image',
      title: grant.title,
      description: descriptionSnippet,
      images: ['/og-image-grant-detail.jpg'], // Placeholder image
    },
  };
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getGrantDetails } from "@/app/services/grantsGovService";
import { Button } from "@/components/ui/button"; // Shadcn Button
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Shadcn Card
import { ArrowLeft } from 'lucide-react'; // Icon for back button

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

function fetchMockGrantById(id: string): Grant | undefined {
  return detailedMockGrants.find((grant) => grant.id === id);
}

interface GrantDetailPageProps {
  params: { id: string };
}

export default function GrantDetailPage({ params }: GrantDetailPageProps) {
  const [grant, setGrant] = useState<Grant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const grantData = await getGrantDetails(params.id);
        if (grantData) {
          setGrant(grantData);
        } else {
          const mockGrant = fetchMockGrantById(params.id);
          if (mockGrant) setGrant(mockGrant);
        }
      } catch (error) {
        console.error("Error fetching grant details:", error);
        const mockGrant = fetchMockGrantById(params.id);
        if (mockGrant) setGrant(mockGrant);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading grant details...</p>
      </main>
    );
  }

  if (!grant) {
    return (
      <main className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive mb-4">Grant not found.</p>
        <Link href="/grants" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Button>
        </Link>
      </main>
    );
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(grant.amount);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "GovernmentGrant",
    name: grant.title,
    description: grant.description,
    url: typeof window !== 'undefined' ? window.location.href : `/grants/${grant.id}`, // Use actual URL if available
    provider: {
      "@type": "GovernmentOrganization",
      name: grant.agency,
    },
    datePosted: grant.postedDate,
    applicationDeadline: grant.deadline,
    grantAmount: {
      "@type": "MonetaryAmount",
      value: grant.amount,
      currency: "USD",
    },
    eligibility: grant.eligibilityCriteria,
    keywords: grant.categories.join(", "),
  };

  return (
    <> {/* React.Fragment is not needed if you have a single root element like <main> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/grants" passHref>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search Results
            </Button>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-bold mb-2">{grant.title}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              <strong>Agency:</strong> {grant.agency}
            </CardDescription>
            <div className="text-sm text-muted-foreground space-y-1 pt-2">
              <p><strong>Opportunity Number:</strong> {grant.opportunityNumber}</p>
              <p><strong>Status:</strong> <span className={`font-semibold ${grant.opportunityStatus === 'posted' ? 'text-green-600' : 'text-yellow-600'}`}>{grant.opportunityStatus}</span></p>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Grant Overview</h2>
              <p className="text-base leading-relaxed whitespace-pre-line">{grant.description}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Eligibility</h2>
              <p className="text-base leading-relaxed whitespace-pre-line">{grant.eligibilityCriteria}</p>
            </section>

            <section className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Key Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-base">
                <p><strong>Deadline:</strong> <span className="font-medium">{grant.deadline}</span></p>
                <p><strong>Posted Date:</strong> <span className="font-medium">{grant.postedDate}</span></p>
                <p><strong>Funding Amount:</strong> <span className="font-medium text-green-700">{formattedAmount}</span></p>
                <p className="md:col-span-2"><strong>Categories:</strong> {grant.categories.join(", ")}</p>
                <p><strong>Data Source:</strong> {grant.sourceAPI}</p>
              </div>
            </section>
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-center">
            <Button asChild size="lg">
              <a href={grant.linkToApply} target="_blank" rel="noopener noreferrer">
                Apply Here
              </a>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
