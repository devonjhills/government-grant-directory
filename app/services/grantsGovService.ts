import type { Grant, GrantsGovResponse, GrantsGovGrant } from "../../types";
import sanitizeHtmlLib from 'sanitize-html';

// Use our own API routes instead of directly calling the external API
const API_BASE_URL = "/api/grants";

// Private helper function to map Grants.gov oppHit to our Grant interface
function _mapOppHitToGrant(apiGrant: GrantsGovGrant): Grant {
  return {
    id: apiGrant.id,
    title: apiGrant.title,
    agency: apiGrant.agencyName,
    description: `Synopsis for ${apiGrant.title}. More details available.`,
    eligibilityCriteria: "Varies; see full announcement.",
    deadline: apiGrant.closeDate || "N/A",
    amount: 0, 
    linkToApply: `https://www.grants.gov/search-results-detail/${apiGrant.id}`,
    sourceAPI: "Grants.gov",
    opportunityNumber: apiGrant.number,
    opportunityStatus: apiGrant.oppStatus,
    postedDate: apiGrant.openDate || "N/A",
    categories: apiGrant.alnist || [],
  };
}

// Search for grants
export async function searchGrants(searchParams: {
  keyword?: string;
  rows?: number;
  startRecordNum?: number;
  oppStatuses?: string; // e.g., "posted|forecasted"
  // Add other params like eligibilities, agencies, fundingCategories, aln as needed
}): Promise<{ grants: Grant[]; totalRecords: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
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

    const apiResponse: GrantsGovResponse = await response.json();

    if (apiResponse.errorcode !== 0 || !apiResponse.data) {
      console.error(
        "Grants.gov API Logic Error:",
        apiResponse.msg,
        apiResponse.errorcode
      );
      throw new Error(
        `API returned an error: ${apiResponse.msg} (code: ${apiResponse.errorcode})`
      );
    }

    const mappedGrants = apiResponse.data.oppHits.map(_mapOppHitToGrant);

    return {
      grants: mappedGrants,
      totalRecords: apiResponse.data.hitCount,
    };
  } catch (error) {
    console.error("Error in searchGrants:", error);
    return { grants: [], totalRecords: 0 }; // Return empty on error
  }
}

// Utility function to sanitize HTML content
function sanitizeHtmlContent(htmlString: string): string {
  if (!htmlString) return "";
  return sanitizeHtmlLib(htmlString, {
    allowedTags: ['p', 'ul', 'ol', 'li', 'strong', 'em', 'br'], 
    allowedAttributes: {} // No attributes allowed
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
    synopsis?.applicantTypes?.map((at: any) => at.description).join(", ") || "Not specified";

  const fundingActivityCategories = synopsis?.fundingActivityCategories?.map((fc: any) => fc.description) || [];
  const fundingInstruments = synopsis?.fundingInstruments?.map((fi: any) => fi.description) || [];
  let categories = [...fundingActivityCategories, ...fundingInstruments];
  if (categories.length === 0) {
    categories = ["N/A"];
  }

  return {
    id: grantData?.opportunityId?.toString() || "N/A",
    title: grantData?.opportunityTitle || "N/A",
    agency: synopsis?.agencyName || grantData?.owningAgencyCode || "N/A",
    description: sanitizeHtmlContent(synopsis?.synopsisDesc || "No detailed description available."),
    eligibilityCriteria: eligibilityCriteria,
    deadline: synopsis?.closeDate || synopsis?.responseDateDesc || "N/A", // Prioritize closeDate as per sample
    amount: synopsis?.awardCeiling ? parseInt(synopsis.awardCeiling, 10) : 0,
    // Assuming no direct synopsis.link for now, using constructed URL
    linkToApply: `https://www.grants.gov/search-results-detail/${grantData?.opportunityId}`,
    sourceAPI: "Grants.gov",
    opportunityNumber: grantData?.opportunityNumber || "N/A",
    opportunityStatus: grantData?.opportunityCategory?.description || "N/A",
    postedDate: synopsis?.postingDate || "N/A",
    categories: categories,
  };
}

// Get detailed information for a specific grant
export async function getGrantDetails(
  opportunityId: string
): Promise<Grant | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/details`, {
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
      console.warn(`No data found or error in API response for opportunity ID: ${opportunityId}`, apiResponse);
      return null;
    }
  } catch (error) {
    console.error(`Error in getGrantDetails for ID ${opportunityId}:`, error);
    return null; 
  }
}
