import { NextRequest, NextResponse } from "next/server";
import { historicalDataService } from "@/app/lib/historical-data-service";
import { unifiedOpportunityService } from "@/app/services/unifiedOpportunityService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get("opportunityId");

    if (!opportunityId) {
      return NextResponse.json(
        { error: "opportunityId parameter is required" },
        { status: 400 },
      );
    }

    // Get the opportunity details
    const opportunity =
      await unifiedOpportunityService.getOpportunityById(opportunityId);

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 },
      );
    }

    // Get competition metrics and similar opportunities
    const [competitionMetrics, similarOpportunities] = await Promise.all([
      historicalDataService.calculateCompetitionMetrics(opportunity),
      historicalDataService.findSimilarSuccessfulOpportunities(opportunity, 5),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        competition: competitionMetrics,
        similarSuccesses: similarOpportunities.map((opp) => ({
          id: opp.id,
          title: opp.title,
          agency: opp.agency,
          amount: opp.amount,
          postedDate: opp.postedDate,
          opportunityStatus: opp.opportunityStatus,
        })),
      },
    });
  } catch (error) {
    console.error("Competition API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition data" },
      { status: 500 },
    );
  }
}
