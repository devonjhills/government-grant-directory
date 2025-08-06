import { USAspendingAward, USAspendingResponse, OpportunitySearchParams, Opportunity } from '@/types';
import { dataEnrichment } from '@/app/lib/data-standardization';
import { cache, CacheKeys, CacheConfigs, memoize } from '@/app/lib/cache';
import { performanceMonitor } from '@/app/lib/performance';

// USAspending.gov API configuration
const USASPENDING_API_BASE_URL = 'https://api.usaspending.gov/api/v2';

interface USASpendingSearchParams {
  filters?: {
    time_period?: Array<{
      start_date: string;
      end_date: string;
    }>;
    agencies?: Array<{
      type: string;
      tier: string;
      name?: string;
      toptier_name?: string;
    }>;
    award_type_codes?: string[];
    award_amounts?: Array<{
      lower_bound?: number;
      upper_bound?: number;
    }>;
    naics_codes?: string[];
    place_of_performance_scope?: string;
    place_of_performance_locations?: Array<{
      country: string;
      state?: string;
      city?: string;
    }>;
    recipient_search_text?: string[];
    recipient_type_names?: string[];
    keyword?: string;
  };
  fields?: string[];
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export class USASpendingService {
  private baseURL: string;

  constructor() {
    this.baseURL = USASPENDING_API_BASE_URL;
  }

  // Search awards from USAspending.gov
  async searchAwards(params: OpportunitySearchParams = {}): Promise<{
    opportunities: Opportunity[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const usaParams = this.convertToUSASpendingParams(params);
      const cacheKey = CacheKeys.opportunitySearch({ ...params, source: 'usaspending' });
      
      // Try cache first
      const cached = cache.get(cacheKey) as {
        opportunities: Opportunity[];
        totalCount: number;
        hasMore: boolean;
      } | undefined;
      if (cached) return cached;

      const response = await this.makeRequest('/search/spending_by_award/', {
        method: 'POST',
        body: JSON.stringify(usaParams),
      });
      
      if (!response.ok) {
        throw new Error(`USAspending API error: ${response.status} ${response.statusText}`);
      }

      const data: USAspendingResponse = await response.json();
      
      // Standardize the awards
      const standardizedOpportunities = await Promise.all(
        data.results.map(async (award) => {
          return dataEnrichment.standardizeOpportunity(award, 'usaspending.gov');
        })
      );

      const result = {
        opportunities: standardizedOpportunities,
        totalCount: data.page_metadata.count || standardizedOpportunities.length,
        hasMore: !!data.page_metadata.next,
      };

      // Cache the result
      cache.set(cacheKey, result, CacheConfigs.search);
      
      return result;
    } catch (error) {
      console.error('USAspending search error:', error);
      return {
        opportunities: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  }

  // Get award details from USAspending.gov
  async getAwardDetails(awardId: string): Promise<Opportunity | null> {
    try {
      const cacheKey = CacheKeys.opportunity(`usaspending-${awardId}`);
      
      // Try cache first
      const cached = cache.get<Opportunity>(cacheKey);
      if (cached) return cached;

      const response = await this.makeRequest(`/awards/${awardId}/`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`USAspending API error: ${response.status}`);
      }

      const awardData = await response.json();
      const standardized = dataEnrichment.standardizeOpportunity(awardData, 'usaspending.gov');
      
      // Cache the result
      cache.set(cacheKey, standardized, CacheConfigs.stable);
      
      return standardized;
    } catch (error) {
      console.error('USAspending details error:', error);
      return null;
    }
  }

  // Get spending trends by agency
  async getSpendingTrends(agencyName?: string, timeRange = '1year'): Promise<{
    agency: string;
    totalSpending: number;
    awardCount: number;
    trends: Array<{ period: string; amount: number; count: number }>;
  }[]> {
    try {
      const params = this.buildTrendsParams(agencyName, timeRange);
      
      const response = await this.makeRequest('/search/spending_by_award/', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`USAspending trends API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and aggregate the data for trends
      return this.processTrendsData(data);
    } catch (error) {
      console.error('USAspending trends error:', error);
      return [];
    }
  }

  // Get high-value contracts (over $1M)
  async getHighValueContracts(limit = 20): Promise<Opportunity[]> {
    return this.searchAwards({
      amountMin: 1000000,
      type: ['contract', 'procurement'],
      limit,
      sortBy: 'amount',
      sortOrder: 'desc',
    }).then(result => result.opportunities);
  }

  // Get awards by agency
  async getAwardsByAgency(agencyCode: string, limit = 20): Promise<Opportunity[]> {
    return this.searchAwards({
      agencies: [agencyCode],
      limit,
      sortBy: 'posted_date',
      sortOrder: 'desc',
    }).then(result => result.opportunities);
  }

  // Get recent awards
  async getRecentAwards(limit = 20): Promise<Opportunity[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.searchAwards({
      postedAfter: thirtyDaysAgo.toISOString().split('T')[0],
      limit,
      sortBy: 'posted_date',
      sortOrder: 'desc',
    }).then(result => result.opportunities);
  }

  // Convert our search parameters to USAspending parameters
  private convertToUSASpendingParams(params: OpportunitySearchParams): USASpendingSearchParams {
    const usaParams: USASpendingSearchParams = {
      filters: {},
      fields: [
        'Award', 
        'generated_unique_award_id',
        'award_id_piid',
        'award_latest_action_date',
        'award_amount',
        'awarding_agency_name',
        'description',
        'recipient_name',
        'award_type',
        'naics_code',
        'naics_description',
        'place_of_performance_city',
        'place_of_performance_state',
        'period_of_performance_start_date',
        'period_of_performance_current_end_date',
      ],
      limit: params.limit || 20,
      page: params.page || 1,
    };

    // Time period filter
    if (params.postedAfter || params.postedBefore) {
      const startDate = params.postedAfter || '2020-01-01';
      const endDate = params.postedBefore || new Date().toISOString().split('T')[0];
      
      usaParams.filters!.time_period = [{
        start_date: startDate,
        end_date: endDate,
      }];
    }

    // Agency filter
    if (params.agencies && params.agencies.length > 0) {
      usaParams.filters!.agencies = params.agencies.map(agency => ({
        type: 'awarding',
        tier: 'toptier',
        name: agency,
      }));
    }

    // Award type filter
    if (params.type && params.type.length > 0) {
      const awardTypeCodes: string[] = [];
      params.type.forEach(type => {
        switch (type) {
          case 'contract':
            awardTypeCodes.push(...['A', 'B', 'C', 'D']); // Contract types
            break;
          case 'grant':
            awardTypeCodes.push(...['02', '03', '04', '05']); // Grant types
            break;
          case 'procurement':
            awardTypeCodes.push(...['A', 'B', 'C', 'D']);
            break;
        }
      });
      if (awardTypeCodes.length > 0) {
        usaParams.filters!.award_type_codes = awardTypeCodes;
      }
    }

    // Amount filter
    if (params.amountMin !== undefined || params.amountMax !== undefined) {
      usaParams.filters!.award_amounts = [{
        lower_bound: params.amountMin,
        upper_bound: params.amountMax,
      }];
    }

    // NAICS codes filter
    if (params.industryCategories && params.industryCategories.length > 0) {
      const naicsCodes = params.industryCategories.filter(cat => /^\d{2,6}$/.test(cat));
      if (naicsCodes.length > 0) {
        usaParams.filters!.naics_codes = naicsCodes;
      }
    }

    // Location filter
    if (params.state && params.state.length > 0) {
      usaParams.filters!.place_of_performance_locations = params.state.map(state => ({
        country: 'USA',
        state: state,
      }));
    }

    // Keyword search
    if (params.query) {
      usaParams.filters!.keyword = params.query;
    }

    // Sorting
    if (params.sortBy) {
      const sortMap: Record<string, string> = {
        'amount': 'Award Amount',
        'deadline': 'Award Date',
        'posted_date': 'Award Date',
        'agency': 'Awarding Agency',
        'relevance': 'Award Amount', // Default fallback
      };
      usaParams.sort = sortMap[params.sortBy] || 'Award Amount';
      usaParams.order = params.sortOrder || 'desc';
    }

    return usaParams;
  }

  // Build parameters for spending trends
  private buildTrendsParams(agencyName?: string, timeRange = '1year'): USASpendingSearchParams {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '2years':
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
      case '5years':
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const params: USASpendingSearchParams = {
      filters: {
        time_period: [{
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }],
      },
      fields: ['Award', 'awarding_agency_name', 'award_amount', 'award_latest_action_date'],
      limit: 1000, // Get more data for trend analysis
    };

    if (agencyName) {
      params.filters!.agencies = [{
        type: 'awarding',
        tier: 'toptier',
        name: agencyName,
      }];
    }

    return params;
  }

  // Process trends data from USAspending response
  private processTrendsData(data: any): Array<{
    agency: string;
    totalSpending: number;
    awardCount: number;
    trends: Array<{ period: string; amount: number; count: number }>;
  }> {
    // This would process the raw data into trend information
    // For now, return empty array as placeholder
    return [];
  }

  // Make HTTP request to USAspending API
  private async makeRequest(endpoint: string, options: {
    method: 'GET' | 'POST';
    body?: string;
    headers?: Record<string, string>;
  }): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Government-Grant-Directory/1.0',
      ...options.headers,
    };

    return fetch(url, {
      method: options.method,
      headers,
      body: options.body,
    });
  }

  // Health check for USAspending API
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string }> {
    try {
      const response = await this.makeRequest('/awards/', {
        method: 'GET',
      });
      
      return {
        status: response.ok ? 'ok' : 'error',
        message: response.ok ? 'USAspending API is accessible' : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Singleton instance
export const usaSpendingService = new USASpendingService();

// Memoized search function for better performance
export const searchUSASpendingAwards = memoize(
  (params: OpportunitySearchParams) => usaSpendingService.searchAwards(params),
  {
    ttl: CacheConfigs.search.ttl,
    keyFn: (params) => `usaspending-search-${JSON.stringify(params)}`,
  }
);