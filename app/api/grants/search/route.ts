import { NextResponse } from 'next/server';

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
      console.error('Grants.gov API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `API request failed with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in search API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Grants.gov API' },
      { status: 500 }
    );
  }
}
