"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Opportunity } from "@/types";
import { GrantIntelligence } from "@/app/lib/enhanced-data-enrichment";
import {
  Sparkles,
  Filter,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Target,
  Zap,
  Heart,
  BookOpen,
  ChevronRight,
} from "lucide-react";

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

interface EnhancedOpportunity extends Opportunity {
  intelligence: GrantIntelligence;
  matchScore: number;
  matchReasons: string[];
}

interface SmartGrantMatcherProps {
  opportunities: Opportunity[];
  userProfile?: UserProfile;
}

export const SmartGrantMatcher: React.FC<SmartGrantMatcherProps> = ({
  opportunities,
  userProfile,
}) => {
  const [filterByMatch, setFilterByMatch] = useState<number>(70);
  const [sortBy, setSortBy] = useState<
    "match" | "success" | "amount" | "competition"
  >("match");
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  // Mock user profile for demonstration
  const defaultProfile: UserProfile = {
    organizationType: "small-business",
    industryFocus: ["Technology", "Healthcare"],
    experienceLevel: "intermediate",
    budgetRange: { min: 50000, max: 500000 },
    preferredAmounts: { min: 100000, max: 1000000 },
    riskTolerance: "medium",
    timeCommitment: "full-time",
    geographicFocus: ["National", "California"],
    pastSuccesses: ["SBA Innovation Grant", "State Technology Development"],
  };

  const profile = userProfile || defaultProfile;

  // Smart matching algorithm
  const calculateMatchScore = useCallback(
    (opportunity: Opportunity): { score: number; reasons: string[] } => {
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
        reasons.push(
          `Perfect fit for ${profile.organizationType} organizations`,
        );

      // Industry focus matching (20 points)
      const industryMatch = opportunity.categories?.some((cat) =>
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
        score += 5; // Some points for having amount data
      }

      // Experience level matching with difficulty (15 points)
      // This would use intelligence.difficultyScore if available
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
        reasons.push(
          "Lower-risk opportunity suitable for conservative approach",
        );
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
        score += 5; // Neutral for no deadline info
      }

      return { score: Math.min(score, maxScore), reasons };
    },
    [profile],
  );

  // Enhanced opportunities with match scores
  const enhancedOpportunities: EnhancedOpportunity[] = useMemo(() => {
    return opportunities.map((opp) => {
      const { score, reasons } = calculateMatchScore(opp);
      // Mock intelligence data - in real app this would come from the enhanced enrichment
      const mockIntelligence: GrantIntelligence = {
        successProbability: Math.floor(Math.random() * 40 + 30), // 30-70%
        competitionLevel:
          opp.amount > 1000000
            ? "High"
            : opp.amount > 100000
              ? "Medium"
              : "Low",
        averageAwardAmount: opp.amount || 250000,
        historicalSuccessRate: Math.floor(Math.random() * 30 + 20), // 20-50%
        typicalApplicationCount:
          opp.amount > 1000000 ? 200 : opp.amount > 100000 ? 75 : 25,
        reviewTimelineEstimate: "4-6 months",
        difficultyScore: opp.amount > 1000000 ? 7 : opp.amount > 100000 ? 5 : 3,
        similarSuccessfulProjects: ["Example Project 1", "Example Project 2"],
        recommendedApplicantProfile: "Organizations with relevant experience",
      };

      return {
        ...opp,
        intelligence: mockIntelligence,
        matchScore: score,
        matchReasons: reasons,
      };
    });
  }, [opportunities, calculateMatchScore]);

  // Filtered and sorted opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = enhancedOpportunities.filter(
      (opp) => opp.matchScore >= filterByMatch,
    );

    if (showOnlyRecommended) {
      filtered = filtered.filter(
        (opp) =>
          opp.matchScore >= 80 ||
          (opp.intelligence.successProbability > 60 &&
            opp.intelligence.competitionLevel !== "Very High"),
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "match":
          return b.matchScore - a.matchScore;
        case "success":
          return (
            b.intelligence.successProbability -
            a.intelligence.successProbability
          );
        case "amount":
          return (b.amount || 0) - (a.amount || 0);
        case "competition":
          const competitionOrder = {
            Low: 4,
            Medium: 3,
            High: 2,
            "Very High": 1,
          };
          return (
            competitionOrder[b.intelligence.competitionLevel] -
            competitionOrder[a.intelligence.competitionLevel]
          );
        default:
          return b.matchScore - a.matchScore;
      }
    });
  }, [enhancedOpportunities, filterByMatch, sortBy, showOnlyRecommended]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-gray-600";
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 90)
      return { text: "Perfect Match", color: "bg-green-100 text-green-800" };
    if (score >= 80)
      return { text: "Excellent Match", color: "bg-blue-100 text-blue-800" };
    if (score >= 70)
      return { text: "Good Match", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Potential Match", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Smart Grant Matching
          </CardTitle>
          <p className="text-gray-600">
            AI-powered matching finds opportunities perfectly suited to your
            organization&apos;s profile and goals.
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Matching Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Minimum Match Score
              </label>
              <Input
                type="number"
                value={filterByMatch}
                onChange={(e) => setFilterByMatch(Number(e.target.value))}
                min="0"
                max="100"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Sort By
              </label>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Match Score</SelectItem>
                  <SelectItem value="success">Success Probability</SelectItem>
                  <SelectItem value="amount">Award Amount</SelectItem>
                  <SelectItem value="competition">Competition Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={showOnlyRecommended ? "default" : "outline"}
                onClick={() => setShowOnlyRecommended(!showOnlyRecommended)}
                className="w-full"
              >
                <Heart className="h-4 w-4 mr-2" />
                Top Recommendations Only
              </Button>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredOpportunities.length} of {opportunities.length}{" "}
                opportunities
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matched Opportunities */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const matchBadge = getMatchScoreBadge(opportunity.matchScore);

          return (
            <Card
              key={opportunity.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {opportunity.title}
                      </h3>
                      <Badge className={matchBadge.color}>
                        {matchBadge.text}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {opportunity.agency}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getMatchScoreColor(opportunity.matchScore)}`}
                    >
                      {opportunity.matchScore}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                </div>

                {/* Intelligence Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {opportunity.intelligence.successProbability}%
                      </div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {opportunity.intelligence.competitionLevel}
                      </div>
                      <div className="text-xs text-gray-500">Competition</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">
                        ${(opportunity.amount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Amount</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {opportunity.intelligence.reviewTimelineEstimate}
                      </div>
                      <div className="text-xs text-gray-500">Review Time</div>
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Why this is a good match:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.matchReasons
                      .slice(0, 3)
                      .map((reason, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {reason}
                        </Badge>
                      ))}
                    {opportunity.matchReasons.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{opportunity.matchReasons.length - 3} more reasons
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {opportunity.deadline && (
                      <span>
                        Deadline:{" "}
                        {new Date(opportunity.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span>Type: {opportunity.type}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">
                      Get Started
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sparkles className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your matching criteria or expanding your search
              preferences.
            </p>
            <Button onClick={() => setFilterByMatch(50)} variant="outline">
              Lower Match Threshold
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
