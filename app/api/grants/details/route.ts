import { NextResponse } from 'next/server';

const STAGING_API_URL = "https://api.staging.grants.gov/v1/api";

export async function POST(request: Request) {
  try {
    const { opportunityId } = await request.json();
    
    const response = await fetch(`${STAGING_API_URL}/fetchOpportunity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ opportunityId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grants.gov fetchOpportunity API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API request failed with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in details API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grant details from Grants.gov API' },
      { status: 500 }
    );
  }
}
