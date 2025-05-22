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
  id: string; // Matches 'id' from oppHits
  number: string; // Matches 'number' (opportunity number) from oppHits
  title: string; // Matches 'title' from oppHits
  agencyCode: string; // Matches 'agencyCode' from oppHits
  agencyName: string; // Matches 'agencyName' from oppHits
  openDate: string | null; // Matches 'openDate' from oppHits
  closeDate: string | null; // Matches 'closeDate' from oppHits (was 'dueDate' previously)
  oppStatus: string; // Matches 'oppStatus' from oppHits
  docType: string; // Matches 'docType' from oppHits
  alnist: string[]; // Matches 'alnist' (Array of ALN strings) from oppHits, assuming it's an array of strings.
  // Removed fields not directly in search2 oppHits:
  // description (will be minimal, fetched by getGrantDetails)
  // eligibilityCodes (not directly in oppHits, detailed in full record)
  // awardAmount (not in oppHits)
  // postDate (use openDate)
  // opportunityCategory (not directly in oppHits)
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
