"use client"; // Convert to client component

import React, { useState, useEffect } from 'react'; // Import hooks
import type { Metadata } from 'next'; // Keep Metadata for potential static export if needed, though not primary for client components
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

// Metadata can still be exported from client components, but it's often better handled
// by a layout or a separate metadata.ts if complex/dynamic metadata based on client state is not required.
// For this task, we'll keep it as is, assuming it's for static aspects.
export const metadata: Metadata = {
  title: "Small Business Grants | Grant Finder",
  description: "Explore a wide range of grants specifically for small businesses. Find funding for startup, growth, innovation, and more.",
  keywords: ["small business grants", "sme funding", "startup grants", "business financing"],
  openGraph: {
    title: "Small Business Grants | Grant Finder",
    description: "Find funding for startup, growth, innovation, and more through various grant programs.",
    url: "/topics/small-business-grants", // Relative to metadataBase
    images: [
      {
        url: '/og-image-grant-listings.png', // New grant listings OG image
        width: 1200,
        height: 630,
        alt: 'Grants for Small Businesses on Grant Finder',
      },
    ],
    siteName: 'Grant Finder', // This might be inherited from layout if not specified
  },
  twitter: {
    card: 'summary_large_image',
    title: "Small Business Grants | Grant Finder",
    description: "Find funding for startup, growth, innovation, and more.",
    images: ['/og-image-grant-listings.png'], // New grant listings OG image
  },
};

export default function SmallBusinessGrantsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrants = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchGrants({
          keyword: "small business", // Specific keyword for this page
          oppStatuses: "posted",       // Fetch active grants
          rows: 6,                     // Fetch a limited number for "featured"
        });
        setGrants(response.grants);
      } catch (err) {
        console.error("Failed to fetch small business grants:", err);
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
        "@type": "GovernmentGrant", 
        name: grant.title,
        description: grant.description ? grant.description.substring(0, 150) + '...' : 'No description available.', // Snippet
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.grantfinder.example.com'}/grants/${grant.id}`, 
        provider: { // Example of adding provider
          "@type": "GovernmentOrganization", // Or "Organization"
          name: grant.agency,
        }
      }
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Featured Small Business Grants", 
      description: "A curated list of featured grants relevant to small businesses.",
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
          <h1 className="text-4xl font-bold text-primary mb-4">Grants for Small Businesses</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Navigating the world of grants can be challenging, but we're here to help.
          Discover a variety of funding opportunities designed to support small businesses
          at every stage, from innovative startups to established enterprises looking to expand.
        </p>
      </header>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Featured Grants for Small Businesses</CardTitle>
          <CardDescription>
            Handpicked opportunities that could be a great fit for your business.
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
                No featured grants for small businesses found at this time.
              </p>
            )}
        </CardContent>
      </Card>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3 text-secondary-foreground">Types of Small Business Grants</h2>
          <p className="text-muted-foreground leading-relaxed">
            Small business grants come in many forms, each designed to address specific needs or support particular demographics. 
            Understanding these types can help you narrow down your search and find the most relevant funding for your venture.
          </p>
        </div>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Innovation and R&D Grants</h3>
          <p className="text-muted-foreground leading-relaxed">
            These grants are aimed at businesses involved in research and development of new products, services, or technologies. 
            Often provided by federal agencies like the Small Business Administration (SBA) through programs such as SBIR (Small Business Innovation Research) 
            and STTR (Small Business Technology Transfer), these funds can be crucial for pioneering projects.
          </p>
        </article>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Grants for Women-Owned Businesses</h3>
          <p className="text-muted-foreground leading-relaxed">
            Various programs at federal, state, and private levels are dedicated to supporting women entrepreneurs. 
            These grants aim to level the playing field and provide resources for women to start, grow, and scale their businesses. 
            Organizations like the Women's Business Centers (WBCs) often provide information and assistance.
          </p>
        </article>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Grants for Veteran-Owned Businesses</h3>
          <p className="text-muted-foreground leading-relaxed">
            To honor their service, specific grant and loan programs are available to veterans starting or expanding their businesses. 
            The Office of Veterans Business Development (OVBD) within the SBA is a key resource, offering training, counseling, 
            and access to funding opportunities tailored for veteran entrepreneurs.
          </p>
        </article>

        <article className="p-6 bg-card border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Rural Business Development Grants</h3>
          <p className="text-muted-foreground leading-relaxed">
            The U.S. Department of Agriculture (USDA) and other entities offer grants to promote economic development and job creation in rural communities. 
            These can support a wide range of projects, from infrastructure development to technical assistance and training for small rural businesses.
          </p>
        </article>
      </section>
    </div>
  );
}
