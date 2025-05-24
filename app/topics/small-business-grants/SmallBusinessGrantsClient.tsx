"use client";

import React, { useState } from "react"; // Import hooks, remove useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { searchGrants } from "@/app/services/grantsGovService"; // Import searchGrants
import GrantList from "@/app/components/GrantList"; // Import GrantList
import type { Grant } from "@/types"; // Import Grant type

// Metadata will be moved to the server component.

interface SmallBusinessGrantsClientProps {
  initialGrants: Grant[];
  initialError?: string | null;
}

export default function SmallBusinessGrantsClient({
  initialGrants,
  initialError,
}: SmallBusinessGrantsClientProps) {
  const [grants, setGrants] = useState<Grant[]>(initialGrants);
  const [isLoading, setIsLoading] = useState<boolean>(
    initialGrants.length === 0 && !initialError
  );
  const [error, setError] = useState<string | null>(initialError || null);

  // useEffect for data fetching has been removed.

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
        description: grant.description
          ? grant.description.substring(0, 150) + "..."
          : "No description available.", // Snippet
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://www.grantfinder.example.com"
        }/grants/${grant.id}`,
        provider: {
          // Example of adding provider
          "@type": "GovernmentOrganization", // Or "Organization"
          name: grant.agency,
        },
      },
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Featured Small Business Grants",
      description:
        "A curated list of featured grants relevant to small businesses.",
      numberOfItems: grants.length,
      itemListElement: itemListElement,
    };
  };

  return (
    <>
      {/* JSON-LD Script */}
      {!isLoading &&
        grants &&
        grants.length > 0 && ( // Render only when grants are available and not loading
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateJsonLd()),
            }}
          />
        )}
      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 lg:px-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-primary mb-6 leading-tight">
            Grants for Small Businesses
          </h1>
          <p className="text-lg text-secondary-foreground max-w-4xl mx-auto leading-relaxed">
            Navigating the world of grants can be challenging, but we're here to
            help. Discover a variety of funding opportunities designed to
            support small businesses at every stage, from innovative startups to
            established enterprises looking to expand.
          </p>
        </header>

        <Card className="mb-16 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">
              Featured Grants for Small Businesses
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Handpicked opportunities that could be a great fit for your
              business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-12 text-lg">
                Loading grants...
              </p>
            ) : error ? (
              <p className="text-center text-destructive py-12 text-lg">
                {error}
              </p>
            ) : grants && grants.length > 0 ? ( // Check grants directly
              <GrantList grants={grants} />
            ) : (
              <p className="text-center text-muted-foreground py-12 text-lg">
                No featured grants for small businesses found at this time.
              </p>
            )}
          </CardContent>
        </Card>

        <section className="space-y-10">
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-secondary-foreground">
              Types of Small Business Grants
            </h2>
            <p className="text-secondary-foreground leading-relaxed text-lg max-w-3xl mx-auto">
              Small business grants come in many forms, each designed to address
              specific needs or support particular demographics. Understanding
              these types can help you narrow down your search and find the most
              relevant funding for your venture.
            </p>
          </div>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Innovation and R&D Grants
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              These grants are aimed at businesses involved in research and
              development of new products, services, or technologies. Often
              provided by federal agencies like the Small Business
              Administration (SBA) through programs such as SBIR (Small Business
              Innovation Research) and STTR (Small Business Technology
              Transfer), these funds can be crucial for pioneering projects.
            </p>
          </article>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Grants for Women-Owned Businesses
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              Various programs at federal, state, and private levels are
              dedicated to supporting women entrepreneurs. These grants aim to
              level the playing field and provide resources for women to start,
              grow, and scale their businesses. Organizations like the Women's
              Business Centers (WBCs) often provide information and assistance.
            </p>
          </article>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Grants for Veteran-Owned Businesses
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              To honor their service, specific grant and loan programs are
              available to veterans starting or expanding their businesses. The
              Office of Veterans Business Development (OVBD) within the SBA is a
              key resource, offering training, counseling, and access to funding
              opportunities tailored for veteran entrepreneurs.
            </p>
          </article>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Rural Business Development Grants
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              The U.S. Department of Agriculture (USDA) and other entities offer
              grants to promote economic development and job creation in rural
              communities. These can support a wide range of projects, from
              infrastructure development to technical assistance and training
              for small rural businesses.
            </p>
          </article>
        </section>
      </div>
    </>
  );
}
