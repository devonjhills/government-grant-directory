'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Opportunity } from '@/types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Users, 
  DollarSign,
  Target,
  Lightbulb,
  ArrowRight,
  Download,
  Calendar,
  Shield
} from 'lucide-react';

interface ReadinessAssessment {
  overallScore: number;
  categories: {
    organizational: number;
    technical: number;
    financial: number;
    regulatory: number;
    timeline: number;
  };
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  estimatedPrepTime: string;
  successProbability: number;
}

interface ApplicationReadinessAssessmentProps {
  opportunity: Opportunity;
  onAssessmentComplete?: (assessment: ReadinessAssessment) => void;
}

interface AssessmentOption {
  value: string;
  label: string;
  score?: number;
}

interface AssessmentQuestion {
  id: string;
  type: 'radio' | 'checkbox' | 'textarea';
  question: string;
  options: AssessmentOption[];
  weight: number;
  required?: string[];
}

// Assessment questions organized by category
const assessmentQuestions: Record<string, AssessmentQuestion[]> = {
  organizational: [
    {
      id: 'org_type',
      type: 'radio',
      question: 'What type of organization are you?',
      options: [
        { value: 'nonprofit', label: 'Non-profit organization' },
        { value: 'small-business', label: 'Small business' },
        { value: 'university', label: 'University/Academic institution' },
        { value: 'large-business', label: 'Large corporation' },
        { value: 'government', label: 'Government entity' }
      ],
      weight: 20
    },
    {
      id: 'experience',
      type: 'radio',
      question: 'How much grant application experience does your organization have?',
      options: [
        { value: 'none', label: 'No previous grant experience', score: 0 },
        { value: 'some', label: '1-3 successful grants', score: 50 },
        { value: 'experienced', label: '4-10 successful grants', score: 80 },
        { value: 'expert', label: '10+ successful grants', score: 100 }
      ],
      weight: 25
    },
    {
      id: 'team_capacity',
      type: 'radio',
      question: 'Do you have dedicated staff to manage grant applications and projects?',
      options: [
        { value: 'none', label: 'No dedicated staff', score: 0 },
        { value: 'part-time', label: 'Part-time or shared responsibility', score: 60 },
        { value: 'dedicated', label: 'Dedicated grant management staff', score: 100 }
      ],
      weight: 20
    }
  ],
  technical: [
    {
      id: 'project_expertise',
      type: 'radio',
      question: 'How would you rate your expertise in the project area?',
      options: [
        { value: 'beginner', label: 'Limited experience', score: 20 },
        { value: 'intermediate', label: 'Some relevant experience', score: 60 },
        { value: 'advanced', label: 'Strong expertise', score: 85 },
        { value: 'expert', label: 'Recognized leader in the field', score: 100 }
      ],
      weight: 30
    },
    {
      id: 'partnerships',
      type: 'checkbox',
      question: 'Do you have established partnerships relevant to this project?',
      options: [
        { value: 'academic', label: 'Academic institutions' },
        { value: 'industry', label: 'Industry partners' },
        { value: 'government', label: 'Government agencies' },
        { value: 'nonprofit', label: 'Other nonprofits' },
        { value: 'international', label: 'International partners' }
      ],
      weight: 15
    },
    {
      id: 'infrastructure',
      type: 'radio',
      question: 'Do you have the necessary infrastructure/equipment?',
      options: [
        { value: 'none', label: 'Would need to acquire most resources', score: 20 },
        { value: 'some', label: 'Have some, would need additional', score: 60 },
        { value: 'adequate', label: 'Have adequate infrastructure', score: 90 },
        { value: 'excellent', label: 'State-of-the-art facilities', score: 100 }
      ],
      weight: 20
    }
  ],
  financial: [
    {
      id: 'financial_health',
      type: 'radio',
      question: 'What is your organization&apos;s financial health?',
      options: [
        { value: 'poor', label: 'Financial difficulties', score: 10 },
        { value: 'stable', label: 'Financially stable', score: 70 },
        { value: 'strong', label: 'Strong financial position', score: 90 },
        { value: 'excellent', label: 'Excellent financial reserves', score: 100 }
      ],
      weight: 25
    },
    {
      id: 'matching_funds',
      type: 'radio',
      question: 'Can you provide required matching funds or cost-share?',
      options: [
        { value: 'no', label: 'Cannot provide matching funds', score: 0 },
        { value: 'difficult', label: 'Would be challenging', score: 40 },
        { value: 'possible', label: 'Can likely secure matching funds', score: 80 },
        { value: 'ready', label: 'Matching funds readily available', score: 100 }
      ],
      weight: 30
    },
    {
      id: 'budget_experience',
      type: 'radio',
      question: 'Do you have experience with federal budget requirements?',
      options: [
        { value: 'none', label: 'No experience with federal budgets', score: 20 },
        { value: 'some', label: 'Some experience', score: 60 },
        { value: 'experienced', label: 'Very experienced', score: 100 }
      ],
      weight: 20
    }
  ],
  regulatory: [
    {
      id: 'registrations',
      type: 'checkbox',
      question: 'Which required registrations do you have?',
      options: [
        { value: 'sam', label: 'SAM.gov registration (current)' },
        { value: 'duns', label: 'DUNS number' },
        { value: 'cage', label: 'CAGE code' },
        { value: 'grants_gov', label: 'Grants.gov account' }
      ],
      weight: 30,
      required: ['sam', 'grants_gov'] // These are typically required
    },
    {
      id: 'compliance_experience',
      type: 'radio',
      question: 'How familiar are you with federal compliance requirements?',
      options: [
        { value: 'none', label: 'No experience', score: 10 },
        { value: 'some', label: 'Some familiarity', score: 50 },
        { value: 'experienced', label: 'Very familiar', score: 90 },
        { value: 'expert', label: 'Expert level', score: 100 }
      ],
      weight: 25
    },
    {
      id: 'audit_ready',
      type: 'radio',
      question: 'Are your financial systems audit-ready?',
      options: [
        { value: 'no', label: 'No formal financial systems', score: 10 },
        { value: 'basic', label: 'Basic systems in place', score: 50 },
        { value: 'good', label: 'Good financial controls', score: 80 },
        { value: 'excellent', label: 'Audit-ready systems', score: 100 }
      ],
      weight: 20
    }
  ],
  timeline: [
    {
      id: 'availability',
      type: 'radio',
      question: 'How much time can you dedicate to application preparation?',
      options: [
        { value: 'limited', label: 'Very limited time available', score: 20 },
        { value: 'part-time', label: 'Part-time effort', score: 60 },
        { value: 'significant', label: 'Significant time investment', score: 85 },
        { value: 'full-time', label: 'Full-time dedication', score: 100 }
      ],
      weight: 30
    },
    {
      id: 'lead_time',
      type: 'radio',
      question: 'How much lead time do you typically need for major proposals?',
      options: [
        { value: 'weeks', label: '2-4 weeks', score: 30 },
        { value: 'month', label: '1-2 months', score: 70 },
        { value: 'months', label: '3+ months', score: 100 }
      ],
      weight: 25
    }
  ]
};

export const ApplicationReadinessAssessment: React.FC<ApplicationReadinessAssessmentProps> = ({
  opportunity,
  onAssessmentComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [assessment, setAssessment] = useState<ReadinessAssessment | null>(null);

  const categories = Object.keys(assessmentQuestions);
  const currentCategory = categories[currentStep];
  const currentQuestions = assessmentQuestions[currentCategory as keyof typeof assessmentQuestions];

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateAssessment = (): ReadinessAssessment => {
    const categoryScores: Record<string, number> = {};
    
    // Calculate scores for each category
    Object.entries(assessmentQuestions).forEach(([category, questions]) => {
      let totalScore = 0;
      let totalWeight = 0;
      
      questions.forEach(question => {
        const response = responses[question.id];
        let score = 0;
        
        if (question.type === 'radio') {
          const selectedOption = question.options.find(opt => opt.value === response);
          score = selectedOption?.score || 0;
        } else if (question.type === 'checkbox') {
          const selectedCount = response?.length || 0;
          const requiredItems = question.required || [];
          const requiredSelected = requiredItems.filter(req => response?.includes(req)).length;
          
          // Base score on percentage of items selected + bonus for required items
          score = (selectedCount / question.options.length) * 80;
          if (requiredSelected === requiredItems.length) score += 20;
          score = Math.min(score, 100);
        }
        
        totalScore += score * question.weight;
        totalWeight += question.weight;
      });
      
      categoryScores[category] = totalWeight > 0 ? totalScore / totalWeight : 0;
    });

    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;

    // Generate insights based on scores
    const strengths: string[] = [];
    const gaps: string[] = [];
    const recommendations: string[] = [];

    if (categoryScores.organizational >= 80) {
      strengths.push('Strong organizational foundation');
    } else if (categoryScores.organizational < 50) {
      gaps.push('Organizational readiness needs improvement');
      recommendations.push('Consider building grant management capacity');
    }

    if (categoryScores.technical >= 80) {
      strengths.push('Excellent technical expertise');
    } else if (categoryScores.technical < 60) {
      gaps.push('Technical capabilities may need strengthening');
      recommendations.push('Consider forming strategic partnerships');
    }

    if (categoryScores.financial >= 70) {
      strengths.push('Sound financial position');
    } else {
      gaps.push('Financial preparedness needs attention');
      recommendations.push('Ensure financial systems and matching funds are ready');
    }

    if (categoryScores.regulatory >= 80) {
      strengths.push('Regulatory compliance ready');
    } else {
      gaps.push('Regulatory requirements need attention');
      recommendations.push('Complete all required registrations and compliance training');
    }

    // Estimate preparation time based on scores and gaps
    let prepTime = '4-6 weeks';
    if (overallScore >= 85) prepTime = '2-3 weeks';
    else if (overallScore >= 70) prepTime = '3-5 weeks';
    else if (overallScore >= 50) prepTime = '6-10 weeks';
    else prepTime = '10-16 weeks';

    // Calculate success probability based on readiness + opportunity factors
    const baseSuccessProbability = opportunity.amount && opportunity.amount > 1000000 ? 30 : 45;
    const readinessBonus = (overallScore - 50) * 0.4; // Max 20 point bonus
    const successProbability = Math.max(Math.min(baseSuccessProbability + readinessBonus, 90), 10);

    return {
      overallScore,
      categories: {
        organizational: categoryScores.organizational,
        technical: categoryScores.technical,
        financial: categoryScores.financial,
        regulatory: categoryScores.regulatory,
        timeline: categoryScores.timeline
      },
      strengths,
      gaps,
      recommendations,
      estimatedPrepTime: prepTime,
      successProbability
    };
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const result = calculateAssessment();
      setAssessment(result);
      onAssessmentComplete?.(result);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    return currentQuestions.every(question => {
      const response = responses[question.id];
      return response !== undefined && response !== null && response !== '';
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 40) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Needs Work', color: 'bg-red-100 text-red-800' };
  };

  if (assessment) {
    const overallBadge = getScoreBadge(assessment.overallScore);
    
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Application Readiness Assessment Results
            </CardTitle>
            <p className="text-gray-600">
              Based on your responses, here&apos;s your readiness profile for this opportunity.
            </p>
          </CardHeader>
        </Card>

        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                  {Math.round(assessment.overallScore)}
                </div>
                <Badge className={overallBadge.color}>{overallBadge.text}</Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Success Probability</div>
                <div className={`text-2xl font-bold ${getScoreColor(assessment.successProbability)}`}>
                  {Math.round(assessment.successProbability)}%
                </div>
              </div>
            </div>
            <Progress value={assessment.overallScore} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Estimated Prep Time: {assessment.estimatedPrepTime}</span>
              <span>Ready to apply in {assessment.estimatedPrepTime}</span>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Readiness by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(assessment.categories).map(([category, score]) => {
                const badge = getScoreBadge(score);
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="capitalize font-medium">{category.replace('_', ' ')}</div>
                      <Badge className={badge.color}>{badge.text}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={score} className="w-24" />
                      <span className={`font-bold ${getScoreColor(score)}`}>
                        {Math.round(score)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        {assessment.strengths.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {assessment.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Gaps & Recommendations */}
        {assessment.gaps.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Gaps to Address:</h4>
                  <ul className="space-y-1">
                    {assessment.gaps.map((gap, index) => (
                      <li key={index} className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {assessment.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-center gap-2 text-orange-700">
                        <Lightbulb className="h-4 w-4 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recommended Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center font-bold">1</div>
                <span>Address critical gaps identified in your assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center font-bold">2</div>
                <span>Complete all required registrations and documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center font-bold">3</div>
                <span>Develop partnerships to strengthen your application</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-sm flex items-center justify-center font-bold">4</div>
                <span>Begin drafting your proposal {assessment.estimatedPrepTime} before the deadline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => setAssessment(null)} variant="outline">
            Retake Assessment
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
          <Button>
            Get Personalized Help
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Application Readiness Assessment
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Progress value={(currentStep + 1) / categories.length * 100} className="flex-1" />
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {categories.length}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Current Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {currentCategory.replace('_', ' ')} Readiness
          </CardTitle>
          <p className="text-gray-600">
            Answer these questions to assess your {currentCategory} preparedness.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestions.map((question) => (
            <div key={question.id} className="space-y-3">
              <h4 className="font-medium text-gray-900">{question.question}</h4>
              
              {question.type === 'radio' && (
                <RadioGroup
                  value={responses[question.id] || ''}
                  onValueChange={(value) => handleResponse(question.id, value)}
                >
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                      <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === 'checkbox' && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${option.value}`}
                        checked={responses[question.id]?.includes(option.value) || false}
                        onCheckedChange={(checked) => {
                          const current = responses[question.id] || [];
                          const updated = checked
                            ? [...current, option.value]
                            : current.filter((v: string) => v !== option.value);
                          handleResponse(question.id, updated);
                        }}
                      />
                      <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                      {question.required?.includes(option.value) && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'textarea' && (
                <Textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  placeholder="Please provide details..."
                  rows={3}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isStepComplete()}
        >
          {currentStep < categories.length - 1 ? 'Next' : 'Complete Assessment'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};