import { NextRequest, NextResponse } from "next/server";
import { unifiedOpportunityService } from "@/app/services/unifiedOpportunityService";
import { enhancedDataEnrichment } from "@/app/lib/enhanced-data-enrichment";

// User profile interface for matching
interface UserProfile {
  organizationType:
    | "nonprofit"
    | "small-business"
    | "university"
    | "large-business"
    | "government";
  industryFocus: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
  budgetRange: { min: number; max: number };
  preferredAmounts: { min: number; max: number };
  riskTolerance: "low" | "medium" | "high";
  timeCommitment: "part-time" | "full-time" | "major-initiative";
  geographicFocus: string[];
  pastSuccesses: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userProfile, searchParams, limit = 20 } = body;

    if (!userProfile) {
      return NextResponse.json(
        { error: "userProfile is required" },
        { status: 400 },
      );
    }

    // Get opportunities based on search parameters
    const opportunitiesResponse =
      await unifiedOpportunityService.searchAllOpportunities({
        ...searchParams,
        limit: limit * 2, // Get more to filter down after matching
      });

    // Calculate match scores for each opportunity
    const matchedOpportunities = await Promise.all(
      opportunitiesResponse.opportunities.map(async (opportunity) => {
        // Calculate match score
        const matchScore = calculateMatchScore(opportunity, userProfile);

        // Get intelligence data
        let intelligence = null;
        try {
          const enhanced =
            await enhancedDataEnrichment.enhanceOpportunityWithIntelligence(
              opportunity,
            );
          intelligence = enhanced.intelligence;
        } catch (error) {
          console.log(
            "Failed to get intelligence for opportunity:",
            opportunity.id,
          );
        }

        return {
          ...opportunity,
          matchScore: matchScore.score,
          matchReasons: matchScore.reasons,
          intelligence,
        };
      }),
    );

    // Sort by match score and take top results
    const sortedMatches = matchedOpportunities
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        matches: sortedMatches,
        totalCount: sortedMatches.length,
        userProfile,
      },
    });
  } catch (error) {
    console.error("Matching API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate matches" },
      { status: 500 },
    );
  }
}

// Smart matching algorithm
function calculateMatchScore(
  opportunity: any,
  profile: UserProfile,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const maxScore = 100;

  // Organization type matching (25 points)
  const orgTypeScores: Record<string, Record<string, number>> = {
    nonprofit: {
      grant: 25,
      contract: 10,
      cooperative_agreement: 20,
      procurement: 10,
      other: 15,
    },
    "small-business": {
      grant: 20,
      contract: 25,
      cooperative_agreement: 15,
      procurement: 25,
      other: 15,
    },
    university: {
      grant: 25,
      contract: 15,
      cooperative_agreement: 20,
      procurement: 15,
      other: 20,
    },
    "large-business": {
      grant: 10,
      contract: 25,
      cooperative_agreement: 10,
      procurement: 25,
      other: 15,
    },
    government: {
      grant: 15,
      contract: 20,
      cooperative_agreement: 25,
      procurement: 20,
      other: 20,
    },
  };

  const orgScore =
    orgTypeScores[profile.organizationType]?.[opportunity.type] || 10;
  score += orgScore;
  if (orgScore >= 20)
    reasons.push(`Perfect fit for ${profile.organizationType} organizations`);

  // Industry focus matching (20 points)
  const industryMatch = opportunity.categories?.some((cat: string) =>
    profile.industryFocus.some(
      (focus) =>
        cat.toLowerCase().includes(focus.toLowerCase()) ||
        focus.toLowerCase().includes(cat.toLowerCase()),
    ),
  );
  if (industryMatch) {
    score += 20;
    reasons.push("Matches your industry focus areas");
  }

  // Budget range matching (20 points)
  if (
    opportunity.amount >= profile.preferredAmounts.min &&
    opportunity.amount <= profile.preferredAmounts.max
  ) {
    score += 20;
    reasons.push("Amount is within your preferred range");
  } else if (
    opportunity.amount >= profile.budgetRange.min &&
    opportunity.amount <= profile.budgetRange.max
  ) {
    score += 15;
    reasons.push("Amount is manageable for your organization");
  } else if (opportunity.amount > 0) {
    score += 5;
  }

  // Experience level matching (15 points)
  const mockDifficulty =
    opportunity.amount > 1000000 ? 7 : opportunity.amount > 100000 ? 5 : 3;
  const experienceLevels = {
    beginner: 1,
    intermediate: 5,
    advanced: 7,
    expert: 10,
  };
  const userLevel = experienceLevels[profile.experienceLevel];

  if (mockDifficulty <= userLevel + 2) {
    score += 15;
    if (mockDifficulty <= userLevel)
      reasons.push("Difficulty level matches your experience");
  } else if (mockDifficulty <= userLevel + 4) {
    score += 10;
    reasons.push("Challenging but achievable with your experience");
  } else {
    score += 2;
    reasons.push("May require additional expertise or partnerships");
  }

  // Risk tolerance matching (10 points)
  const isHighCompetition =
    opportunity.amount > 1000000 ||
    opportunity.agency.includes("NSF") ||
    opportunity.agency.includes("NIH");
  if (profile.riskTolerance === "high" && isHighCompetition) {
    score += 10;
    reasons.push(
      "High-value, competitive opportunity matches your risk appetite",
    );
  } else if (profile.riskTolerance === "low" && !isHighCompetition) {
    score += 10;
    reasons.push("Lower-risk opportunity suitable for conservative approach");
  } else {
    score += 5;
  }

  // Timing factors (10 points)
  if (opportunity.deadline) {
    const deadline = new Date(opportunity.deadline);
    const daysUntil = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntil > 60) {
      score += 10;
      reasons.push("Ample time for application preparation");
    } else if (daysUntil > 30) {
      score += 7;
      reasons.push("Reasonable time for application preparation");
    } else if (daysUntil > 0) {
      score += 3;
      reasons.push("Urgent deadline - quick action required");
    }
  } else {
    score += 5;
  }

  return { score: Math.min(score, maxScore), reasons };
}
