// Base interface for all funding/procurement opportunities
export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  description: string;
  eligibilityCriteria: string;
  deadline: string; // ISO date format e.g., 'YYYY-MM-DD'
  amount: number; // Or a range/text if specific number isn't always available
  linkToApply: string;
  sourceAPI: string; // e.g., 'Grants.gov', 'USAspending.gov', etc.
  opportunityNumber: string;
  opportunityStatus: string; // e.g., 'posted', 'forecasted', 'closed', 'active', 'awarded'
  postedDate: string; // Date opportunity was posted, ISO format
  categories: string[]; // Standardized categories across all sources
  type:
    | "grant"
    | "contract"
    | "procurement"
    | "cooperative_agreement"
    | "other";

  // Enhanced fields (common to all opportunity types)
  awardFloor?: number;
  awardCeiling?: number;
  expectedAwards?: number;
  applicantTypes?: string[];
  agencyCode?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    office?: string;
  };
  additionalInfo?: string;
  version?: string;

  // Location and jurisdiction
  jurisdiction?: "federal" | "state" | "local";
  state?: string;
  city?: string;

  // Standardized enrichment fields
  industryCategories?: string[]; // NAICS codes or industry classifications
  businessSize?: string[]; // 'small', 'large', 'minority-owned', 'veteran-owned', etc.
  performancePeriod?: {
    start?: string;
    end?: string;
    duration?: string;
  };

  // Grant-specific fields
  fundingInstruments?: string[];
  fundingActivityCategories?: string[];
  cfda?: string[];
  costSharing?: string;

  // Contract/procurement-specific fields
  contractType?: string; // 'fixed-price', 'cost-plus', 'time-and-materials', etc.
  setAsideType?: string; // '8A', 'HubZone', 'SDVOSB', 'WOSB', etc.
  placeOfPerformance?: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
  };
  solicitationType?: string; // 'RFP', 'IFB', 'RFQ', 'Sources Sought', etc.
  securityClearance?: string;

  // Search and discovery enhancement
  keywords?: string[];
  searchScore?: number; // For relevance ranking
  lastUpdated?: string;
  isFeature?: boolean; // For premium/featured listings
}

// Backward compatibility alias
export interface Grant extends Opportunity {
  type: "grant";
}

export interface GrantsGovGrant {
  id: string; // e.g., "219999"
  number: string; // e.g., "TEST-ABC-20231011-OPP1"
  title: string;
  agencyCode: string;
  agency: string;
  openDate: string | null; // e.g., "10/11/2023"
  closeDate: string | null;
  oppStatus: string; // e.g., "posted"
  docType: string; // e.g., "synopsis"
  alnist: string[]; // e.g., ["93.223"]
}

export interface GrantsGovResponseData {
  searchParams: any; // Or define more strictly if needed
  hitCount: number;
  startRecord: number;
  oppHits: GrantsGovGrant[];
  // Add other fields from 'data' object like oppStatusOptions, eligibilities etc. if needed
}

export interface GrantsGovResponse {
  errorcode: number;
  msg: string;
  token: string; // Or might not be needed by the app
  data: GrantsGovResponseData;
}

// USAspending.gov API interfaces
export interface USAspendingAward {
  Award: {
    generated_unique_award_id: string;
    award_id_piid?: string;
    award_latest_action_date?: string;
    award_amount?: number;
    awarding_agency_name: string;
    description?: string;
    recipient_name?: string;
    award_type: string;
    contract_award_unique_key?: string;
    naics_code?: string;
    naics_description?: string;
    place_of_performance_city?: string;
    place_of_performance_state?: string;
    period_of_performance_start_date?: string;
    period_of_performance_current_end_date?: string;
  };
}

export interface USAspendingResponse {
  results: USAspendingAward[];
  page_metadata: {
    page: number;
    count: number;
    next?: string;
    previous?: string;
  };
}

// Unified search parameters for all APIs
export interface OpportunitySearchParams {
  query?: string;
  type?: (
    | "grant"
    | "contract"
    | "procurement"
    | "cooperative_agreement"
    | "other"
  )[];
  agencies?: string[];
  jurisdiction?: ("federal" | "state" | "local")[];
  state?: string[];
  city?: string[];
  categories?: string[];
  industryCategories?: string[]; // NAICS codes
  businessSize?: string[];
  amountMin?: number;
  amountMax?: number;
  postedAfter?: string; // ISO date
  postedBefore?: string; // ISO date
  deadlineAfter?: string; // ISO date
  deadlineBefore?: string; // ISO date
  status?: string[];
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "deadline" | "amount" | "posted_date";
  sortOrder?: "asc" | "desc";
}

export interface OpportunitySearchResponse {
  opportunities: Opportunity[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  searchParams: OpportunitySearchParams;
}
