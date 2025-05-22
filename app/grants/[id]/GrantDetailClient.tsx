"use client";

import React, { useState, useEffect } from "react";
import type { Grant } from "@/types";
import { getGrantDetails } from "@/app/services/grantsGovService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GrantDetailPageProps {
  params: { id: string };
}

export default function GrantDetailClient({ params }: GrantDetailPageProps) {
  const [grantData, setGrantData] = useState<Grant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const grantData = await getGrantDetails(params.id);
        if (grantData) {
          setGrantData(grantData);
        }
      } catch (error) {
        console.error("Error fetching grant details:", error);
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

  if (!grantData) {
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
  }).format(grantData.amount);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "GovernmentGrant",
    name: (() => {
      function isMeaningfulTitle(title: string): boolean {
        const codePattern = /^[A-Z0-9\-]+$/;
        return !codePattern.test(title);
      }
      function getMeaningfulTitle(grant: Grant): string {
        if (grant.title && isMeaningfulTitle(grant.title)) {
          return grant.title;
        }
        if (grant.agency && grant.opportunityNumber) {
          return `${grant.agency} Grant - Opportunity ${grant.opportunityNumber}`;
        }
        if (grant.agency) {
          return `${grant.agency} Grant Opportunity`;
        }
        return "Government Grant Details";
      }
      return getMeaningfulTitle(grantData);
    })(),
    description: grantData.description,
    url:
      typeof window !== "undefined"
        ? window.location.href
        : `/grants/${grantData.id}`,
    provider: {
      "@type": "GovernmentOrganization",
      name: grantData.agency,
    },
    datePosted: grantData.postedDate,
    applicationDeadline: grantData.deadline,
    grantAmount: {
      "@type": "MonetaryAmount",
      value: grantData.amount,
      currency: "USD",
    },
    eligibility: grantData.eligibilityCriteria,
    keywords: grantData.categories.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/grants">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search Results
            </Link>
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-bold mb-2">
              {(() => {
                // Helper function to determine if a title is meaningful
                function isMeaningfulTitle(title: string): boolean {
                  const codePattern = /^[A-Z0-9\-]+$/;
                  return !codePattern.test(title);
                }
                // Compose a meaningful title for display
                function getMeaningfulTitle(grant: Grant): string {
                  if (grant.title && isMeaningfulTitle(grant.title)) {
                    return grant.title;
                  }
                  if (grant.agency && grant.opportunityNumber) {
                    return `${grant.agency} Grant - Opportunity ${grant.opportunityNumber}`;
                  }
                  if (grant.agency) {
                    return `${grant.agency} Grant Opportunity`;
                  }
                  return "Government Grant Details";
                }
                return getMeaningfulTitle(grantData);
              })()}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              <strong>Agency:</strong> {grantData.agency}
            </CardDescription>
            <div className="text-sm text-muted-foreground space-y-1 pt-2">
              <p>
                <strong>Opportunity Number:</strong>{" "}
                {grantData.opportunityNumber}
              </p>
              {(() => {
                // Show original title (code) as secondary detail if not meaningful
                function isMeaningfulTitle(title: string): boolean {
                  const codePattern = /^[A-Z0-9\-]+$/;
                  return !codePattern.test(title);
                }
                if (grantData.title && !isMeaningfulTitle(grantData.title)) {
                  return (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      <strong>Code:</strong> {grantData.title}
                    </p>
                  );
                }
                return null;
              })()}
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    grantData.opportunityStatus === "posted"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}>
                  {grantData.opportunityStatus}
                </span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3 border-b pb-2">
                Grant Overview
              </h2>
              <p className="text-base leading-relaxed whitespace-pre-line">
                {grantData.description}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-3 border-b pb-2">
                Eligibility
              </h2>
              <p className="text-base leading-relaxed whitespace-pre-line">
                {grantData.eligibilityCriteria}
              </p>
            </section>

            <section className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                Key Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-base">
                <p>
                  <strong>Deadline:</strong>{" "}
                  <span className="font-medium">{grantData.deadline}</span>
                </p>
                <p>
                  <strong>Posted Date:</strong>{" "}
                  <span className="font-medium">{grantData.postedDate}</span>
                </p>
                <p>
                  <strong>Funding Amount:</strong>{" "}
                  <span className="font-medium text-green-700">
                    {formattedAmount}
                  </span>
                </p>
                <p className="md:col-span-2">
                  <strong>Categories:</strong> {grantData.categories.join(", ")}
                </p>
                <p>
                  <strong>Data Source:</strong> {grantData.sourceAPI}
                </p>
              </div>
            </section>
          </CardContent>

          <CardFooter className="border-t pt-6 flex justify-center">
            <Button asChild size="lg">
              <a
                href={grantData.linkToApply}
                target="_blank"
                rel="noopener noreferrer">
                Apply Here
              </a>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
