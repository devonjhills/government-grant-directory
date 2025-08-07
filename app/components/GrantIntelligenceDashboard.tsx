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
}

export const GrantIntelligenceDashboard: React.FC<GrantIntelligenceDashboardProps> = ({
  opportunity,
  intelligence,
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

  // Calculate opportunity-specific metrics
  const getEligibleApplicantPool = () => {
    if (opportunity.agency?.toLowerCase().includes('va') && 
        opportunity.eligibilityCriteria?.toLowerCase().includes('state')) {
      return '50 states + 574 tribes = 624 max eligible';
    }
    if (opportunity.eligibilityCriteria?.toLowerCase().includes('state')) {
      return '~50 state governments eligible';
    }
    if (opportunity.eligibilityCriteria?.toLowerCase().includes('small business')) {
      return 'Small businesses (31.7M+ eligible)';
    }
    return 'Multiple entity types eligible';
  };

  const getSuccessCalculationBreakdown = () => {
    const agency = opportunity.agency?.toLowerCase() || '';
    let baseRate = 15;
    let factors = [];
    
    if (agency.includes('va')) {
      baseRate = 18;
      factors.push('VA baseline: 18%');
    } else if (agency.includes('nsf')) {
      baseRate = 11;
      factors.push('NSF baseline: 11%');
    } else if (agency.includes('nih')) {
      baseRate = 14;
      factors.push('NIH baseline: 14%');
    } else {
      factors.push('Federal baseline: 15%');
    }

    if (opportunity.amount > 10000000) {
      factors.push('Large amount (+10%): fewer capable applicants');
    } else if (opportunity.amount > 1000000) {
      factors.push('Substantial amount (+5%): moderate competition');
    }

    if (opportunity.eligibilityCriteria?.toLowerCase().includes('state')) {
      factors.push('Limited eligibility (+7%): restricted applicant pool');
    }

    return factors;
  };

  return (
    <div className="space-y-8">
      {/* Success Probability with detailed calculation */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
            <Target className="h-5 w-5" />
            Success Probability Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getSuccessColor(intelligence.successProbability)}`}>
              {intelligence.successProbability}%
            </div>
            <div className="flex-1">
              <Progress value={intelligence.successProbability} className="mb-2" />
              <p className="text-sm text-blue-700 font-medium">
                Estimated success rate for this specific opportunity
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Calculation Breakdown:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {getSuccessCalculationBreakdown().map((factor, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Competition Analysis */}
      <Card className="border-l-4 border-l-orange-500 bg-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-orange-900">
            <Users className="h-5 w-5" />
            Competition Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-700">
                {intelligence.competitionLevel}
              </div>
              <p className="text-sm text-orange-600 font-medium">Competition Level</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-700">
                ~{intelligence.typicalApplicationCount}
              </div>
              <p className="text-sm text-orange-600 font-medium">Expected Applications</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-2">Eligible Applicant Pool:</h4>
            <p className="text-sm text-gray-700 mb-2">
              {getEligibleApplicantPool()}
            </p>
            <p className="text-xs text-gray-600">
              Realistic applications typically 20-40% of maximum eligible entities for infrastructure grants
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Application Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-purple-900">
              <Clock className="h-5 w-5" />
              Review Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-700">
                {intelligence.reviewTimelineEstimate}
              </div>
              <p className="text-sm text-purple-600 font-medium">Estimated Review Time</p>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>VA Infrastructure Grants:</strong> Typically 4-6 months for initial review</p>
              <p className="text-xs text-gray-600 mt-1">
                Large infrastructure projects may require additional engineering reviews
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-red-900">
              <BarChart3 className="h-5 w-5" />
              Application Complexity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Badge className={difficultyBadge.color}>
                  {difficultyBadge.text}
                </Badge>
                <div className="text-2xl font-bold text-red-700">
                  {intelligence.difficultyScore}/10
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium mt-1">Complexity Score</p>
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>This opportunity requires:</strong></p>
              <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                <li>• 13 application documents (Section A)</li>
                <li>• Federal forms (SF424 series)</li>
                <li>• State matching funds (35% minimum)</li>
                <li>• Architectural schematics</li>
              </ul>
            </div>
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

      {/* Intelligence Methodology */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            How We Calculate Intelligence Data
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-3">
          <div>
            <strong>Success Probability:</strong> Based on published federal agency statistics (NSF ~11%, NIH ~14%, etc.), 
            funding amount competitiveness, and agency-specific historical patterns. Federal grants typically have 8-35% success rates.
          </div>
          <div>
            <strong>Competition Level:</strong> Calculated from funding amount (larger = more competitive), 
            agency type (research agencies like NSF are highly competitive), and opportunity characteristics.
          </div>
          <div>
            <strong>Estimated Competitors:</strong> Derived from funding amount, agency popularity, and research vs. non-research focus. 
            Popular agencies like NSF can have 40+ applicants per award.
          </div>
          <div>
            <strong>Timeline & Difficulty:</strong> Based on typical federal grant review cycles (3-12 months) 
            and application complexity indicators from the opportunity description.
          </div>
          <p className="text-xs text-blue-600 mt-2">
            All estimates are based on publicly available federal funding statistics and observable opportunity characteristics. 
            Individual results may vary.
          </p>
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
            <li>Assess your organization&apos;s readiness using our Application Readiness Tool</li>
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