"use client";

import React, { useState, useEffect } from "react";
import type { Grant } from "@/types";
import { getGrantDetails } from "@/app/services/grantsGovService";
import { formatGrantDetailDate } from "@/app/lib/date-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, DollarSign, Building2, Hash, Mail, Phone, Users, FileText, Info, ExternalLink } from "lucide-react";
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

  if (!grantData) {
    return (
      <main className="container mx-auto px-4 py-6 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Grant Not Found</h2>
            <p className="text-muted-foreground mb-4">The grant you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
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

  const getMeaningfulTitle = (grant: Grant): string => {
    function isMeaningfulTitle(title: string): boolean {
      const codePattern = /^[A-Z0-9\-]+$/;
      return !codePattern.test(title);
    }
    
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
  };

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
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/grants">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search Results
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="w-full">
            <CardHeader className="border-b bg-muted/50 p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-3xl font-bold leading-tight mb-2">
                      {getMeaningfulTitle(grantData)}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{grantData.agency}</span>
                      </div>
                      {grantData.agencyCode && (
                        <Badge variant="secondary">{grantData.agencyCode}</Badge>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(grantData.opportunityStatus || "Unknown")}>
                    {grantData.opportunityStatus || "Unknown"}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Opportunity:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {grantData.opportunityNumber}
                    </Badge>
                  </div>
                  
                  {grantData.title && !/^[A-Z0-9\-]+$/.test(grantData.title) === false && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Code:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {grantData.title}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Grant Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose dark:prose-invert max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: grantData.description }}
                  />
                </CardContent>
              </Card>

              {grantData.additionalInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose dark:prose-invert max-w-none leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: grantData.additionalInfo }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="funding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Funding Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(grantData.awardCeiling || grantData.amount > 0) && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Award Ceiling</h4>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(grantData.awardCeiling || grantData.amount)}
                        </p>
                      </div>
                    )}
                    
                    {grantData.awardFloor && grantData.awardFloor > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Award Floor</h4>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(grantData.awardFloor)}
                        </p>
                      </div>
                    )}
                    
                    {grantData.expectedAwards && grantData.expectedAwards > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Expected Awards</h4>
                        <p className="text-2xl font-bold text-purple-700">
                          {grantData.expectedAwards.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    {grantData.fundingInstruments && grantData.fundingInstruments.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Funding Instruments</h4>
                        <div className="flex flex-wrap gap-2">
                          {grantData.fundingInstruments.map((instrument, index) => (
                            <Badge key={index} variant="secondary">
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {grantData.fundingActivityCategories && grantData.fundingActivityCategories.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Funding Activity Categories  </h4>
                        <div className="flex flex-wrap gap-2">
                          {grantData.fundingActivityCategories.map((category, index) => (
                            <Badge key={index} variant="outline">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {grantData.cfda && grantData.cfda.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">CFDA Numbers</h4>
                        <div className="flex flex-wrap gap-2">
                          {grantData.cfda.map((cfda, index) => (
                            <Badge key={index} variant="outline" className="font-mono">
                              {cfda}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {grantData.costSharing && (
                      <div>
                        <h4 className="font-semibold mb-2">Cost Sharing</h4>
                        <p className="text-muted-foreground">{grantData.costSharing}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eligibility" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Eligibility Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose dark:prose-invert max-w-none leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: grantData.eligibilityCriteria }}
                  />
                  
                  {grantData.applicantTypes && grantData.applicantTypes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Eligible Applicant Types</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {grantData.applicantTypes.map((type, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm">{type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Important Dates & Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Application Deadline</h4>
                        <p className="text-lg font-medium">
                          {formatGrantDetailDate(grantData.deadline)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Posted Date</h4>
                        <p className="text-lg font-medium">
                          {formatGrantDetailDate(grantData.postedDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">Data Source</h4>
                        <Badge>{grantData.sourceAPI}</Badge>
                      </div>
                      
                      {grantData.version && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Version</h4>
                          <Badge variant="outline">{grantData.version}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  {grantData.categories.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {grantData.categories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {grantData.grantorContactInfo ? (
                    <div className="space-y-4">
                      {grantData.grantorContactInfo.name && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Contact Name</h4>
                          <p className="text-lg">{grantData.grantorContactInfo.name}</p>
                        </div>
                      )}
                      
                      {grantData.grantorContactInfo.email && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Email</h4>
                          <a 
                            href={`mailto:${grantData.grantorContactInfo.email}`}
                            className="text-lg text-primary hover:underline flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            {grantData.grantorContactInfo.email}
                          </a>
                        </div>
                      )}
                      
                      {grantData.grantorContactInfo.phone && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Phone</h4>
                          <a 
                            href={`tel:${grantData.grantorContactInfo.phone}`}
                            className="text-lg text-primary hover:underline flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            {grantData.grantorContactInfo.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specific contact information available. Please use the application link below to get in touch with the agency.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Apply Button */}
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <a
                  href={grantData.linkToApply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Apply for This Grant
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                This will take you to the official Grants.gov application page
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
