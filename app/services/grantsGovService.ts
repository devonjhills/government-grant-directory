import type { Grant, GrantsGovResponse, GrantsGovGrant } from "../../types";
import sanitizeHtmlLib from 'sanitize-html';

// Use our own API routes instead of directly calling the external API
const API_BASE_URL = "/api/grants";

// Private helper function to map Grants.gov oppHit to our Grant interface
function _mapOppHitToGrant(apiGrant: GrantsGovGrant): Grant {
  const categories = (apiGrant.keywords && apiGrant.keywords.length > 0) 
    ? apiGrant.keywords 
    : (apiGrant.cfdaNumbers || []);

  return {
    id: apiGrant.opportunityId,
    title: apiGrant.opportunityTitle,
    agency: apiGrant.agencyName,
    description: sanitizeHtmlContent(apiGrant.description || `Synopsis for ${apiGrant.opportunityTitle}. More details available.`),
    eligibilityCriteria: apiGrant.eligibleApplicants?.join(", ") || "Varies; see full announcement.",
    deadline: apiGrant.closeDate || "N/A",
    amount: apiGrant.awardCeiling ? parseInt(apiGrant.awardCeiling, 10) : 0,
    linkToApply: apiGrant.link || `https://www.grants.gov/search-results-detail/${apiGrant.opportunityId}`,
    sourceAPI: "Grants.gov",
    opportunityNumber: apiGrant.opportunityNumber,
    opportunityStatus: apiGrant.oppStatus || "N/A",
    postedDate: apiGrant.postDate || "N/A",
    categories: categories,
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
function _mapFetchedOpportunityToGrant(detailData: any): Grant {
  // detailData is assumed to be the `data` object from the API response,
  // as prepared by getGrantDetails (apiResponse.data || apiResponse)
  const grantData = detailData; 
  const synopsisData = grantData?.synopsis;

  const eligibilityCriteria = Array.isArray(synopsisData?.eligibleApplicants)
    ? synopsisData.eligibleApplicants.join(", ")
    : "Not specified";

  let categories: string[] = ["N/A"];
  if (Array.isArray(synopsisData?.keywords) && synopsisData.keywords.length > 0) {
    categories = synopsisData.keywords;
  } else if (grantData?.fundingInstrumentType?.[0]?.description) {
    categories = [grantData.fundingInstrumentType[0].description];
  }
  
  const opportunityStatus = grantData?.opportunityCategory?.description || synopsisData?.instrumentType || "N/A";

  return {
    id: grantData?.opportunityId?.toString() || "N/A",
    title: grantData?.opportunityTitle || "N/A",
    agency: grantData?.owningAgencyName || synopsisData?.agencyName || "N/A",
    description: sanitizeHtmlContent(synopsisData?.description || "No detailed description available."),
    eligibilityCriteria: eligibilityCriteria,
    deadline: synopsisData?.closeDate || "N/A",
    amount: synopsisData?.awardCeiling ? parseInt(synopsisData.awardCeiling, 10) : 0,
    linkToApply: synopsisData?.link || `https://www.grants.gov/search-results-detail/${grantData?.opportunityId}`,
    sourceAPI: "Grants.gov", // This field is constant for this service
    opportunityNumber: grantData?.opportunityNumber || "N/A",
    opportunityStatus: opportunityStatus,
    postedDate: synopsisData?.postDate || "N/A",
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
      body: JSON.stringify({ opportunityId: opportunityId }), // Ensure this is the correct ID format
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

    const apiResponse = await response.json(); // Assuming this also has a structure like { data: {...} } or similar

    // The actual structure of apiResponse.data for fetchOpportunity needs to be known.
    // For now, assuming apiResponse directly contains the grant details or apiResponse.data does.
    // If fetchOpportunity returns an array or a different structure, this needs adjustment.
    if (apiResponse && (apiResponse.data || apiResponse.opportunityId)) {
      // Check if there's data
      const grantData = apiResponse.data || apiResponse; // Adjust based on actual response
      return _mapFetchedOpportunityToGrant(grantData);
    } else {
      console.warn(`No data found for opportunity ID: ${opportunityId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error in getGrantDetails for ID ${opportunityId}:`, error);
    return null; // Return null on error
  }
}
