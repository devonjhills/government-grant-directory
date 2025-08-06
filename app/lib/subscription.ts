// B2B Subscription and Feature Management System

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number; // Monthly price in cents
  yearlyPrice: number; // Yearly price in cents (usually discounted)
  features: string[];
  limits: {
    searchesPerMonth: number;
    savedOpportunities: number;
    emailAlerts: number;
    apiCalls?: number;
    exportLimit?: number;
    advancedFilters: boolean;
    prioritySupport: boolean;
    customReports: boolean;
    bulkExport: boolean;
    apiAccess: boolean;
  };
  popular?: boolean;
  enterprise?: boolean;
}

export interface UserSubscription {
  userId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  usage: {
    searchesThisMonth: number;
    savedOpportunities: number;
    emailAlertsUsed: number;
    apiCallsThisMonth?: number;
    exportsThisMonth?: number;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  organizationType?: 'small-business' | 'large-business' | 'nonprofit' | 'government' | 'academic' | 'other';
  role?: 'individual' | 'team-member' | 'admin';
  subscription?: UserSubscription;
  preferences: {
    emailNotifications: boolean;
    weeklyDigest: boolean;
    industryAlerts: string[];
    agencyAlerts: string[];
    keywordAlerts: string[];
  };
  createdAt: Date;
  lastActive: Date;
}

// Subscription tier definitions
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free Explorer',
    price: 0,
    yearlyPrice: 0,
    features: [
      'Basic opportunity search',
      'View opportunity details',
      'Up to 50 searches per month',
      'Save up to 10 opportunities',
      'Email alerts (1 active)',
      'Basic filters',
    ],
    limits: {
      searchesPerMonth: 50,
      savedOpportunities: 10,
      emailAlerts: 1,
      advancedFilters: false,
      prioritySupport: false,
      customReports: false,
      bulkExport: false,
      apiAccess: false,
    },
  },
  {
    id: 'professional',
    name: 'Professional Researcher',
    price: 4900, // $49/month
    yearlyPrice: 47040, // $39/month when paid yearly (20% discount)
    features: [
      'Unlimited opportunity search',
      'Advanced filtering and sorting',
      'Save up to 500 opportunities',
      'Up to 10 email alerts',
      'Weekly opportunity digest',
      'Export to CSV/Excel',
      'Priority email support',
      'Historical data access',
    ],
    limits: {
      searchesPerMonth: -1, // Unlimited
      savedOpportunities: 500,
      emailAlerts: 10,
      exportLimit: 1000,
      advancedFilters: true,
      prioritySupport: true,
      customReports: false,
      bulkExport: true,
      apiAccess: false,
    },
    popular: true,
  },
  {
    id: 'business',
    name: 'Business Intelligence',
    price: 14900, // $149/month
    yearlyPrice: 143040, // $119/month when paid yearly (20% discount)
    features: [
      'Everything in Professional',
      'Unlimited saved opportunities',
      'Unlimited email alerts',
      'Custom opportunity reports',
      'Advanced analytics dashboard',
      'API access (10,000 calls/month)',
      'Bulk export (up to 10,000 records)',
      'Phone support',
      'Team collaboration (up to 5 users)',
    ],
    limits: {
      searchesPerMonth: -1,
      savedOpportunities: -1,
      emailAlerts: -1,
      exportLimit: 10000,
      apiCalls: 10000,
      advancedFilters: true,
      prioritySupport: true,
      customReports: true,
      bulkExport: true,
      apiAccess: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Solutions',
    price: 49900, // $499/month
    yearlyPrice: 479040, // $399/month when paid yearly (20% discount)
    features: [
      'Everything in Business',
      'Unlimited API access',
      'Custom integrations',
      'Dedicated account manager',
      'Custom data feeds',
      'White-label options',
      'Advanced security features',
      'SLA guarantee',
      'Unlimited team members',
      'Custom training sessions',
    ],
    limits: {
      searchesPerMonth: -1,
      savedOpportunities: -1,
      emailAlerts: -1,
      exportLimit: -1,
      apiCalls: -1,
      advancedFilters: true,
      prioritySupport: true,
      customReports: true,
      bulkExport: true,
      apiAccess: true,
    },
    enterprise: true,
  },
];

export class SubscriptionManager {
  // Check if user can perform an action based on their subscription
  static canPerformAction(
    user: User,
    action: 'search' | 'save' | 'alert' | 'export' | 'api' | 'advanced_filter' | 'custom_report',
    count?: number
  ): { allowed: boolean; reason?: string; upgradeRequired?: string } {
    if (!user.subscription || user.subscription.status !== 'active') {
      // Treat as free tier
      const freeTier = SUBSCRIPTION_TIERS.find(t => t.id === 'free')!;
      return this.checkActionAgainstTier(freeTier, user.subscription?.usage || this.getDefaultUsage(), action, count);
    }

    const tier = SUBSCRIPTION_TIERS.find(t => t.id === user.subscription!.tierId);
    if (!tier) {
      return { allowed: false, reason: 'Invalid subscription tier' };
    }

    return this.checkActionAgainstTier(tier, user.subscription.usage, action, count);
  }

  private static checkActionAgainstTier(
    tier: SubscriptionTier,
    usage: UserSubscription['usage'],
    action: string,
    count?: number
  ): { allowed: boolean; reason?: string; upgradeRequired?: string } {
    switch (action) {
      case 'search':
        if (tier.limits.searchesPerMonth === -1) return { allowed: true };
        if (usage.searchesThisMonth >= tier.limits.searchesPerMonth) {
          return {
            allowed: false,
            reason: `Monthly search limit of ${tier.limits.searchesPerMonth} reached`,
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      case 'save':
        const currentSaved = usage.savedOpportunities || 0;
        const newTotal = currentSaved + (count || 1);
        if (tier.limits.savedOpportunities === -1) return { allowed: true };
        if (newTotal > tier.limits.savedOpportunities) {
          return {
            allowed: false,
            reason: `Saved opportunities limit of ${tier.limits.savedOpportunities} would be exceeded`,
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      case 'alert':
        const currentAlerts = usage.emailAlertsUsed || 0;
        const newAlerts = currentAlerts + (count || 1);
        if (tier.limits.emailAlerts === -1) return { allowed: true };
        if (newAlerts > tier.limits.emailAlerts) {
          return {
            allowed: false,
            reason: `Email alerts limit of ${tier.limits.emailAlerts} would be exceeded`,
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      case 'export':
        if (!tier.limits.bulkExport) {
          return {
            allowed: false,
            reason: 'Bulk export not available in your plan',
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        const currentExports = usage.exportsThisMonth || 0;
        const requestedExports = count || 1;
        if (tier.limits.exportLimit === -1) return { allowed: true };
        if (currentExports + requestedExports > tier.limits.exportLimit!) {
          return {
            allowed: false,
            reason: `Monthly export limit of ${tier.limits.exportLimit} would be exceeded`,
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      case 'api':
        if (!tier.limits.apiAccess) {
          return {
            allowed: false,
            reason: 'API access not available in your plan',
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        const currentApiCalls = usage.apiCallsThisMonth || 0;
        const requestedCalls = count || 1;
        if (tier.limits.apiCalls === -1) return { allowed: true };
        if (currentApiCalls + requestedCalls > tier.limits.apiCalls!) {
          return {
            allowed: false,
            reason: `Monthly API limit of ${tier.limits.apiCalls} would be exceeded`,
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      case 'advanced_filter':
        if (!tier.limits.advancedFilters) {
          return {
            allowed: false,
            reason: 'Advanced filters not available in your plan',
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      case 'custom_report':
        if (!tier.limits.customReports) {
          return {
            allowed: false,
            reason: 'Custom reports not available in your plan',
            upgradeRequired: this.getNextTier(tier.id),
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }

  private static getNextTier(currentTierId: string): string {
    const tierOrder = ['free', 'professional', 'business', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTierId);
    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
      return 'enterprise';
    }
    return tierOrder[currentIndex + 1];
  }

  private static getDefaultUsage(): UserSubscription['usage'] {
    return {
      searchesThisMonth: 0,
      savedOpportunities: 0,
      emailAlertsUsed: 0,
      apiCallsThisMonth: 0,
      exportsThisMonth: 0,
    };
  }

  // Track usage for a user action
  static async trackUsage(
    userId: string,
    action: 'search' | 'save' | 'alert' | 'export' | 'api',
    count = 1
  ): Promise<void> {
    // This would update the user's usage in the database
    // For now, we'll just log it
    console.log(`User ${userId} performed ${action} (count: ${count})`);
  }

  // Get subscription tier by ID
  static getTier(tierId: string): SubscriptionTier | undefined {
    return SUBSCRIPTION_TIERS.find(t => t.id === tierId);
  }

  // Get all available tiers
  static getAllTiers(): SubscriptionTier[] {
    return SUBSCRIPTION_TIERS;
  }

  // Calculate usage percentage for a user
  static calculateUsagePercentages(user: User): Record<string, number> {
    if (!user.subscription) {
      const freeTier = SUBSCRIPTION_TIERS.find(t => t.id === 'free')!;
      return this.calculateTierUsage(freeTier, this.getDefaultUsage());
    }

    const tier = SUBSCRIPTION_TIERS.find(t => t.id === user.subscription!.tierId);
    if (!tier) return {};

    return this.calculateTierUsage(tier, user.subscription!.usage);
  }

  private static calculateTierUsage(tier: SubscriptionTier, usage: UserSubscription['usage']): Record<string, number> {
    const percentages: Record<string, number> = {};

    if (tier.limits.searchesPerMonth > 0) {
      percentages.searches = (usage.searchesThisMonth / tier.limits.searchesPerMonth) * 100;
    }

    if (tier.limits.savedOpportunities > 0) {
      percentages.saved = (usage.savedOpportunities / tier.limits.savedOpportunities) * 100;
    }

    if (tier.limits.emailAlerts > 0) {
      percentages.alerts = (usage.emailAlertsUsed / tier.limits.emailAlerts) * 100;
    }

    if (tier.limits.apiCalls && tier.limits.apiCalls > 0) {
      percentages.api = ((usage.apiCallsThisMonth || 0) / tier.limits.apiCalls) * 100;
    }

    if (tier.limits.exportLimit && tier.limits.exportLimit > 0) {
      percentages.exports = ((usage.exportsThisMonth || 0) / tier.limits.exportLimit) * 100;
    }

    return percentages;
  }

  // Check if subscription is expired or needs renewal
  static needsRenewal(subscription: UserSubscription): boolean {
    const now = new Date();
    return subscription.currentPeriodEnd < now && subscription.status !== 'active';
  }

  // Check if user is in trial period
  static isInTrial(subscription: UserSubscription): boolean {
    if (!subscription.trialEnd) return false;
    return new Date() < subscription.trialEnd && subscription.status === 'trialing';
  }

  // Get days remaining in current period
  static getDaysRemaining(subscription: UserSubscription): number {
    const now = new Date();
    const end = subscription.trialEnd && subscription.status === 'trialing' 
      ? subscription.trialEnd 
      : subscription.currentPeriodEnd;
    
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Export default usage tracking functions
export const canPerformAction = SubscriptionManager.canPerformAction;
export const trackUsage = SubscriptionManager.trackUsage;
export const getTier = SubscriptionManager.getTier;
export const getAllTiers = SubscriptionManager.getAllTiers;