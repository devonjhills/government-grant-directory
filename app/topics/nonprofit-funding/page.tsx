"use client"; // Convert to client component

import React, { useState, useEffect } from 'react'; // Import hooks
import type { Metadata } from 'next'; // Keep Metadata
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { searchGrants } from '@/app/services/grantsGovService'; // Import searchGrants
import GrantList from '@/app/components/GrantList'; // Import GrantList
import type { Grant } from '@/types'; // Import Grant type

// Metadata can still be exported from client components for static aspects.
export const metadata: Metadata = {
  title: "Nonprofit Funding Opportunities | Grant Finder",
  description: "Discover grants and funding opportunities tailored for nonprofit organizations. Support your mission with the right financial resources.",
  keywords: ["nonprofit grants", "charity funding", "foundation grants", "501c3 grants"],
  openGraph: {
    title: "Nonprofit Funding Opportunities | Grant Finder",
    description: "Support your mission with the right financial resources through various grant programs.",
    url: "/topics/nonprofit-funding", // Relative to metadataBase
    images: [
      {
        url: '/og-image-grant-listings.png', // New grant listings OG image
        width: 1200,
        height: 630,
        alt: 'Funding for Nonprofits on Grant Finder',
      },
    ],
    siteName: 'Grant Finder',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nonprofit Funding Opportunities | Grant Finder",
    description: "Support your mission with the right financial resources.",
    images: ['/og-image-grant-listings.png'], // New grant listings OG image
  },
};

export default function NonprofitFundingPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchGrants({
          keyword: "nonprofit OR community", // Specific keyword for this page
          oppStatuses: "posted",             // Fetch active grants
          rows: 6,                           // Fetch a limited number for "featured"
        });
        setGrants(response.grants);
      } catch (err) {
        console.error("Failed to fetch nonprofit grants:", err);
        setError("Failed to load grants. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrants();
  }, []); // Empty dependency array means this runs once on mount

  const generateJsonLd = () => {
    if (!grants || grants.length === 0) {
      return null;
    }
    const itemListElement = grants.map((grant, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "GovernmentGrant", // Or "Thing"
        name: grant.title,
        description: grant.description ? grant.description.substring(0, 150) + '...' : 'No description available.', // Snippet
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.grantfinder.example.com'}/grants/${grant.id}`,
        provider: {
          "@type": "GovernmentOrganization", // Or "Organization"
          name: grant.agency,
        }
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Featured Nonprofit Funding Opportunities",
      description: "A curated list of featured grants and funding opportunities for nonprofit organizations.",
      numberOfItems: grants.length,
      itemListElement: itemListElement,
    };
  };

  return (
    <>
      {/* JSON-LD Script */}
      {!isLoading && grants && grants.length > 0 && ( // Render only when grants are available and not loading
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Funding Opportunities for Nonprofits</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Nonprofit organizations are vital to our communities, and securing funding is key to fulfilling their missions.
          This section is dedicated to helping you find grants tailored to the unique needs of the nonprofit sector.
        </p>
      </header>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Featured Grants for Nonprofits</CardTitle>
          <CardDescription>
            Key opportunities that can help support your nonprofit's initiatives and programs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            {isLoading ? (
              <p className="text-center text-muted-foreground py-10">Loading grants...</p>
            ) : error ? (
              <p className="text-center text-destructive py-10">{error}</p>
            ) : grants.length > 0 ? (
              <GrantList grants={grants} />
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No featured grants for nonprofit funding found at this time.
              </p>
            )}
        </CardContent>
      </Card>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3 text-secondary-foreground">Understanding Nonprofit Funding</h2>
          <p className="text-muted-foreground leading-relaxed">
            Funding for nonprofits can come from various sources, including government agencies, private foundations, and corporate philanthropy. 
            Each source often has specific focus areas and eligibility requirements.
          </p>
        </div>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Foundation Grants</h3>
          <p className="text-muted-foreground leading-relaxed">
            Private and community foundations are a major source of funding for nonprofits. They often support specific causes like education, health, arts, 
            or community development. Researching foundations whose mission aligns with yours is crucial.
          </p>
        </article>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Government Grants for Nonprofits</h3>
          <p className="text-muted-foreground leading-relaxed">
            Federal, state, and local governments offer grants for nonprofits providing public services or addressing specific societal needs. 
            These can range from operational support to funding for specific programs in areas like housing, health services, or environmental protection.
          </p>
        </article>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Corporate Giving Programs</h3>
          <p className="text-muted-foreground leading-relaxed">
            Many corporations have philanthropic arms or programs that provide grants to nonprofits, often focusing on communities where they operate 
            or causes that align with their corporate values. These can include direct funding, sponsorships, or in-kind donations.
          </p>
        </article>
        
        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Capacity Building Grants</h3>
          <p className="text-muted-foreground leading-relaxed">
            Some funders offer grants specifically designed to help nonprofits strengthen their organizational capacity. 
            This can include funding for strategic planning, staff training, technology upgrades, or improving fundraising capabilities, 
            ultimately making the organization more effective and sustainable.
          </p>
        </article>
      </section>
    </div>
  );
}
