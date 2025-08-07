"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Opportunity } from "@/types";
import {
  Target,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  DollarSign,
  Award,
  ArrowRight,
  Download,
  Calendar,
  Bookmark,
} from "lucide-react";

interface OptimizationStrategy {
  category:
    | "application"
    | "partnerships"
    | "budget"
    | "timeline"
    | "compliance";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: number; // 1-10 scale
  effort: number; // 1-10 scale
  timeline: string;
  actionItems: string[];
  resources: string[];
  successMetrics: string[];
}

interface SuccessOptimizationPlan {
  opportunityId: string;
  overallStrategy: string;
  successProbabilityIncrease: number;
  strategies: OptimizationStrategy[];
  timeline: {
    immediate: OptimizationStrategy[];
    shortTerm: OptimizationStrategy[];
    longTerm: OptimizationStrategy[];
  };
  budgetConsiderations: string[];
  riskMitigation: string[];
}

interface SuccessOptimizationToolProps {
  opportunity: Opportunity;
  readinessScore?: number;
  userProfile?: any;
}

export const SuccessOptimizationTool: React.FC<
  SuccessOptimizationToolProps
> = ({ opportunity, readinessScore = 65, userProfile }) => {
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [optimizationPlan, setOptimizationPlan] =
    useState<SuccessOptimizationPlan | null>(null);

  // Generate optimization strategies based on opportunity and readiness
  const generateOptimizationStrategies = (): OptimizationStrategy[] => {
    const strategies: OptimizationStrategy[] = [];

    // Application Quality Strategies
    if (readinessScore < 80) {
      strategies.push({
        category: "application",
        priority: "high",
        title: "Strengthen Project Narrative",
        description:
          "Develop a compelling, evidence-based project narrative that clearly demonstrates impact and feasibility.",
        impact: 9,
        effort: 7,
        timeline: "2-3 weeks",
        actionItems: [
          "Conduct thorough literature review to establish need",
          "Develop clear problem statement with supporting data",
          "Create logical flow from problem to solution to impact",
          "Include specific, measurable outcomes",
          "Add compelling visuals and infographics",
        ],
        resources: [
          "Grant writing templates and guides",
          "Statistical databases for supporting evidence",
          "Professional grant writer consultation",
          "Peer review from experienced applicants",
        ],
        successMetrics: [
          "Clear problem-solution alignment",
          "Quantified impact projections",
          "Compelling narrative flow",
          "Strong reviewer feedback in mock reviews",
        ],
      });
    }

    // Partnership Strategies
    if (
      opportunity.amount > 500000 ||
      opportunity.categories?.includes("Research & Development")
    ) {
      strategies.push({
        category: "partnerships",
        priority: "high",
        title: "Strategic Partnership Development",
        description:
          "Form strategic partnerships to strengthen technical capabilities and increase competitive advantage.",
        impact: 8,
        effort: 6,
        timeline: "3-6 weeks",
        actionItems: [
          "Identify complementary organizations in your field",
          "Reach out to universities with relevant expertise",
          "Explore partnerships with established grant recipients",
          "Formalize partnerships with MOUs or letters of commitment",
          "Define clear roles and responsibilities",
        ],
        resources: [
          "Professional network mapping tools",
          "University research databases",
          "Industry association directories",
          "Partnership agreement templates",
        ],
        successMetrics: [
          "At least 2 strategic partners secured",
          "Clear value proposition for each partnership",
          "Formal commitment letters obtained",
          "Complementary expertise covered",
        ],
      });
    }

    // Budget Optimization
    strategies.push({
      category: "budget",
      priority: "medium",
      title: "Budget Optimization & Justification",
      description:
        "Develop a detailed, well-justified budget that maximizes impact while demonstrating cost-effectiveness.",
      impact: 7,
      effort: 5,
      timeline: "1-2 weeks",
      actionItems: [
        "Research comparable project budgets",
        "Justify every line item with clear rationale",
        "Include cost-share and matching funds strategically",
        "Plan for realistic indirect costs",
        "Build in appropriate contingencies",
      ],
      resources: [
        "Federal cost accounting standards",
        "Budget templates from successful applications",
        "Cost comparison databases",
        "Accounting software for tracking",
      ],
      successMetrics: [
        "Budget aligns with project scope",
        "All costs are well-justified",
        "Competitive cost per outcome",
        "Clear cost-effectiveness demonstrated",
      ],
    });

    // Timeline Management
    if (opportunity.deadline) {
      const daysUntilDeadline = Math.ceil(
        (new Date(opportunity.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysUntilDeadline < 60) {
        strategies.push({
          category: "timeline",
          priority: "high",
          title: "Accelerated Application Development",
          description:
            "Implement streamlined processes to meet tight deadline while maintaining quality.",
          impact: 6,
          effort: 8,
          timeline: "Immediate",
          actionItems: [
            "Create detailed daily work schedule",
            "Assign specific team members to sections",
            "Set up daily progress check-ins",
            "Prepare all supporting documents in parallel",
            "Schedule multiple review cycles",
          ],
          resources: [
            "Project management software",
            "Daily standup meeting templates",
            "Document collaboration tools",
            "Emergency support contacts",
          ],
          successMetrics: [
            "Daily milestones met",
            "All sections completed 1 week before deadline",
            "Time for thorough review and polish",
            "Submission 24 hours early",
          ],
        });
      }
    }

    // Compliance & Requirements
    strategies.push({
      category: "compliance",
      priority: "high",
      title: "Compliance & Requirements Checklist",
      description:
        "Ensure 100% compliance with all federal requirements and opportunity-specific criteria.",
      impact: 10,
      effort: 4,
      timeline: "1 week",
      actionItems: [
        "Create comprehensive requirements checklist",
        "Verify all registrations are current",
        "Ensure all forms are completed correctly",
        "Double-check page limits and formatting",
        "Validate all required signatures and certifications",
      ],
      resources: [
        "Federal requirements checklists",
        "Compliance tracking spreadsheets",
        "Legal compliance consultants",
        "Previous successful application examples",
      ],
      successMetrics: [
        "100% compliance with all requirements",
        "Error-free submission forms",
        "All deadlines met with buffer time",
        "Complete documentation package",
      ],
    });

    return strategies;
  };

  const generateOptimizationPlan = (): SuccessOptimizationPlan => {
    const strategies = generateOptimizationStrategies();

    // Categorize by timeline
    const immediate = strategies.filter(
      (s) =>
        s.timeline.includes("Immediate") ||
        s.timeline.includes("1 week") ||
        s.priority === "high",
    );
    const shortTerm = strategies.filter(
      (s) =>
        s.timeline.includes("2-3 weeks") || s.timeline.includes("1-2 weeks"),
    );
    const longTerm = strategies.filter(
      (s) => s.timeline.includes("6 weeks") || s.timeline.includes("3-6 weeks"),
    );

    const plan: SuccessOptimizationPlan = {
      opportunityId: opportunity.id,
      overallStrategy:
        readinessScore > 75
          ? "You have a strong foundation. Focus on differentiation and partnership development to maximize your competitive advantage."
          : "Build foundational capabilities while developing a compelling narrative. Strategic partnerships will be crucial for success.",
      successProbabilityIncrease: calculateProbabilityIncrease(strategies),
      strategies,
      timeline: { immediate, shortTerm, longTerm },
      budgetConsiderations: [
        "Allocate 10-15% of project budget for professional development and training",
        "Consider cost-share opportunities to strengthen your proposal",
        "Budget for partnership development and collaboration costs",
        "Include dissemination and evaluation costs in your budget",
      ],
      riskMitigation: [
        "Develop contingency plans for key project milestones",
        "Identify backup partners in case primary partnerships fall through",
        "Create alternative approaches to achieve project objectives",
        "Maintain regular communication with program officers",
      ],
    };

    return plan;
  };

  const calculateProbabilityIncrease = (
    strategies: OptimizationStrategy[],
  ): number => {
    const totalImpact = strategies.reduce(
      (sum, strategy) => sum + strategy.impact,
      0,
    );
    const maxPossibleImpact = strategies.length * 10;
    return Math.round((totalImpact / maxPossibleImpact) * 25); // Max 25% increase
  };

  const getPriorityColor = (priority: OptimizationStrategy["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
    }
  };

  const getCategoryIcon = (category: OptimizationStrategy["category"]) => {
    switch (category) {
      case "application":
        return <FileText className="h-5 w-5" />;
      case "partnerships":
        return <Users className="h-5 w-5" />;
      case "budget":
        return <DollarSign className="h-5 w-5" />;
      case "timeline":
        return <Clock className="h-5 w-5" />;
      case "compliance":
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const handleGeneratePlan = () => {
    const plan = generateOptimizationPlan();
    setOptimizationPlan(plan);
  };

  const toggleStrategy = (strategyTitle: string) => {
    setSelectedStrategies((prev) =>
      prev.includes(strategyTitle)
        ? prev.filter((s) => s !== strategyTitle)
        : [...prev, strategyTitle],
    );
  };

  if (!optimizationPlan) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              Success Optimization Tool
            </CardTitle>
            <p className="text-gray-600">
              Get personalized strategies to maximize your application success
              probability.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium">Current Readiness Score</h4>
                  <p className="text-sm text-gray-600">
                    Based on your assessment
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {readinessScore}%
                  </div>
                  <Progress value={readinessScore} className="w-24" />
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-2">What you&apos;ll get:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Personalized optimization strategies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Actionable timeline and milestones
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Success probability improvement estimate
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Risk mitigation recommendations
                  </li>
                </ul>
              </div>

              <Button onClick={handleGeneratePlan} className="w-full" size="lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                Generate My Success Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-blue-600" />
            Your Personalized Success Optimization Plan
          </CardTitle>
          <div className="flex items-center justify-between mt-4">
            <p className="text-gray-700">{optimizationPlan.overallStrategy}</p>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Potential Success Increase
              </div>
              <div className="text-2xl font-bold text-green-600">
                +{optimizationPlan.successProbabilityIncrease}%
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Strategy Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="strategies">All Strategies</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Immediate Actions */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      Immediate (This Week)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {optimizationPlan.timeline.immediate.map(
                      (strategy, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(strategy.category)}
                            <h5 className="font-medium text-sm">
                              {strategy.title}
                            </h5>
                          </div>
                          <Badge
                            className={getPriorityColor(strategy.priority)}
                          >
                            {strategy.priority} priority
                          </Badge>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>

                {/* Short Term */}
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <Clock className="h-5 w-5" />
                      Short Term (2-3 Weeks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {optimizationPlan.timeline.shortTerm.map(
                      (strategy, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(strategy.category)}
                            <h5 className="font-medium text-sm">
                              {strategy.title}
                            </h5>
                          </div>
                          <Badge
                            className={getPriorityColor(strategy.priority)}
                          >
                            {strategy.priority} priority
                          </Badge>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>

                {/* Long Term */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Calendar className="h-5 w-5" />
                      Long Term (4+ Weeks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {optimizationPlan.timeline.longTerm.map(
                      (strategy, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white rounded border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(strategy.category)}
                            <h5 className="font-medium text-sm">
                              {strategy.title}
                            </h5>
                          </div>
                          <Badge
                            className={getPriorityColor(strategy.priority)}
                          >
                            {strategy.priority} priority
                          </Badge>
                        </div>
                      ),
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="strategies" className="space-y-4">
              {optimizationPlan.strategies.map((strategy, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(strategy.category)}
                        {strategy.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(strategy.priority)}>
                          {strategy.priority} priority
                        </Badge>
                        <Button
                          variant="outline"
                          onClick={() => toggleStrategy(strategy.title)}
                        >
                          <Bookmark
                            className={`h-4 w-4 mr-2 ${selectedStrategies.includes(strategy.title) ? "fill-current" : ""}`}
                          />
                          {selectedStrategies.includes(strategy.title)
                            ? "Added"
                            : "Add to Plan"}
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600">{strategy.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Impact: {strategy.impact}/10</span>
                      <span>Effort: {strategy.effort}/10</span>
                      <span>Timeline: {strategy.timeline}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Action Items:</h5>
                        <ul className="space-y-1 text-sm">
                          {strategy.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Resources Needed:</h5>
                        <ul className="space-y-1 text-sm">
                          {strategy.resources.map((resource, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Considerations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {optimizationPlan.budgetConsiderations.map(
                      (consideration, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                          <span>{consideration}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Mitigation Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {optimizationPlan.riskMitigation.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-1 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Plan
        </Button>
        <Button>
          Start Implementation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button variant="outline">Get Expert Help</Button>
      </div>
    </div>
  );
};
