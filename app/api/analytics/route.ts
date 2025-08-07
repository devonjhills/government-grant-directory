import { NextRequest, NextResponse } from 'next/server';
import { historicalDataService } from '@/app/lib/historical-data-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const agency = searchParams.get('agency');
    const naics = searchParams.get('naics');
    const years = parseInt(searchParams.get('years') || '5');
    
    let analyticsData;
    
    switch (type) {
      case 'agency':
        if (!agency) {
          return NextResponse.json(
            { error: 'agency parameter is required for agency analytics' },
            { status: 400 }
          );
        }
        
        const [agencyAnalytics, historicalData] = await Promise.all([
          historicalDataService.getAgencyAnalytics(agency),
          historicalDataService.getAgencyHistoricalData(agency, years)
        ]);
        
        analyticsData = {
          analytics: agencyAnalytics,
          historical: historicalData
        };
        break;
        
      case 'industry':
        if (!naics) {
          return NextResponse.json(
            { error: 'naics parameter is required for industry analytics' },
            { status: 400 }
          );
        }
        
        analyticsData = await historicalDataService.getIndustryAnalytics(naics);
        break;
        
      default:
        return NextResponse.json(
          { error: 'type parameter must be "agency" or "industry"' },
          { status: 400 }
        );
    }
    
    if (!analyticsData) {
      return NextResponse.json(
        { error: 'No analytics data found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}