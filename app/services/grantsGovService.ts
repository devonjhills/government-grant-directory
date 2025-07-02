import type { Grant, GrantsGovResponse, GrantsGovGrant } from "../../types";
import { mapGrantsGovGrantToGrant } from "../lib/grant-mapping"; // Import the moved function
import sanitizeHtmlLib from "sanitize-html";

const ABSOLUTE_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
// Use our own API routes instead of directly calling the external API
const API_BASE_URL = "/api/grants"; // This might become redundant or used differently

// Search for grants
export async function searchGrants(searchParams: {
  keyword?: string;
  rows?: number;
  startRecordNum?: number;
  oppStatuses?: string; // e.g., "posted|forecasted"
  // Add other params like eligibilities, agencies, fundingCategories, aln as needed
}): Promise<{ grants: Grant[]; totalRecords: number }> {
  try {
    const response = await fetch(`${ABSOLUTE_APP_URL}/api/grants/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grants.gov API Error:", response.status, errorText);
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    // The /api/grants/search route now returns data in the expected format: { grants: Grant[], totalRecords: number }
    // It also handles Grants.gov specific API errors, so we don't need to check for apiResponse.errorcode here.
    // The response.json() will be the actual data structure we need or an error structure if the API route failed.
    const mappedData: { grants: Grant[]; totalRecords: number } = await response.json();
    
    // If response.ok was true, mappedData is { grants, totalRecords }.
    // If response.ok was false, the error would have been caught above and this part wouldn't be reached.
    // If mappedData contains an error structure from our API route (e.g. { error: "message" }),
    // this will be passed along. The calling function should be prepared for that or
    // this function could add another layer of checking if desired, but typically,
    // if response.ok is true, the body is the expected successful payload.
    return mappedData;

  } catch (error) {
    console.error("Error in searchGrants:", error);
    // The function signature expects { grants: Grant[]; totalRecords: number },
    // so we should return that structure even in case of an error caught here.
    return { grants: [], totalRecords: 0 }; // Return empty on error
  }
}

// Utility function to sanitize HTML content
function sanitizeHtmlContent(htmlString: string): string {
  if (!htmlString) return "";
  return sanitizeHtmlLib(htmlString, {
    allowedTags: ["p", "ul", "ol", "li", "strong", "em", "br"],
    allowedAttributes: {}, // No attributes allowed
  });
}

// Private helper function to map fetched opportunity details to our Grant interface
function _mapFetchedOpportunityToGrant(apiDetailResponse: any): Grant {
  const grantData = apiDetailResponse?.data;
  const synopsis = grantData?.synopsis;

  // If !grantData, it implies an issue with the API response structure or an error code.
  // getGrantDetails should ideally handle cases where grantData is not present based on error codes.
  // For now, we proceed assuming grantData might be null/undefined and rely on optional chaining and defaults.

  const eligibilityCriteria =
    synopsis?.applicantTypes?.map((at: any) => at.description).join(", ") ||
    "Not specified";

  const fundingActivityCategories =
    synopsis?.fundingActivityCategories?.map((fc: any) => fc.description) || [];
  const fundingInstruments =
    synopsis?.fundingInstruments?.map((fi: any) => fi.description) || [];
  let categories = [...fundingActivityCategories, ...fundingInstruments];
  if (categories.length === 0) {
    categories = ["N/A"];
  }

  // Amount parsing
  let parsedAmount = 0; // Default to 0
  const ceilingStr = synopsis?.awardCeiling?.toString();
  if (ceilingStr) {
    const cleanedCeilingStr = ceilingStr.replace(/,/g, ""); // Remove commas
    const num = parseInt(cleanedCeilingStr, 10);
    if (!isNaN(num)) {
      parsedAmount = num;
    }
  }

  // LinkToApply generation - Standardized based on user feedback
  let applyLink = "https://www.grants.gov"; // Default fallback
  // grantData is apiDetailResponse.data. The numeric ID is grantData.id as per fetchOpportunity sample.
  const numericIdFromApi = grantData?.id?.toString();

  if (
    numericIdFromApi &&
    numericIdFromApi.toLowerCase() !== "n/a" &&
    numericIdFromApi.toLowerCase() !== "undefined" &&
    /^[0-9]+$/.test(numericIdFromApi)
  ) {
    // Ensure it's purely numeric, as it's used in the URL path segment
    applyLink = `https://www.grants.gov/search-results-detail/${numericIdFromApi}`;
  }

  // Parse award floor
  let parsedFloor = 0;
  const floorStr = synopsis?.awardFloor?.toString();
  if (floorStr) {
    const cleanedFloorStr = floorStr.replace(/,/g, "");
    const num = parseInt(cleanedFloorStr, 10);
    if (!isNaN(num)) {
      parsedFloor = num;
    }
  }

  // Parse expected awards
  let expectedAwards = 0;
  const expectedStr = synopsis?.expectedAwards?.toString();
  if (expectedStr) {
    const num = parseInt(expectedStr, 10);
    if (!isNaN(num)) {
      expectedAwards = num;
    }
  }

  // Extract CFDA numbers
  const cfdaNumbers = synopsis?.cfdaNumbers?.map((cfda: any) => cfda.number) || [];

  // Extract contact information
  const grantorContactInfo = synopsis?.grantorContactInfo ? {
    name: synopsis.grantorContactInfo.contactName || undefined,
    email: synopsis.grantorContactInfo.contactEmail || undefined,
    phone: synopsis.grantorContactInfo.contactPhone || undefined,
  } : undefined;

  return {
    id: grantData?.opportunityId?.toString() || "N/A", // This is the main alphanumeric Opportunity ID
    title: grantData?.opportunityTitle || "N/A",
    agency: synopsis?.agencyName || grantData?.owningAgencyCode || "N/A",
    description: sanitizeHtmlContent(
      synopsis?.synopsisDesc || "No detailed description available."
    ),
    eligibilityCriteria: eligibilityCriteria,
    deadline: synopsis?.responseDate || synopsis?.responseDateStr || "N/A", // Use responseDate from detail API
    amount: parsedAmount,
    linkToApply: applyLink,
    sourceAPI: "Grants.gov",
    opportunityNumber: grantData?.opportunityNumber || "N/A",
    opportunityStatus: grantData?.opportunityCategory?.description || "N/A",
    postedDate: synopsis?.postingDate || "N/A",
    categories: categories,
    // Enhanced fields
    awardFloor: parsedFloor > 0 ? parsedFloor : undefined,
    awardCeiling: parsedAmount > 0 ? parsedAmount : undefined,
    expectedAwards: expectedAwards > 0 ? expectedAwards : undefined,
    fundingInstruments: fundingInstruments.length > 0 ? fundingInstruments : undefined,
    fundingActivityCategories: fundingActivityCategories.length > 0 ? fundingActivityCategories : undefined,
    applicantTypes: synopsis?.applicantTypes?.map((at: any) => at.description) || undefined,
    agencyCode: grantData?.owningAgencyCode || undefined,
    cfda: cfdaNumbers.length > 0 ? cfdaNumbers : undefined,
    costSharing: synopsis?.costSharingDescription || undefined,
    grantorContactInfo: grantorContactInfo,
    additionalInfo: sanitizeHtmlContent(synopsis?.additionalInformation || ""),
    version: synopsis?.version?.toString() || undefined,
  };
}

// Get detailed information for a specific grant
export async function getGrantDetails(
  opportunityId: string
): Promise<Grant | null> {
  try {
    const response = await fetch(`${ABSOLUTE_APP_URL}/api/grants/details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opportunityId: opportunityId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Grants.gov fetchOpportunity API Error:",
        response.status,
        errorText
      );
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const apiResponse = await response.json();

    // Check specifically for the 'data' object within the apiResponse
    if (apiResponse && apiResponse.data) {
      return _mapFetchedOpportunityToGrant(apiResponse); // Pass the whole response
    } else {
      // Handle cases where apiResponse.data is not present, or if there's an error code in apiResponse
      console.warn(
        `No data found or error in API response for opportunity ID: ${opportunityId}`,
        apiResponse
      );
      return null;
    }
  } catch (error) {
    console.error(`Error in getGrantDetails for ID ${opportunityId}:`, error);
    return null;
  }
}
