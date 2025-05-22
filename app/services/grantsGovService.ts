import type { Grant, GrantsGovResponse, GrantsGovGrant } from '../../types';

const STAGING_API_URL = "https://api.staging.grants.gov/v1/api";

// Private helper function to map Grants.gov oppHit to our Grant interface
function _mapOppHitToGrant(apiGrant: GrantsGovGrant): Grant {
  return {
    id: apiGrant.id,
    title: apiGrant.title,
    agency: apiGrant.agencyName,
    description: `Synopsis for ${apiGrant.title}. More details available.`, // search2 has no description field
    eligibilityCriteria: 'Varies; see full announcement.', // search2 has no direct eligibility field
    deadline: apiGrant.closeDate || 'N/A', // Use closeDate from oppHits
    amount: 0, // search2 does not provide amount, default to 0 or fetch in details
    linkToApply: `https://www.grants.gov/search-results-detail/${apiGrant.id}`,
    sourceAPI: 'Grants.gov',
    opportunityNumber: apiGrant.number,
    opportunityStatus: apiGrant.oppStatus,
    postedDate: apiGrant.openDate || 'N/A', // Use openDate from oppHits
    categories: apiGrant.alnist || [], // Assuming alnist can serve as categories for search results
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
    const response = await fetch(`${STAGING_API_URL}/search2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grants.gov API Error:', response.status, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const apiResponse: GrantsGovResponse = await response.json();

    if (apiResponse.errorcode !== 0 || !apiResponse.data) {
        console.error('Grants.gov API Logic Error:', apiResponse.msg, apiResponse.errorcode);
        throw new Error(`API returned an error: ${apiResponse.msg} (code: ${apiResponse.errorcode})`);
    }
    
    const mappedGrants = apiResponse.data.oppHits.map(_mapOppHitToGrant);
    
    return {
      grants: mappedGrants,
      totalRecords: apiResponse.data.hitCount,
    };
  } catch (error) {
    console.error('Error in searchGrants:', error);
    return { grants: [], totalRecords: 0 }; // Return empty on error
  }
}

// Private helper function to map fetched opportunity details to our Grant interface
// Note: The exact structure of detailData needs to be confirmed from fetchOpportunity API documentation
function _mapFetchedOpportunityToGrant(detailData: any): Grant {
  // Assuming detailData is the 'data' object from fetchOpportunity response
  // This mapping is speculative and needs to be verified with actual API response structure
  const synopsis = detailData.synopsis || {};
  const eligibility = synopsis.applicantTypes?.map((at: any) => at.description).join(', ') || 'Not specified';
  const categories = [
    ...(synopsis.fundingInstruments?.map((fi: any) => fi.description) || []),
    ...(synopsis.fundingActivityCategories?.map((fc: any) => fc.description) || [])
  ];

  return {
    id: detailData.opportunityId?.toString() || detailData.id?.toString() || 'N/A', // Ensure ID is a string
    title: detailData.opportunityTitle || synopsis.opportunityTitle || 'N/A',
    agency: synopsis.agencyName || detailData.owningAgencyCode || 'N/A',
    description: synopsis.synopsisDesc || 'No detailed description available.', // Clean HTML if necessary
    eligibilityCriteria: eligibility,
    deadline: synopsis.responseDateDesc || synopsis.estResponseDate || detailData.closeDate || 'N/A',
    amount: synopsis.awardCeiling ? parseInt(synopsis.awardCeiling, 10) : (detailData.awardAmount || 0),
    linkToApply: `https://www.grants.gov/search-results-detail/${detailData.opportunityId || detailData.id}`,
    sourceAPI: 'Grants.gov',
    opportunityNumber: detailData.opportunityNumber || 'N/A',
    opportunityStatus: detailData.opportunityStatus || synopsis.opportunityStatus || 'N/A',
    postedDate: synopsis.postingDate || detailData.postDate || 'N/A',
    categories: categories.length > 0 ? categories : ['N/A'],
  };
}

// Get detailed information for a specific grant
export async function getGrantDetails(opportunityId: string): Promise<Grant | null> {
  try {
    const response = await fetch(`${STAGING_API_URL}/fetchOpportunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opportunityId: opportunityId }), // Ensure this is the correct ID format
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grants.gov fetchOpportunity API Error:', response.status, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const apiResponse = await response.json(); // Assuming this also has a structure like { data: {...} } or similar

    // The actual structure of apiResponse.data for fetchOpportunity needs to be known.
    // For now, assuming apiResponse directly contains the grant details or apiResponse.data does.
    // If fetchOpportunity returns an array or a different structure, this needs adjustment.
    if (apiResponse && (apiResponse.data || apiResponse.opportunityId)) { // Check if there's data
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
