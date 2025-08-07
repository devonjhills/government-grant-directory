import { Opportunity, OpportunitySearchParams } from "@/types";
import { User } from "./subscription";

// Advanced search filters for B2B users
export interface AdvancedSearchFilters {
  // Standard filters (available to all users)
  basic: {
    query?: string;
    opportunityTypes?: string[];
    agencies?: string[];
    status?: string[];
    amountRange?: {
      min?: number;
      max?: number;
    };
    dateRange?: {
      postedAfter?: string;
      postedBefore?: string;
      deadlineAfter?: string;
      deadlineBefore?: string;
    };
    location?: {
      states?: string[];
      cities?: string[];
      international?: boolean;
    };
  };

  // Advanced filters (Professional tier and above)
  advanced?: {
    industryCategories?: string[]; // NAICS codes
    businessSize?: string[];
    setAsideTypes?: string[];
    performancePeriod?: {
      minDuration?: number; // months
      maxDuration?: number; // months
    };
    competitionLevel?: "low" | "medium" | "high";
    historicalSuccessRate?: {
      min?: number; // percentage
      max?: number;
    };
    fundingInstruments?: string[];
    costSharingRequired?: boolean;
    securityClearanceRequired?: boolean;
  };

  // Premium filters (Business tier and above)
  premium?: {
    customKeywords?: string[];
    excludeKeywords?: string[];
    similarOpportunities?: string[]; // Find opportunities similar to these IDs
    predictedCompetition?: "low" | "medium" | "high";
    trendingCategories?: boolean;
    newAgencies?: boolean; // Agencies that recently started posting
    undervaluedOpportunities?: boolean; // Low competition, high value
    followUpRequired?: boolean; // Opportunities requiring follow-up actions
  };
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: AdvancedSearchFilters;
  alertEnabled: boolean;
  alertFrequency: "daily" | "weekly" | "monthly";
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchAlert {
  id: string;
  userId: string;
  savedSearchId: string;
  lastSent?: Date;
  isActive: boolean;
  newOpportunitiesFound: number;
  emailSent: boolean;
}

export class AdvancedSearchEngine {
  // Enhanced search with advanced filters
  static async executeAdvancedSearch(
    filters: AdvancedSearchFilters,
    user: User,
    pagination: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<{
    opportunities: Opportunity[];
    totalCount: number;
    facets: SearchFacets;
    recommendations: string[];
    searchId: string;
  }> {
    // Convert advanced filters to standard search params
    const searchParams = this.convertToSearchParams(filters);

    // Apply user-specific enhancements based on subscription tier
    const enhancedParams = this.enhanceSearchForUser(searchParams, user);

    // Execute the search (this would use the unified opportunity service)
    // For now, we'll return a placeholder structure

    const searchId = this.generateSearchId();

    return {
      opportunities: [], // Would contain actual results
      totalCount: 0,
      facets: await this.generateSearchFacets(filters, user),
      recommendations: this.generateSearchRecommendations(filters, user),
      searchId,
    };
  }

  // Generate search facets for filtering
  static async generateSearchFacets(
    filters: AdvancedSearchFilters,
    user: User,
  ): Promise<SearchFacets> {
    return {
      agencies: {
        "Department of Defense": 156,
        "National Science Foundation": 89,
        "Department of Health and Human Services": 134,
        "Small Business Administration": 67,
        "Department of Energy": 45,
      },
      opportunityTypes: {
        Grant: 245,
        Contract: 189,
        "Cooperative Agreement": 78,
        Other: 34,
      },
      industries: {
        "Research & Development": 123,
        Healthcare: 98,
        Technology: 87,
        Education: 76,
        Infrastructure: 65,
      },
      amounts: {
        "Under $100K": 167,
        "$100K - $500K": 134,
        "$500K - $1M": 89,
        "$1M - $10M": 67,
        "Over $10M": 23,
      },
      setAsides:
        user.subscription?.tierId !== "free"
          ? {
              "8(a)": 45,
              HubZone: 34,
              SDVOSB: 28,
              WOSB: 23,
              "Small Business": 156,
            }
          : undefined,
    };
  }

  // Generate search recommendations based on filters and user history
  static generateSearchRecommendations(
    filters: AdvancedSearchFilters,
    user: User,
  ): string[] {
    const recommendations: string[] = [];

    // Basic recommendations for all users
    if (!filters.basic.query) {
      recommendations.push("Try adding keywords to narrow your search");
    }

    if (
      !filters.basic.opportunityTypes ||
      filters.basic.opportunityTypes.length === 0
    ) {
      recommendations.push(
        "Filter by opportunity type for more relevant results",
      );
    }

    // Advanced recommendations for premium users
    if (
      user.subscription &&
      ["business", "enterprise"].includes(user.subscription.tierId)
    ) {
      if (!filters.premium?.customKeywords) {
        recommendations.push(
          "Use custom keywords to find highly specific opportunities",
        );
      }

      if (!filters.premium?.similarOpportunities) {
        recommendations.push(
          "Find similar opportunities based on your successful applications",
        );
      }

      if (!filters.premium?.predictedCompetition) {
        recommendations.push(
          "Enable competition prediction to focus on winnable opportunities",
        );
      }
    }

    return recommendations;
  }

  // Save search for future use and alerts
  static async saveSearch(
    userId: string,
    name: string,
    filters: AdvancedSearchFilters,
    alertSettings?: {
      enabled: boolean;
      frequency: "daily" | "weekly" | "monthly";
    },
  ): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: this.generateSearchId(),
      userId,
      name,
      filters,
      alertEnabled: alertSettings?.enabled || false,
      alertFrequency: alertSettings?.frequency || "weekly",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // This would save to database
    console.log("Saving search:", savedSearch);

    return savedSearch;
  }

  // Get user's saved searches
  static async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    // This would query from database
    return [];
  }

  // Update saved search
  static async updateSavedSearch(
    searchId: string,
    updates: Partial<
      Pick<SavedSearch, "name" | "filters" | "alertEnabled" | "alertFrequency">
    >,
  ): Promise<SavedSearch | null> {
    // This would update in database
    console.log("Updating search:", searchId, updates);
    return null;
  }

  // Delete saved search
  static async deleteSavedSearch(searchId: string): Promise<boolean> {
    // This would delete from database
    console.log("Deleting search:", searchId);
    return true;
  }

  // Execute saved search
  static async executeSavedSearch(
    searchId: string,
    user: User,
  ): Promise<{
    opportunities: Opportunity[];
    totalCount: number;
    newSinceLastRun: number;
  }> {
    // This would load the saved search and execute it
    return {
      opportunities: [],
      totalCount: 0,
      newSinceLastRun: 0,
    };
  }

  // Smart search suggestions based on user activity
  static async generateSmartSuggestions(user: User): Promise<{
    trendingKeywords: string[];
    suggestedFilters: Partial<AdvancedSearchFilters>;
    personalizedOpportunities: Opportunity[];
    industryInsights: {
      industry: string;
      trend: "increasing" | "decreasing" | "stable";
      averageAward: number;
      competitionLevel: "low" | "medium" | "high";
    }[];
  }> {
    // This would analyze user behavior and generate personalized suggestions
    return {
      trendingKeywords: [
        "artificial intelligence",
        "cybersecurity",
        "clean energy",
        "supply chain",
        "digital transformation",
      ],
      suggestedFilters: {
        basic: {
          opportunityTypes: ["grant", "contract"],
          amountRange: { min: 100000, max: 1000000 },
        },
        advanced:
          user.subscription?.tierId !== "free"
            ? {
                industryCategories: ["54", "51"], // Professional services, Information
                competitionLevel: "low",
              }
            : undefined,
      },
      personalizedOpportunities: [], // Based on user's industry and past searches
      industryInsights: [
        {
          industry: "Cybersecurity",
          trend: "increasing",
          averageAward: 750000,
          competitionLevel: "medium",
        },
        {
          industry: "Clean Energy",
          trend: "increasing",
          averageAward: 2500000,
          competitionLevel: "high",
        },
      ],
    };
  }

  // Convert advanced filters to standard search parameters
  private static convertToSearchParams(
    filters: AdvancedSearchFilters,
  ): OpportunitySearchParams {
    const params: OpportunitySearchParams = {};

    // Basic filters
    if (filters.basic.query) params.query = filters.basic.query;
    if (filters.basic.opportunityTypes)
      params.type = filters.basic.opportunityTypes as any[];
    if (filters.basic.agencies) params.agencies = filters.basic.agencies;
    if (filters.basic.status) params.status = filters.basic.status;
    if (filters.basic.amountRange) {
      params.amountMin = filters.basic.amountRange.min;
      params.amountMax = filters.basic.amountRange.max;
    }
    if (filters.basic.dateRange) {
      params.postedAfter = filters.basic.dateRange.postedAfter;
      params.postedBefore = filters.basic.dateRange.postedBefore;
      params.deadlineAfter = filters.basic.dateRange.deadlineAfter;
      params.deadlineBefore = filters.basic.dateRange.deadlineBefore;
    }
    if (filters.basic.location) {
      params.state = filters.basic.location.states;
      params.city = filters.basic.location.cities;
    }

    // Advanced filters
    if (filters.advanced) {
      if (filters.advanced.industryCategories) {
        params.industryCategories = filters.advanced.industryCategories;
      }
      if (filters.advanced.businessSize) {
        params.businessSize = filters.advanced.businessSize;
      }
    }

    return params;
  }

  // Enhance search parameters based on user's subscription tier
  private static enhanceSearchForUser(
    params: OpportunitySearchParams,
    user: User,
  ): OpportunitySearchParams {
    const enhanced = { ...params };

    // Premium features for Business+ tiers
    if (
      user.subscription &&
      ["business", "enterprise"].includes(user.subscription.tierId)
    ) {
      // Add AI-enhanced search scoring
      enhanced.sortBy = "relevance";

      // Add user-specific preferences if available
      if (user.preferences.industryAlerts.length > 0) {
        enhanced.industryCategories = [
          ...(enhanced.industryCategories || []),
          ...user.preferences.industryAlerts,
        ];
      }
    }

    return enhanced;
  }

  // Generate unique search ID
  private static generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Search facets interface
export interface SearchFacets {
  agencies: Record<string, number>;
  opportunityTypes: Record<string, number>;
  industries: Record<string, number>;
  amounts: Record<string, number>;
  setAsides?: Record<string, number>;
  deadlines?: Record<string, number>;
  locations?: Record<string, number>;
}

// Export convenience functions
export const executeAdvancedSearch = AdvancedSearchEngine.executeAdvancedSearch;
export const saveSearch = AdvancedSearchEngine.saveSearch;
export const generateSmartSuggestions =
  AdvancedSearchEngine.generateSmartSuggestions;
