'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Opportunity } from '@/types';
import { GrantIntelligence } from '@/app/lib/enhanced-data-enrichment';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign,
  BarChart3,
  Lightbulb,
  Trophy
} from 'lucide-react';

interface GrantIntelligenceDashboardProps {
  opportunity: Opportunity;
  intelligence: GrantIntelligence;
  userMatchScore?: number;
}

export const GrantIntelligenceDashboard: React.FC<GrantIntelligenceDashboardProps> = ({
  opportunity,
  intelligence,
  userMatchScore = 75
}) => {
  const getCompetitionColor = (level: GrantIntelligence['competitionLevel']) => {
    switch (level) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-orange-500';
      case 'Very High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSuccessColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDifficultyBadge = (score: number) => {
    if (score <= 3) return { text: 'Beginner', color: 'bg-green-100 text-green-800' };
    if (score <= 5) return { text: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 7) return { text: 'Advanced', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Expert', color: 'bg-red-100 text-red-800' };
  };

  const difficultyBadge = getDifficultyBadge(intelligence.difficultyScore);

  return (
    <div className="space-y-6">
      {/* Success Probability & Match Score Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Target className="h-4 w-4" />
              Success Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getSuccessColor(intelligence.successProbability)}`}>
              {intelligence.successProbability}%
            </div>
            <Progress value={intelligence.successProbability} className="mt-2" />
            <p className="text-sm text-gray-600 mt-1">
              Based on historical data and competitive analysis
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Trophy className="h-4 w-4" />
              Your Match Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getSuccessColor(userMatchScore)}`}>
              {userMatchScore}%
            </div>
            <Progress value={userMatchScore} className="mt-2" />
            <p className="text-sm text-gray-600 mt-1">
              How well this opportunity fits your profile
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competition & Intelligence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4" />
              Competition Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${getCompetitionColor(intelligence.competitionLevel)} text-white`}>
              {intelligence.competitionLevel}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              ~{intelligence.typicalApplicationCount.toLocaleString()} expected applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Review Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-blue-600">
              {intelligence.reviewTimelineEstimate}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Typical agency review period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <BarChart3 className="h-4 w-4" />
              Difficulty Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={difficultyBadge.color}>
              {difficultyBadge.text}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Score: {intelligence.difficultyScore}/10
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Intelligence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Posted Amount</p>
              <p className="text-xl font-bold text-green-600">
                ${opportunity.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Historical Average</p>
              <p className="text-xl font-bold text-blue-600">
                ${intelligence.averageAwardAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Success Rate</p>
              <p className="text-xl font-bold text-purple-600">
                {intelligence.historicalSuccessRate}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Profile & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommended Applicant Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{intelligence.recommendedApplicantProfile}</p>
          
          {intelligence.similarSuccessfulProjects.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Similar Successful Projects:</h4>
              <ul className="space-y-1">
                {intelligence.similarSuccessfulProjects.map((project, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                    {project}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Strategic Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {intelligence.successProbability > 70 && (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>High Success Potential:</strong> This opportunity has favorable odds based on historical patterns.
              </p>
            </div>
          )}
          
          {intelligence.competitionLevel === 'Low' && (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Low Competition:</strong> Fewer applicants expected - good opportunity for qualified candidates.
              </p>
            </div>
          )}

          {intelligence.difficultyScore <= 4 && (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Accessible Application:</strong> Moderate complexity makes this suitable for first-time applicants.
              </p>
            </div>
          )}

          {intelligence.competitionLevel === 'Very High' && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Highly Competitive:</strong> Consider partnering with established institutions to strengthen your application.
              </p>
            </div>
          )}

          {intelligence.difficultyScore >= 8 && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Complex Application:</strong> Allow extra time for preparation and consider consulting with experts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Review the complete opportunity announcement and requirements</li>
            <li>Assess your organization's readiness using our Application Readiness Tool</li>
            <li>Contact the program officer listed in the opportunity for clarification questions</li>
            <li>Begin assembling your project team and identifying key personnel</li>
            <li>Start developing a preliminary budget and project timeline</li>
            {opportunity.deadline && (
              <li className="text-red-600 font-medium">
                Mark your calendar: Application deadline is {new Date(opportunity.deadline).toLocaleDateString()}
              </li>
            )}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};