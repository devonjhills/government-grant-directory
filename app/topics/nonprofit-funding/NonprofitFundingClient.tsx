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

interface NonprofitFundingClientProps {
  initialGrants: Grant[];
  initialError?: string | null;
}

export default function NonprofitFundingClient({
  initialGrants,
  initialError,
}: NonprofitFundingClientProps) {
  const [grants, setGrants] = useState<Grant[]>(initialGrants);
  // isLoading is true only if there are no initial grants and no initial error.
  // If server provides grants or an error, loading is effectively done.
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
        "@type": "GovernmentGrant", // Or "Thing"
        name: grant.title,
        description: grant.description
          ? grant.description.substring(0, 150) + "..."
          : "No description available.", // Snippet
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL ||
          "https://www.grantfinder.example.com"
        }/grants/${grant.id}`,
        provider: {
          "@type": "GovernmentOrganization", // Or "Organization"
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
            Funding Opportunities for Nonprofits
          </h1>
          <p className="text-lg text-secondary-foreground max-w-4xl mx-auto leading-relaxed">
            Nonprofit organizations are vital to our communities, and securing
            funding is key to fulfilling their missions. This section is
            dedicated to helping you find grants tailored to the unique needs of
            the nonprofit sector.
          </p>
        </header>

        <Card className="mb-16 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold">
              Featured Grants for Nonprofits
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Key opportunities that can help support your nonprofit's
              initiatives and programs.
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
                No featured grants for nonprofit funding found at this time.
              </p>
            )}
          </CardContent>
        </Card>

        <section className="space-y-10">
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-secondary-foreground">
              Understanding Nonprofit Funding
            </h2>
            <p className="text-secondary-foreground leading-relaxed text-lg max-w-3xl mx-auto">
              Funding for nonprofits can come from various sources, including
              government agencies, private foundations, and corporate
              philanthropy. Each source often has specific focus areas and
              eligibility requirements.
            </p>
          </div>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">Foundation Grants</h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              Private and community foundations are a major source of funding
              for nonprofits. They often support specific causes like education,
              health, arts, or community development. Researching foundations
              whose mission aligns with yours is crucial.
            </p>
          </article>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Government Grants for Nonprofits
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              Federal, state, and local governments offer grants for nonprofits
              providing public services or addressing specific societal needs.
              These can range from operational support to funding for specific
              programs in areas like housing, health services, or environmental
              protection.
            </p>
          </article>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Corporate Giving Programs
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              Many corporations have philanthropic arms or programs that provide
              grants to nonprofits, often focusing on communities where they
              operate or causes that align with their corporate values. These
              can include direct funding, sponsorships, or in-kind donations.
            </p>
          </article>

          <article className="p-8 bg-card border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-semibold mb-3">
              Capacity Building Grants
            </h3>
            <p className="text-secondary-foreground leading-relaxed text-lg">
              Some funders offer grants specifically designed to help nonprofits
              strengthen their organizational capacity. This can include funding
              for strategic planning, staff training, technology upgrades, or
              improving fundraising capabilities, ultimately making the
              organization more effective and sustainable.
            </p>
          </article>
        </section>
      </div>
    </>
  );
}
