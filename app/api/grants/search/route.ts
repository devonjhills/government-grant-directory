import { NextResponse } from "next/server";
import { mapGrantsGovGrantToGrant } from "../../../lib/grant-mapping";
import { Grant, GrantsGovResponse } from "@/types";

const STAGING_API_URL = "https://api.grants.gov/v1/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('keyword') || '';
    const rows = parseInt(searchParams.get('rows') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build search parameters for Grants.gov API
    const grantsGovParams = {
      keyword: query,
      rows,
      offset,
      oppStatuses: 'posted|forecasted',
    };

    const response = await fetch(`${STAGING_API_URL}/search2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(grantsGovParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Grants.gov API Error (Network):",
        response.status,
        errorText
      );
      return NextResponse.json(
        {
          error: `API request failed with status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data: GrantsGovResponse = await response.json();

    if (data.errorcode !== 0) {
      console.error(
        `Grants.gov API Error (code: ${data.errorcode}): ${data.msg}`
      );
      return NextResponse.json(
        {
          error: `Grants.gov API Error: ${data.msg} (code: ${data.errorcode})`,
        },
        { status: 400 }
      );
    }

    if (!data.data) {
      console.warn(
        "Grants.gov response had errorcode 0 but no 'data' field. Treating as no results.",
        data
      );
      return NextResponse.json({ grants: [], totalRecords: 0 });
    }

    const oppHits = data.data.oppHits || [];
    const totalRecords = data.data.hitCount || 0;
    const mappedGrants: Grant[] = oppHits.map(mapGrantsGovGrantToGrant);

    return NextResponse.json({
      grants: mappedGrants,
      totalRecords: totalRecords,
    });
  } catch (error) {
    console.error("Error in search API route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: `Failed to fetch data from Grants.gov API: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const searchParams = await request.json();

    const response = await fetch(`${STAGING_API_URL}/search2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Grants.gov API Error (Network):",
        response.status,
        errorText
      );
      return NextResponse.json(
        {
          error: `API request failed with status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data: GrantsGovResponse = await response.json();

    if (data.errorcode !== 0) {
      // Log the specific error message from Grants.gov for server-side debugging
      console.error(
        `Grants.gov API Error (code: ${data.errorcode}): ${data.msg}`
      );
      return NextResponse.json(
        {
          error: `Grants.gov API Error: ${data.msg} (code: ${data.errorcode})`,
        },
        { status: 400 }
      );
    }

    // Handle cases where 'data' field itself might be missing in a non-error response (defensive check)
    if (!data.data) {
      console.warn(
        "Grants.gov response had errorcode 0 but no 'data' field. Treating as no results.",
        data
      );
      return NextResponse.json({ grants: [], totalRecords: 0 });
    }

    // If data.data.oppHits is null/undefined, treat it as an empty array.
    // This is crucial for correctly handling 'no results' scenarios from Grants.gov where hitCount might be 0.
    const oppHits = data.data.oppHits || [];
    const totalRecords = data.data.hitCount || 0; // Default hitCount to 0 if missing

    // The mapGrantsGovGrantToGrant function should be robust enough to handle an empty oppHits array.
    const mappedGrants: Grant[] = oppHits.map(mapGrantsGovGrantToGrant);

    return NextResponse.json({
      grants: mappedGrants,
      totalRecords: totalRecords,
    });
  } catch (error) {
    console.error("Error in search API route:", error);
    // Check if error is an instance of Error to safely access message property
    // Check if error is an instance of Error to safely access message property
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: `Failed to fetch data from Grants.gov API: ${errorMessage}` },
      { status: 500 }
    );
  }
}
