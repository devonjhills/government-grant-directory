"use client";

import React, { useState } from "react"; // Import hooks, remove useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GrantList from "@/app/components/GrantList"; // Import GrantList
import FeaturedGrantsCard from "../../components/FeaturedGrantsCard";
import type { Grant } from "@/types"; // Import Grant type

interface SmallBusinessGrantsClientProps {
  initialGrants: Grant[];
  initialError?: string | null;
  initialFeaturedGrants?: Grant[];
  initialFeaturedError?: string | null;
}

export default function SmallBusinessGrantsClient({
  initialGrants,
  initialError,
  initialFeaturedGrants,
  initialFeaturedError,
}: SmallBusinessGrantsClientProps) {
  const [grants, setGrants] = useState<Grant[]>(initialGrants);
  const [isLoading, setIsLoading] = useState<boolean>(
    initialGrants.length === 0 && !initialError,
  );
  const [error, setError] = useState<string | null>(initialError || null);

  const [featuredGrants, setFeaturedGrants] = useState<Grant[]>(
    initialFeaturedGrants || [],
  );
  const [featuredError, setFeaturedError] = useState<string | null>(
    initialFeaturedError || null,
  );

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
          : "No description available.",
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://www.grantfinder.example.com"
        }/grants/${grant.id}`,
        provider: {
          "@type": "GovernmentOrganization",
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
      {!isLoading && grants && grants.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
        />
      )}
      <div>
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Grants for Small Businesses
          </h1>
          <p className="text-lg text-secondary-foreground max-w-4xl mx-auto leading-relaxed">
            Navigating the world of grants can be challenging, but we&apos;re
            here to help. Discover a variety of funding opportunities designed
            to support small businesses at every stage, from innovative startups
            to established enterprises looking to expand.
          </p>
        </header>

        <FeaturedGrantsCard
          title="Featured Grants for Small Businesses"
          description="Handpicked opportunities that could be a great fit for your business."
          featuredGrants={featuredGrants}
          featuredError={featuredError}
        />

        <GrantList grants={grants} />
      </div>
    </>
  );
}
