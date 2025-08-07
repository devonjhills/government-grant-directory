"use client";

import React, { useState, useEffect } from "react";
import type { Opportunity } from "@/types";
import { unifiedOpportunityService } from "@/app/services/unifiedOpportunityService";
import { enhancedDataEnrichment } from "@/app/lib/enhanced-data-enrichment";
import { formatGrantDetailDate } from "@/app/lib/date-utils";
import { GrantIntelligenceDashboard } from "@/app/components/GrantIntelligenceDashboard";
import { ApplicationReadinessAssessment } from "@/app/components/ApplicationReadinessAssessment";
import {
  getOpportunityTypeConfig,
  formatOpportunityMetrics,
  getSuccessTerminology,
} from "@/app/lib/opportunity-types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  Hash,
  Mail,
  Phone,
  Users,
  FileText,
  Info,
  ExternalLink,
  Target,
  Clock,
  BarChart3,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
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
  const [opportunityData, setOpportunityData] = useState<Opportunity | null>(
    null,
  );
  const [intelligenceData, setIntelligenceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [intelligenceLoading, setIntelligenceLoading] =
    useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const opportunity = await unifiedOpportunityService.getOpportunityById(
          params.id,
        );
        if (opportunity) {
          setOpportunityData(opportunity);

          // Fetch intelligence data asynchronously
          setIntelligenceLoading(true);
          try {
            const enhanced =
              await enhancedDataEnrichment.enhanceOpportunityWithIntelligence(
                opportunity,
              );
            setIntelligenceData({
              intelligence: enhanced.intelligence,
              applicationReadiness: enhanced.applicationReadiness,
            });
          } catch (error) {
            console.error("Error fetching intelligence data:", error);
          } finally {
            setIntelligenceLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching opportunity details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Skeleton className="h-9 w-48" />
        </div>
        <Card className="w-full">
          <CardHeader className="border-b bg-muted/50 p-6">
            <Skeleton className="h-10 w-3/4 mb-3" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!opportunityData) {
    return (
      <main className="container mx-auto px-4 py-6 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Grant Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The grant you&apos;re looking for doesn&apos;t exist or may have
              been removed.
            </p>
            <Button asChild variant="outline">
              <Link href="/grants">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Amount varies";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "posted":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "closed":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "forecasted":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Get opportunity type configuration for enhanced styling and terminology
  const typeConfig = getOpportunityTypeConfig(opportunityData);
  const terminology = getSuccessTerminology(typeConfig.type);
  const metrics = formatOpportunityMetrics(opportunityData, typeConfig);

  const getMeaningfulTitle = (opportunity: Opportunity): string => {
    function isMeaningfulTitle(title: string): boolean {
      const codePattern = /^[A-Z0-9\-]+$/;
      return !codePattern.test(title);
    }

    if (opportunity.title && isMeaningfulTitle(opportunity.title)) {
      return opportunity.title;
    }
    if (opportunity.agency && opportunity.opportunityNumber) {
      return `${opportunity.agency} ${opportunity.type === "grant" ? "Grant" : "Contract"} - Opportunity ${opportunity.opportunityNumber}`;
    }
    if (opportunity.agency) {
      return `${opportunity.agency} ${opportunity.type === "grant" ? "Grant" : "Contract"} Opportunity`;
    }
    return "Government Funding Opportunity";
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type":
      opportunityData.type === "grant"
        ? "GovernmentGrant"
        : "GovernmentService",
    name: getMeaningfulTitle(opportunityData),
    description: opportunityData.description,
    url:
      typeof window !== "undefined"
        ? window.location.href
        : `/grants/${opportunityData.id}`,
    provider: {
      "@type": "GovernmentOrganization",
      name: opportunityData.agency,
    },
    datePosted: opportunityData.postedDate,
    applicationDeadline: opportunityData.deadline,
    ...(opportunityData.type === "grant"
      ? {
          grantAmount: {
            "@type": "MonetaryAmount",
            value: opportunityData.amount,
            currency: "USD",
          },
        }
      : {
          serviceType: opportunityData.type,
          contractValue: {
            "@type": "MonetaryAmount",
            value: opportunityData.amount,
            currency: "USD",
          },
        }),
    eligibility: opportunityData.eligibilityCriteria,
    keywords: [
      ...(opportunityData.categories || []),
      ...(opportunityData.industryCategories || []),
      opportunityData.type,
      "government funding",
    ].join(", "),
    offers: {
      "@type": "Offer",
      priceRange:
        opportunityData.amount > 0
          ? `$${opportunityData.amount.toLocaleString()}`
          : "Varies",
      availability:
        opportunityData.opportunityStatus === "open" ? "InStock" : "OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <main className="container-clean">
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/grants">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search Results
            </Link>
          </Button>
        </div>

        <div className="space-clean-loose">
          {/* Clean Header Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-medium">
                    {typeConfig.displayName}
                  </Badge>
                  <Badge
                    className={getStatusColor(
                      opportunityData.opportunityStatus || "Unknown",
                    )}
                  >
                    {opportunityData.opportunityStatus || "Unknown"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold leading-tight text-foreground">
                  {getMeaningfulTitle(opportunityData)}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{opportunityData.agency}</span>
                  {opportunityData.agencyCode && (
                    <Badge variant="outline" className="text-xs">
                      {opportunityData.agencyCode}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span>Opportunity:</span>
                  <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {opportunityData.opportunityNumber}
                  </code>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Layout */}
          <div className="space-y-6">
            {/* Hero Success Probability - Featured */}
            {intelligenceData?.intelligence && (
              <Card
                className={`border-l-4 ${typeConfig.colorScheme.border} ${typeConfig.colorScheme.background}/30`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-6 w-6 text-primary" />
                    Success Probability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div
                        className={`text-6xl font-bold ${typeConfig.colorScheme.primary}`}
                      >
                        {intelligenceData.intelligence.successProbability}%
                      </div>
                      <p className="text-base text-muted-foreground mt-2">
                        Estimated success rate for this opportunity
                      </p>
                    </div>
                    <div className="space-y-3 text-sm bg-white/80 p-4 rounded-lg border">
                      <div className="font-semibold text-foreground mb-2">
                        Calculation Breakdown:
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${typeConfig.colorScheme.background}`}
                        ></div>
                        <span>VA baseline: 18% success rate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${typeConfig.colorScheme.background}`}
                        ></div>
                        <span>
                          Large infrastructure: +7% (fewer capable applicants)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${typeConfig.colorScheme.background}`}
                        ></div>
                        <span>
                          Limited eligibility: +5% (state/tribal only)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics - Clean Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Funding Amount */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>Award Amount</span>
                    </div>
                    <div className="text-xl font-semibold">
                      {formatCurrency(
                        opportunityData.awardCeiling || opportunityData.amount,
                      )}
                    </div>
                    {opportunityData.awardFloor && (
                      <div className="text-sm text-muted-foreground">
                        Min: {formatCurrency(opportunityData.awardFloor)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Deadline */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Application Deadline</span>
                    </div>
                    <div className="text-xl font-semibold">
                      {formatGrantDetailDate(opportunityData.deadline)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Probability */}
              {intelligenceData?.intelligence && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>Success Rate</span>
                      </div>
                      <div className="text-xl font-semibold text-emerald-600">
                        {intelligenceData.intelligence.successProbability}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {intelligenceData.intelligence.competitionLevel}{" "}
                        competition
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Description - Takes most space */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Opportunity Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: opportunityData.description,
                    }}
                  />
                </CardContent>
              </Card>

              {/* Sidebar Info */}
              <div className="space-y-4">
                {/* Quick Facts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="text-muted-foreground">Posted</div>
                      <div className="font-medium">
                        {formatGrantDetailDate(opportunityData.postedDate)}
                      </div>
                    </div>
                    {opportunityData.cfda &&
                      opportunityData.cfda.length > 0 && (
                        <div className="text-sm">
                          <div className="text-muted-foreground">
                            CFDA Program
                          </div>
                          <div className="font-mono text-xs">
                            {opportunityData.cfda[0]}
                          </div>
                        </div>
                      )}
                    <div className="text-sm">
                      <div className="text-muted-foreground">Source</div>
                      <div className="font-medium">
                        {opportunityData.sourceAPI}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Info */}
                {opportunityData.contactInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {opportunityData.contactInfo.name && (
                        <div className="font-medium text-sm">
                          {opportunityData.contactInfo.name}
                        </div>
                      )}
                      {opportunityData.contactInfo.email && (
                        <a
                          href={`mailto:${opportunityData.contactInfo.email}`}
                          className="text-blue-600 hover:underline text-sm block"
                        >
                          {opportunityData.contactInfo.email}
                        </a>
                      )}
                      {opportunityData.contactInfo.phone && (
                        <a
                          href={`tel:${opportunityData.contactInfo.phone}`}
                          className="text-blue-600 hover:underline text-sm block"
                        >
                          {opportunityData.contactInfo.phone}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Eligibility Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Eligibility Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="prose prose-sm max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: opportunityData.eligibilityCriteria,
                    }}
                  />
                  {opportunityData.applicantTypes &&
                    opportunityData.applicantTypes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3 text-sm">
                          Eligible Applicants
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {opportunityData.applicantTypes.map((type, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Intelligence Dashboard */}
            {intelligenceData?.intelligence && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Intelligence Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {intelligenceLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto"></div>
                      <p className="text-muted-foreground mt-3 text-sm">
                        Loading analysis...
                      </p>
                    </div>
                  ) : intelligenceData && intelligenceData.intelligence ? (
                    <GrantIntelligenceDashboard
                      opportunity={opportunityData}
                      intelligence={intelligenceData.intelligence}
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      Analysis not available
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Application Readiness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationReadinessAssessment
                  opportunity={opportunityData}
                  onAssessmentComplete={(assessment) => {
                    console.log("Assessment completed:", assessment);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Apply Button */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-3">
                <Button asChild size="lg" className="px-6 py-3 font-medium">
                  <a
                    href={opportunityData.linkToApply}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    {terminology.verb} {terminology.noun}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Opens the official application page
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
