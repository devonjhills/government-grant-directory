"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GrantList from "@/app/components/GrantList";
import FeaturedGrantsCard from "../../components/FeaturedGrantsCard";
import type { Grant } from "@/types";

interface NonprofitFundingClientProps {
  initialGrants: Grant[];
  initialError?: string | null;
  initialFeaturedGrants?: Grant[];
  initialFeaturedError?: string | null;
}

export default function NonprofitFundingClient({
  initialGrants,
  initialError,
  initialFeaturedGrants,
  initialFeaturedError,
}: NonprofitFundingClientProps) {
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
      name: "Featured Nonprofit Funding Opportunities",
      description:
        "A curated list of featured grants and funding opportunities for nonprofit organizations.",
      numberOfItems: grants.length,
      itemListElement: itemListElement,
    };
  };

  return (
    <div>
      {/* JSON-LD Script */}
      {!isLoading && grants && grants.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
        />
      )}

      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-6 leading-tight">
          Funding Opportunities for Nonprofits
        </h1>
        <p className="text-lg text-secondary-foreground max-w-4xl mx-auto leading-relaxed">
          Nonprofit organizations are vital to our communities, and securing
          funding is key to fulfilling their missions. This section is dedicated
          to helping you find grants tailored to the unique needs of the
          nonprofit sector.
        </p>
      </header>

      <FeaturedGrantsCard
        title="Featured Grants for Nonprofits"
        description="Key opportunities that can help support your nonprofit's initiatives and programs."
        featuredGrants={featuredGrants}
        featuredError={featuredError}
      />

      <GrantList grants={grants} />
    </div>
  );
}
