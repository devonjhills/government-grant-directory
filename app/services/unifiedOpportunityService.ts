import {
  Opportunity,
  OpportunitySearchParams,
  OpportunitySearchResponse,
} from "@/types";
import { usaSpendingService } from "./usaSpendingService";
import { searchGrants, getGrantDetails } from "./grantsGovService";
import { cache, CacheKeys, CacheConfigs } from "@/app/lib/cache";
import { performanceMonitor } from "@/app/lib/performance";

export class UnifiedOpportunityService {
  // Search across all data sources
  async searchAllOpportunities(
    params: OpportunitySearchParams = {},
  ): Promise<OpportunitySearchResponse> {
    const cacheKey = CacheKeys.opportunitySearch(params);

    // Try cache first
    const cached = cache.get<OpportunitySearchResponse>(cacheKey);
    if (cached) return cached;

    try {
      // Search all sources in parallel
      const [grantsResult, awardsResult] = await Promise.allSettled([
        this.searchGrants(params),
        this.searchAwards(params),
      ]);

      // Combine results
      const allOpportunities: Opportunity[] = [];
      let totalCount = 0;

      if (grantsResult.status === "fulfilled") {
        allOpportunities.push(...grantsResult.value.opportunities);
        totalCount += grantsResult.value.totalCount;
      }

      if (awardsResult.status === "fulfilled") {
        allOpportunities.push(...awardsResult.value.opportunities);
        totalCount += awardsResult.value.totalCount;
      }

      // Sort by relevance/date
      const sortedOpportunities = this.sortOpportunities(
        allOpportunities,
        params,
      );

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedOpportunities = sortedOpportunities.slice(
        startIndex,
        endIndex,
      );

      const result: OpportunitySearchResponse = {
        opportunities: paginatedOpportunities,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: endIndex < totalCount,
        hasPrevious: page > 1,
        searchParams: params,
      };

      // Cache the result
      cache.set(cacheKey, result, CacheConfigs.search);

      return result;
    } catch (error) {
      console.error("Unified search error:", error);
      return {
        opportunities: [],
        totalCount: 0,
        page: 1,
        limit: params.limit || 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        searchParams: params,
      };
    }
  }

  // Search grants only
  async searchGrants(params: OpportunitySearchParams): Promise<{
    opportunities: Opportunity[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const grantsParams = {
        keyword: params.query,
        rows: params.limit || 20,
        offset: ((params.page || 1) - 1) * (params.limit || 20),
        oppStatuses: params.status?.includes("open")
          ? "posted|forecasted"
          : "posted",
      };

      const response = await searchGrants(grantsParams);

      return {
        opportunities: response.grants || [],
        totalCount: response.totalRecords || 0,
        hasMore: response.totalRecords > (response.grants?.length || 0),
      };
    } catch (error) {
      console.error("Grants search error:", error);
      return { opportunities: [], totalCount: 0, hasMore: false };
    }
  }

  // Search historical awards from USAspending
  async searchAwards(params: OpportunitySearchParams): Promise<{
    opportunities: Opportunity[];
    totalCount: number;
    hasMore: boolean;
  }> {
    return usaSpendingService.searchAwards(params);
  }

  // Get opportunity by ID (tries all sources)
  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const cacheKey = CacheKeys.opportunity(id);

    // Try cache first
    const cached = cache.get<Opportunity>(cacheKey);
    if (cached) return cached;

    // Determine source from ID prefix
    if (id.startsWith("grants-gov-")) {
      const grantsId = id.replace("grants-gov-", "");
      const grant = await getGrantDetails(grantsId);
      if (grant) {
        // Convert Grant to Opportunity format
        const opportunity: Opportunity = {
          ...grant,
          type: "grant",
          sourceAPI: "grants.gov",
          industryCategories: grant.categories || [],
        };
        cache.set(cacheKey, opportunity, CacheConfigs.stable);
        return opportunity;
      }
      return null;
    }

    if (id.startsWith("usaspending-")) {
      const awardId = id.replace("usaspending-", "");
      return usaSpendingService.getAwardDetails(awardId);
    }

    // Try all sources if no prefix match (try grants.gov first as it's more common)
    const results = await Promise.allSettled([
      getGrantDetails(id),
      usaSpendingService.getAwardDetails(id),
    ]);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        // If it's a Grant from grants.gov, convert to Opportunity format
        if ("linkToApply" in result.value && !("type" in result.value)) {
          const grant = result.value as any;
          const opportunity: Opportunity = {
            ...grant,
            type: "grant",
            sourceAPI: "grants.gov",
            industryCategories: grant.categories || [],
          };
          cache.set(cacheKey, opportunity, CacheConfigs.stable);
          return opportunity;
        }
        return result.value;
      }
    }

    return null;
  }

  // Get featured opportunities (high-value, recent, or promoted)
  async getFeaturedOpportunities(limit = 10): Promise<Opportunity[]> {
    const cacheKey = "featured-opportunities";

    // Try cache first
    const cached = cache.get<Opportunity[]>(cacheKey);
    if (cached) return cached;

    try {
      // Get high-value opportunities from multiple sources
      const [highValueGrants, recentAwards] = await Promise.allSettled([
        this.searchGrants({ amountMin: 1000000, limit: 5 }),
        usaSpendingService.getHighValueContracts(5),
      ]);

      const featured: Opportunity[] = [];

      if (highValueGrants.status === "fulfilled") {
        featured.push(...highValueGrants.value.opportunities.slice(0, 5));
      }

      if (recentAwards.status === "fulfilled") {
        featured.push(...recentAwards.value.slice(0, 5));
      }

      // Mark as featured and sort by amount/relevance
      const featuredWithFlag = featured
        .map((opp) => ({ ...opp, isFeature: true }))
        .sort((a, b) => (b.amount || 0) - (a.amount || 0))
        .slice(0, limit);

      // Cache for shorter time since these should be fresh
      cache.set(cacheKey, featuredWithFlag, { ttl: 1800 }); // 30 minutes

      return featuredWithFlag;
    } catch (error) {
      console.error("Featured opportunities error:", error);
      return [];
    }
  }

  // Get opportunities closing soon
  async getClosingSoonOpportunities(
    daysAhead = 30,
    limit = 20,
  ): Promise<Opportunity[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const params: OpportunitySearchParams = {
      deadlineBefore: futureDate.toISOString().split("T")[0],
      status: ["open"],
      limit,
      sortBy: "deadline",
      sortOrder: "asc",
    };

    const result = await this.searchAllOpportunities(params);
    return result.opportunities.filter(
      (opp) => opp.deadline && new Date(opp.deadline) > new Date(),
    );
  }

  // Get opportunities by agency
  async getOpportunitiesByAgency(
    agencyCode: string,
    limit = 20,
  ): Promise<Opportunity[]> {
    const params: OpportunitySearchParams = {
      agencies: [agencyCode],
      limit,
      sortBy: "posted_date",
      sortOrder: "desc",
    };

    const result = await this.searchAllOpportunities(params);
    return result.opportunities;
  }

  // Get opportunities by industry/NAICS
  async getOpportunitiesByIndustry(
    naicsCode: string,
    limit = 20,
  ): Promise<Opportunity[]> {
    const params: OpportunitySearchParams = {
      industryCategories: [naicsCode],
      limit,
      sortBy: "amount",
      sortOrder: "desc",
    };

    const result = await this.searchAllOpportunities(params);
    return result.opportunities;
  }

  // Get set-aside opportunities
  async getSetAsideOpportunities(
    setAsideType: string,
    limit = 20,
  ): Promise<Opportunity[]> {
    const params: OpportunitySearchParams = {
      businessSize: [setAsideType],
      type: ["contract", "procurement"],
      status: ["open"],
      limit,
    };

    const result = await this.searchAllOpportunities(params);
    return result.opportunities;
  }

  // Get statistics across all sources
  async getOpportunityStats(): Promise<{
    totalActive: number;
    totalValue: number;
    byType: Record<string, number>;
    byAgency: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const cacheKey = CacheKeys.stats();

    // Try cache first
    const cached = cache.get(cacheKey) as
      | {
          totalActive: number;
          totalValue: number;
          byType: Record<string, number>;
          byAgency: Record<string, number>;
          byStatus: Record<string, number>;
        }
      | undefined;
    if (cached) return cached;

    try {
      // Get recent data for stats
      const recentParams: OpportunitySearchParams = {
        postedAfter: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // Last 90 days
        limit: 1000, // Get more for accurate stats
      };

      const result = await this.searchAllOpportunities(recentParams);

      const stats = {
        totalActive: result.opportunities.filter(
          (opp) => opp.opportunityStatus === "open",
        ).length,
        totalValue: result.opportunities.reduce(
          (sum, opp) => sum + (opp.amount || 0),
          0,
        ),
        byType: this.aggregateBy(result.opportunities, "type"),
        byAgency: this.aggregateBy(result.opportunities, "agency"),
        byStatus: this.aggregateBy(result.opportunities, "opportunityStatus"),
      };

      // Cache for longer since stats don't change frequently
      cache.set(cacheKey, stats, CacheConfigs.longTerm);

      return stats;
    } catch (error) {
      console.error("Stats error:", error);
      return {
        totalActive: 0,
        totalValue: 0,
        byType: {},
        byAgency: {},
        byStatus: {},
      };
    }
  }

  // Helper method to sort opportunities
  private sortOpportunities(
    opportunities: Opportunity[],
    params: OpportunitySearchParams,
  ): Opportunity[] {
    const sortBy = params.sortBy || "relevance";
    const sortOrder = params.sortOrder || "desc";

    return opportunities.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "amount":
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case "deadline":
          comparison =
            new Date(a.deadline || "9999-12-31").getTime() -
            new Date(b.deadline || "9999-12-31").getTime();
          break;
        case "posted_date":
          comparison =
            new Date(a.postedDate || "1900-01-01").getTime() -
            new Date(b.postedDate || "1900-01-01").getTime();
          break;
        case "relevance":
        default:
          comparison = (a.searchScore || 0) - (b.searchScore || 0);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }

  // Helper method to aggregate data by field
  private aggregateBy(
    opportunities: Opportunity[],
    field: keyof Opportunity,
  ): Record<string, number> {
    return opportunities.reduce(
      (acc, opp) => {
        const value = opp[field];
        const key =
          typeof value === "string" ? value : String(value || "unknown");
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  // Health check for all services
  async healthCheck(): Promise<
    Record<string, { status: "ok" | "error"; message: string }>
  > {
    const [grantsHealth, usaSpendingHealth] = await Promise.allSettled([
      Promise.resolve({
        status: "ok" as const,
        message: "Grants.gov service available",
      }), // Would implement in grantsGovService
      usaSpendingService.healthCheck(),
    ]);

    return {
      "grants.gov":
        grantsHealth.status === "fulfilled"
          ? grantsHealth.value
          : { status: "error", message: "Health check failed" },
      "usaspending.gov":
        usaSpendingHealth.status === "fulfilled"
          ? usaSpendingHealth.value
          : { status: "error", message: "Health check failed" },
    };
  }
}

// Singleton instance
export const unifiedOpportunityService = new UnifiedOpportunityService();

// Convenience exports
export const searchAllOpportunities = (params: OpportunitySearchParams) =>
  unifiedOpportunityService.searchAllOpportunities(params);

export const getFeaturedOpportunities = (limit?: number) =>
  unifiedOpportunityService.getFeaturedOpportunities(limit);

export const getClosingSoonOpportunities = (
  daysAhead?: number,
  limit?: number,
) => unifiedOpportunityService.getClosingSoonOpportunities(daysAhead, limit);

export const getOpportunityStats = () =>
  unifiedOpportunityService.getOpportunityStats();
