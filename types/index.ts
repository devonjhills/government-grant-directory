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
}

export interface GrantsGovGrant {
  opportunityId: string; 
  opportunityNumber: string; 
  opportunityTitle: string; 
  agencyName: string; 
  postDate: string | null; 
  closeDate: string | null; 
  oppStatus?: string; 
  cfdaNumbers: string[]; 
  description?: string;
  awardCeiling?: string; 
  eligibleApplicants?: string[];
  link?: string;
  keywords?: string[];
  fundingInstrumentType?: string;
  opportunityCategory?: string;
  // Removed agencyCode and docType as per instructions
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
