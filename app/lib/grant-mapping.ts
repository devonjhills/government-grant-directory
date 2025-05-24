// app/lib/grant-mapping.ts
import type { Grant, GrantsGovGrant, GrantsGovData } from "../../types"; // GrantsGovData might not be directly used by the moved function but is good for context

// Renamed and exported function from grantsGovService.ts
export function mapGrantsGovGrantToGrant(apiGrant: GrantsGovGrant): Grant {
  return {
    id: apiGrant.id,
    title: apiGrant.title,
    agency: apiGrant.agency,
    description: `Synopsis for ${apiGrant.title}. More details available.`,
    eligibilityCriteria: "Varies; see full announcement.",
    deadline: apiGrant.closeDate || "N/A",
    amount: 0, // Defaulting amount as it's not in GrantsGovGrant (oppHit)
    linkToApply: `https://www.grants.gov/search-results-detail/${apiGrant.id}`,
    sourceAPI: "Grants.gov",
    opportunityNumber: apiGrant.number,
    opportunityStatus: apiGrant.oppStatus,
    postedDate: apiGrant.openDate || "N/A",
    categories: apiGrant.alnist || [], // Assuming alnist maps to categories
  };
}

// If GrantsGovData is indeed part of GrantsGovResponse and used by other potential mapping functions,
// it's good it's imported. If not, it can be removed.
// For now, keeping the import as specified in the plan.
// Also, ensure GrantsGovResponse is imported if other functions in this file might need it.
// Based on the task, only Grant and GrantsGovGrant are directly used by mapGrantsGovGrantToGrant.
// Adding GrantsGovData for completeness as per step 2 of the overall task.
// The type GrantsGovResponse itself isn't used in this specific file yet.
// export type { Grant, GrantsGovGrant, GrantsGovData }; // Re-exporting types if needed elsewhere, but direct import is cleaner.
// For now, direct imports in files that need them is the strategy.
