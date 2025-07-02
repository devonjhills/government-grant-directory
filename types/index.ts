export interface Grant {
  id: string;
  title: string;
  agency: string;
  description: string;
  eligibilityCriteria: string;
  deadline: string; // Consider ISO date format e.g., 'YYYY-MM-DD'
  amount: number; // Or a range/text if specific number isn't always available
  linkToApply: string;
  sourceAPI: string; // e.g., 'Grants.gov' or 'StatePortalName'
  opportunityNumber: string;
  opportunityStatus: string; // e.g., 'posted', 'forecasted', 'closed'
  postedDate: string; // Date grant was posted, ISO format
  categories: string[]; // Array of categories or keywords
  // Enhanced fields
  awardFloor?: number;
  awardCeiling?: number;
  expectedAwards?: number;
  fundingInstruments?: string[];
  fundingActivityCategories?: string[];
  applicantTypes?: string[];
  agencyCode?: string;
  cfda?: string[];
  costSharing?: string;
  grantorContactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  additionalInfo?: string;
  version?: string;
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
