import { NextRequest, NextResponse } from 'next/server';
import { enhancedDataEnrichment } from '@/app/lib/enhanced-data-enrichment';
import { historicalDataService } from '@/app/lib/historical-data-service';
import { unifiedOpportunityService } from '@/app/services/unifiedOpportunityService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('opportunityId');
    
    if (!opportunityId) {
      return NextResponse.json(
        { error: 'opportunityId parameter is required' },
        { status: 400 }
      );
    }

    // Get the opportunity details
    const opportunity = await unifiedOpportunityService.getOpportunityById(opportunityId);
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Get enhanced intelligence data
    const enhancedOpportunity = await enhancedDataEnrichment.enhanceOpportunityWithIntelligence(opportunity);
    
    return NextResponse.json({
      success: true,
      data: {
        opportunity: enhancedOpportunity.intelligence,
        applicationReadiness: enhancedOpportunity.applicationReadiness,
        searchScore: enhancedOpportunity.searchScore
      }
    });
    
  } catch (error) {
    console.error('Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intelligence data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunities, userProfile } = body;
    
    if (!opportunities || !Array.isArray(opportunities)) {
      return NextResponse.json(
        { error: 'opportunities array is required' },
        { status: 400 }
      );
    }

    // Enhance multiple opportunities with intelligence
    const enhancedOpportunities = await Promise.all(
      opportunities.map(async (opp) => {
        try {
          return await enhancedDataEnrichment.enhanceOpportunityWithIntelligence(opp);
        } catch (error) {
          console.error(`Failed to enhance opportunity ${opp.id}:`, error);
          return {
            ...opp,
            intelligence: null,
            applicationReadiness: null
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: enhancedOpportunities
    });
    
  } catch (error) {
    console.error('Batch intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to process intelligence data' },
      { status: 500 }
    );
  }
}