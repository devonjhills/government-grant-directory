import { Opportunity } from '@/types';
import { dataEnrichment } from './data-standardization';

// Enhanced data enrichment following Frey Chu's manual enrichment approach
// and Marcus Campbell's data-driven success strategies

export interface GrantIntelligence {
  successProbability: number; // 0-100 score based on historical data
  competitionLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  averageAwardAmount: number;
  historicalSuccessRate: number;
  typicalApplicationCount: number;
  reviewTimelineEstimate: string; // "4-6 months"
  difficultyScore: number; // 1-10 scale
  similarSuccessfulProjects: string[];
  recommendedApplicantProfile: string;
}

export interface AgencyIntelligence {
  agencyId: string;
  fundingPriorities: string[];
  averageReviewTime: number; // in days
  preferredProjectTypes: string[];
  historicalBudgetTrends: {
    year: number;
    totalFunding: number;
    awardCount: number;
  }[];
  successTips: string[];
  contactInformation: {
    programOfficer?: string;
    email?: string;
    phone?: string;
  };
}

export interface ApplicationReadiness {
  score: number; // 0-100
  missingRequirements: string[];
  recommendedActions: string[];
  estimatedPrepTime: string;
  similarOpportunities: string[];
}

export class EnhancedDataEnrichment {
  private grantIntelligenceCache: Map<string, GrantIntelligence>;
  private agencyIntelligenceCache: Map<string, AgencyIntelligence>;
  private historicalDataCache: Map<string, any[]>;

  constructor() {
    this.grantIntelligenceCache = new Map();
    this.agencyIntelligenceCache = new Map();
    this.historicalDataCache = new Map();
  }

  // Main enhancement method - adds intelligence layer to opportunities
  async enhanceOpportunityWithIntelligence(opportunity: Opportunity): Promise<Opportunity & {
    intelligence?: GrantIntelligence;
    applicationReadiness?: ApplicationReadiness;
  }> {
    // Get grant intelligence
    const intelligence = await this.calculateGrantIntelligence(opportunity);
    
    // Calculate application readiness (would integrate with user profile)
    const readiness = await this.calculateApplicationReadiness(opportunity);

    return {
      ...opportunity,
      intelligence,
      applicationReadiness: readiness,
      // Enhanced search score incorporating intelligence
      searchScore: this.calculateEnhancedSearchScore(opportunity, intelligence),
    };
  }

  // Calculate success probability and competitive intelligence
  private async calculateGrantIntelligence(opportunity: Opportunity): Promise<GrantIntelligence> {
    const cacheKey = `${opportunity.sourceAPI}-${opportunity.opportunityNumber}`;
    
    if (this.grantIntelligenceCache.has(cacheKey)) {
      return this.grantIntelligenceCache.get(cacheKey)!;
    }

    // This would integrate with historical data analysis
    const intelligence: GrantIntelligence = {
      successProbability: await this.calculateSuccessProbability(opportunity),
      competitionLevel: await this.assessCompetitionLevel(opportunity),
      averageAwardAmount: await this.getAverageAwardAmount(opportunity),
      historicalSuccessRate: await this.getHistoricalSuccessRate(opportunity),
      typicalApplicationCount: await this.estimateApplicationCount(opportunity),
      reviewTimelineEstimate: await this.estimateReviewTimeline(opportunity),
      difficultyScore: await this.calculateDifficultyScore(opportunity),
      similarSuccessfulProjects: await this.findSimilarSuccesses(opportunity),
      recommendedApplicantProfile: await this.generateApplicantProfile(opportunity),
    };

    this.grantIntelligenceCache.set(cacheKey, intelligence);
    return intelligence;
  }

  // Success probability based on historical patterns
  private async calculateSuccessProbability(opportunity: Opportunity): Promise<number> {
    let baseScore = 50; // Start with 50%

    // Agency factors
    const agencySuccess = await this.getAgencySuccessRate(opportunity.agency);
    baseScore = (baseScore + agencySuccess) / 2;

    // Amount factors
    if (opportunity.amount > 0) {
      const amountFactor = this.getAmountSuccessFactor(opportunity.amount);
      baseScore *= amountFactor;
    }

    // Time factors (newer opportunities often have higher success rates)
    const timeFactor = this.getTimeFactor(opportunity.postedDate);
    baseScore *= timeFactor;

    // Category factors
    const categoryFactor = await this.getCategorySuccessFactor(opportunity.categories);
    baseScore *= categoryFactor;

    return Math.min(Math.max(Math.round(baseScore), 5), 95); // Keep between 5-95%
  }

  private async assessCompetitionLevel(opportunity: Opportunity): Promise<GrantIntelligence['competitionLevel']> {
    // Factors: Award amount, agency prestige, application requirements
    let competitionScore = 0;

    // Higher amounts = more competition
    if (opportunity.amount > 10000000) competitionScore += 30;
    else if (opportunity.amount > 1000000) competitionScore += 20;
    else if (opportunity.amount > 100000) competitionScore += 10;

    // Popular agencies = more competition
    const competitiveAgencies = ['NSF', 'NIH', 'DOE', 'NASA'];
    if (competitiveAgencies.some(agency => opportunity.agency.includes(agency))) {
      competitionScore += 25;
    }

    // Broad categories = more competition
    if (opportunity.categories.includes('Research & Development')) competitionScore += 15;
    if (opportunity.categories.includes('Information Technology')) competitionScore += 15;

    if (competitionScore >= 60) return 'Very High';
    if (competitionScore >= 40) return 'High';
    if (competitionScore >= 20) return 'Medium';
    return 'Low';
  }

  private async calculateApplicationReadiness(opportunity: Opportunity, userProfile?: any): Promise<ApplicationReadiness> {
    // This would integrate with user profile data
    const readiness: ApplicationReadiness = {
      score: 75, // Default moderate readiness
      missingRequirements: [],
      recommendedActions: [],
      estimatedPrepTime: '2-4 weeks',
      similarOpportunities: [],
    };

    // Analyze requirements vs user capabilities
    readiness.missingRequirements = await this.identifyMissingRequirements(opportunity, userProfile);
    readiness.recommendedActions = await this.generateRecommendedActions(opportunity, userProfile);
    readiness.similarOpportunities = await this.findSimilarOpportunities(opportunity);

    // Calculate score based on readiness factors
    const baseScore = 80;
    const missingPenalty = readiness.missingRequirements.length * 10;
    readiness.score = Math.max(baseScore - missingPenalty, 10);

    return readiness;
  }

  // Helper methods for intelligence calculation
  private async getAgencySuccessRate(agency: string): Promise<number> {
    // Would query historical database for agency-specific success rates
    const agencySuccessRates: { [key: string]: number } = {
      'Department of Defense': 35,
      'National Science Foundation': 25,
      'Department of Energy': 30,
      'Small Business Administration': 45,
      'Department of Education': 40,
    };

    return agencySuccessRates[agency] || 35;
  }

  private getAmountSuccessFactor(amount: number): number {
    if (amount > 10000000) return 0.8; // Very large grants are harder
    if (amount > 1000000) return 0.9;
    if (amount > 100000) return 1.0;
    if (amount > 10000) return 1.1; // Sweet spot
    return 0.95; // Very small grants might have hidden complexity
  }

  private getTimeFactor(postedDate: string): number {
    if (!postedDate) return 1.0;
    
    const posted = new Date(postedDate);
    const daysSince = (Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince < 7) return 1.1; // Fresh opportunities
    if (daysSince < 30) return 1.05;
    if (daysSince > 180) return 0.9; // Older opportunities might be stale
    
    return 1.0;
  }

  private async getCategorySuccessFactor(categories: string[]): Promise<number> {
    const categorySuccessRates: { [key: string]: number } = {
      'Research & Development': 0.85, // Competitive field
      'Healthcare & Medical': 0.9,
      'Information Technology': 0.8, // Very competitive
      'Education & Training': 1.0,
      'Infrastructure & Construction': 1.1,
      'Environmental & Sustainability': 1.05,
    };

    if (categories.length === 0) return 1.0;

    const avgFactor = categories.reduce((sum, cat) => {
      return sum + (categorySuccessRates[cat] || 1.0);
    }, 0) / categories.length;

    return avgFactor;
  }

  private calculateEnhancedSearchScore(opportunity: Opportunity, intelligence: GrantIntelligence): number {
    let score = opportunity.searchScore || 100;

    // Intelligence-based boosts
    score += intelligence.successProbability * 0.5; // Up to 47.5 points
    
    // Competition level adjustments
    const competitionBoosts = {
      'Low': 20,
      'Medium': 10,
      'High': 5,
      'Very High': 0
    };
    score += competitionBoosts[intelligence.competitionLevel];

    // Difficulty adjustments (easier grants get slight boost for accessibility)
    if (intelligence.difficultyScore <= 3) score += 10;
    else if (intelligence.difficultyScore <= 5) score += 5;

    return Math.min(score, 250); // Cap at 250 for enhanced scoring
  }

  // Placeholder methods that would integrate with historical data analysis
  private async getAverageAwardAmount(opportunity: Opportunity): Promise<number> {
    // Would analyze historical awards from same agency/program
    return opportunity.amount || 250000;
  }

  private async getHistoricalSuccessRate(opportunity: Opportunity): Promise<number> {
    // Would calculate from historical application/award data
    return await this.getAgencySuccessRate(opportunity.agency);
  }

  private async estimateApplicationCount(opportunity: Opportunity): Promise<number> {
    // Based on competition level and historical patterns
    const baseEstimates = {
      'Low': 25,
      'Medium': 75,
      'High': 200,
      'Very High': 500
    };
    
    const competition = await this.assessCompetitionLevel(opportunity);
    return baseEstimates[competition];
  }

  private async estimateReviewTimeline(opportunity: Opportunity): Promise<string> {
    // Agency-specific review timelines
    const agencyTimelines: { [key: string]: string } = {
      'National Science Foundation': '6-9 months',
      'Department of Defense': '4-8 months',
      'Small Business Administration': '2-4 months',
      'Department of Energy': '5-7 months',
    };

    return agencyTimelines[opportunity.agency] || '4-6 months';
  }

  private async calculateDifficultyScore(opportunity: Opportunity): Promise<number> {
    let difficulty = 5; // Base difficulty

    // Amount-based difficulty
    if (opportunity.amount > 5000000) difficulty += 2;
    else if (opportunity.amount < 50000) difficulty -= 1;

    // Category-based difficulty
    if (opportunity.categories.includes('Research & Development')) difficulty += 2;
    if (opportunity.categories.includes('Information Technology')) difficulty += 1;

    // Length of description (longer = more complex requirements)
    if (opportunity.description.length > 2000) difficulty += 1;
    if (opportunity.description.length < 500) difficulty -= 1;

    return Math.min(Math.max(difficulty, 1), 10);
  }

  private async findSimilarSuccesses(opportunity: Opportunity): Promise<string[]> {
    // Would search historical successful projects with similar characteristics
    return [
      'NSF SBIR Phase I: Advanced Materials for Energy Storage (2023)',
      'DOE Clean Energy Manufacturing Initiative (2022)',
      'NIH Small Business Research Grant - Medical Devices (2023)'
    ];
  }

  private async generateApplicantProfile(opportunity: Opportunity): Promise<string> {
    // Generate recommended applicant characteristics
    const profiles: { [key: string]: string } = {
      'grant': 'Non-profit organizations, educational institutions, or research organizations with 3+ years experience and demonstrated track record in the field',
      'contract': 'Established businesses with relevant industry experience, appropriate certifications, and proven delivery capabilities',
      'cooperative_agreement': 'Organizations with strong collaborative capabilities and community partnerships'
    };

    return profiles[opportunity.type] || 'Organizations with relevant experience and capacity to execute proposed project';
  }

  // Implementation helpers
  private async identifyMissingRequirements(opportunity: Opportunity, userProfile?: any): Promise<string[]> {
    const requirements: string[] = [];
    
    // Basic requirement analysis
    if (!userProfile?.taxIdNumber) requirements.push('Federal Tax ID Number');
    if (!userProfile?.dunsNumber) requirements.push('DUNS Number');
    if (!userProfile?.samRegistration) requirements.push('SAM.gov Registration');
    
    // Opportunity-specific requirements
    if (opportunity.amount > 100000 && !userProfile?.auditedFinancials) {
      requirements.push('Audited Financial Statements');
    }
    
    if (opportunity.categories.includes('Research & Development') && !userProfile?.researchExperience) {
      requirements.push('Demonstrated Research Experience');
    }

    return requirements;
  }

  private async generateRecommendedActions(opportunity: Opportunity, userProfile?: any): Promise<string[]> {
    const actions: string[] = [];
    
    actions.push('Review full opportunity announcement');
    actions.push('Contact program officer for clarification');
    actions.push('Identify potential project team members');
    actions.push('Develop preliminary budget');
    
    if (opportunity.deadline) {
      const deadline = new Date(opportunity.deadline);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 30) {
        actions.unshift('URGENT: Begin application preparation immediately');
      }
    }

    return actions;
  }

  private async findSimilarOpportunities(opportunity: Opportunity): Promise<string[]> {
    // Would search for similar opportunities based on categories, agency, amount range
    return [
      `${opportunity.agency} - Similar ${opportunity.type} opportunities`,
      `Category: ${opportunity.categories[0]} - Related programs`,
      'Cross-agency opportunities in same field'
    ];
  }
}

// Export singleton instance
export const enhancedDataEnrichment = new EnhancedDataEnrichment();