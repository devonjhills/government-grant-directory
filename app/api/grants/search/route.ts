import { NextResponse } from 'next/server';
import { mapGrantsGovGrantToGrant } from '../../../lib/grant-mapping';
import type { Grant, GrantsGovResponse, GrantsGovGrant } from '../../../types';

const STAGING_API_URL = "https://api.grants.gov/v1/api";

export async function POST(request: Request) {
  try {
    const searchParams = await request.json();
    
    const response = await fetch(`${STAGING_API_URL}/search2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grants.gov API Error (Network):', response.status, errorText);
      return NextResponse.json(
        { error: `API request failed with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data: GrantsGovResponse = await response.json();

    // Error Handling (Grants.gov specific)
    if (data.errorcode !== 0 || !data.data || !data.data.oppHits) {
      console.error('Grants.gov API Logic Error:', data.msg, data.errorcode);
      return NextResponse.json(
        { error: `Grants.gov API Error: ${data.msg || 'Unknown error'} (code: ${data.errorcode})` },
        { status: 400 } // Bad Request, as the API itself reported an issue with the request or data.
      );
    }

    // Data Mapping
    const oppHits: GrantsGovGrant[] = data.data.oppHits;
    const mappedGrants: Grant[] = oppHits.map(mapGrantsGovGrantToGrant);
    const totalRecords: number = data.data.hitCount;

    // Return Mapped Data
    return NextResponse.json({ grants: mappedGrants, totalRecords: totalRecords });

  } catch (error) {
    console.error('Error in search API route:', error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: `Failed to fetch data from Grants.gov API: ${errorMessage}` },
      { status: 500 }
    );
  }
}
