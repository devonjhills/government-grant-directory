// Utility for differentiating opportunity types with visual and behavioral distinctions

export type OpportunityType = 'grant' | 'contract' | 'cooperative_agreement' | 'other';

export interface OpportunityTypeConfig {
  type: OpportunityType;
  displayName: string;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    border: string;
    text: string;
  };
  icon: string; // Lucide icon name
  metrics: {
    primaryLabel: string;
    secondaryLabel: string;
    timelineLabel: string;
    eligibilityLabel: string;
  };
  terminology: {
    actionVerb: string; // "Apply for", "Bid on", "Partner with"
    opportunityNoun: string; // "Grant", "Contract", "Agreement"
    successTerm: string; // "Award", "Contract", "Partnership"
  };
}

export const OPPORTUNITY_TYPE_CONFIGS: Record<OpportunityType, OpportunityTypeConfig> = {
  grant: {
    type: 'grant',
    displayName: 'Grant',
    description: 'Financial assistance that generally does not require repayment',
    colorScheme: {
      primary: 'text-green-700',
      secondary: 'text-green-600',
      background: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900'
    },
    icon: 'Gift',
    metrics: {
      primaryLabel: 'Award Amount',
      secondaryLabel: 'Success Rate',
      timelineLabel: 'Review Period',
      eligibilityLabel: 'Eligible Recipients'
    },
    terminology: {
      actionVerb: 'Apply for this',
      opportunityNoun: 'Grant',
      successTerm: 'Award'
    }
  },
  contract: {
    type: 'contract',
    displayName: 'Contract',
    description: 'Procurement opportunity for goods or services',
    colorScheme: {
      primary: 'text-purple-700',
      secondary: 'text-purple-600',
      background: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900'
    },
    icon: 'FileContract',
    metrics: {
      primaryLabel: 'Contract Value',
      secondaryLabel: 'Win Rate',
      timelineLabel: 'Procurement Timeline',
      eligibilityLabel: 'Eligible Contractors'
    },
    terminology: {
      actionVerb: 'Bid on this',
      opportunityNoun: 'Contract',
      successTerm: 'Award'
    }
  },
  cooperative_agreement: {
    type: 'cooperative_agreement',
    displayName: 'Cooperative Agreement',
    description: 'Financial assistance with substantial federal involvement',
    colorScheme: {
      primary: 'text-orange-700',
      secondary: 'text-orange-600',
      background: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900'
    },
    icon: 'Handshake',
    metrics: {
      primaryLabel: 'Funding Amount',
      secondaryLabel: 'Partnership Rate',
      timelineLabel: 'Negotiation Period',
      eligibilityLabel: 'Eligible Partners'
    },
    terminology: {
      actionVerb: 'Partner for this',
      opportunityNoun: 'Cooperative Agreement',
      successTerm: 'Partnership'
    }
  },
  other: {
    type: 'other',
    displayName: 'Other Assistance',
    description: 'Other forms of federal financial assistance',
    colorScheme: {
      primary: 'text-teal-700',
      secondary: 'text-teal-600',
      background: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-900'
    },
    icon: 'LifeBuoy',
    metrics: {
      primaryLabel: 'Program Value',
      secondaryLabel: 'Acceptance Rate',
      timelineLabel: 'Processing Time',
      eligibilityLabel: 'Program Requirements'
    },
    terminology: {
      actionVerb: 'Apply for this',
      opportunityNoun: 'Program',
      successTerm: 'Selection'
    }
  }
};

/**
 * Determine opportunity type from opportunity data
 */
export function getOpportunityType(opportunity: any): OpportunityType {
  const type = opportunity.type?.toLowerCase();
  
  // Direct type mapping
  if (type === 'grant') return 'grant';
  if (type === 'contract' || type === 'procurement') return 'contract';
  if (type === 'cooperative_agreement' || type === 'cooperative agreement') return 'cooperative_agreement';
  
  // Infer from other fields
  const title = opportunity.title?.toLowerCase() || '';
  const description = opportunity.description?.toLowerCase() || '';
  const agency = opportunity.agency?.toLowerCase() || '';
  
  // Contract indicators
  if (title.includes('contract') || title.includes('procurement') || 
      description.includes('contractor') || description.includes('procurement')) {
    return 'contract';
  }
  
  // Cooperative agreement indicators
  if (title.includes('cooperative') || description.includes('cooperative') ||
      description.includes('substantial involvement')) {
    return 'cooperative_agreement';
  }
  
  // Grant indicators (most common, so check last)
  if (title.includes('grant') || description.includes('grant') ||
      opportunity.sourceAPI?.includes('grants.gov')) {
    return 'grant';
  }
  
  // Default fallback
  return 'other';
}

/**
 * Get configuration for an opportunity
 */
export function getOpportunityTypeConfig(opportunity: any): OpportunityTypeConfig {
  const type = getOpportunityType(opportunity);
  return OPPORTUNITY_TYPE_CONFIGS[type];
}

/**
 * Format opportunity-specific metrics
 */
export function formatOpportunityMetrics(opportunity: any, config: OpportunityTypeConfig) {
  const amount = opportunity.amount || 0;
  const formattedAmount = amount > 0 ? 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount) : 'Amount varies';

  return {
    primaryMetric: {
      label: config.metrics.primaryLabel,
      value: formattedAmount,
      description: `${config.displayName} ${config.metrics.primaryLabel.toLowerCase()}`
    },
    deadline: {
      label: 'Application Deadline',
      value: opportunity.deadline ? 
        new Date(opportunity.deadline).toLocaleDateString() : 'Rolling basis',
      description: 'Submit applications by this date'
    },
    agency: {
      label: 'Funding Agency',
      value: opportunity.agency || 'Federal Agency',
      description: `${config.displayName} provided by this agency`
    }
  };
}

/**
 * Get appropriate success terminology for opportunity type
 */
export function getSuccessTerminology(type: OpportunityType) {
  const config = OPPORTUNITY_TYPE_CONFIGS[type];
  return {
    verb: config.terminology.actionVerb,
    noun: config.terminology.opportunityNoun,
    success: config.terminology.successTerm,
    // Success probability language varies by type
    probabilityDescription: type === 'contract' ? 
      'Win probability based on competition analysis' :
      type === 'cooperative_agreement' ?
      'Partnership probability based on program criteria' :
      'Award probability based on historical data'
  };
}

/**
 * Get type-specific competition analysis
 */
export function getTypeSpecificCompetition(opportunity: any, type: OpportunityType) {
  const config = OPPORTUNITY_TYPE_CONFIGS[type];
  
  switch (type) {
    case 'contract':
      return {
        competitionDescription: 'Competitive procurement with multiple bidders',
        successFactors: [
          'Technical capability demonstration',
          'Cost competitiveness',
          'Past performance record',
          'Small business set-aside eligibility'
        ]
      };
    case 'grant':
      return {
        competitionDescription: 'Merit-based selection among qualified applicants',
        successFactors: [
          'Project merit and innovation',
          'Organizational capacity',
          'Budget justification',
          'Alignment with program priorities'
        ]
      };
    case 'cooperative_agreement':
      return {
        competitionDescription: 'Partnership selection with substantial federal involvement',
        successFactors: [
          'Collaborative experience',
          'Shared objectives alignment',
          'Implementation capacity',
          'Partnership commitment'
        ]
      };
    default:
      return {
        competitionDescription: 'Selection based on program-specific criteria',
        successFactors: [
          'Eligibility requirements',
          'Application completeness',
          'Program alignment',
          'Organizational readiness'
        ]
      };
  }
}