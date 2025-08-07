import { Opportunity, GrantsGovGrant, USAspendingAward } from "@/types";

// NAICS code mapping for industry standardization
export const NAICS_CATEGORIES = {
  "11": "Agriculture, Forestry, Fishing and Hunting",
  "21": "Mining, Quarrying, and Oil and Gas Extraction",
  "22": "Utilities",
  "23": "Construction",
  "31-33": "Manufacturing",
  "42": "Wholesale Trade",
  "44-45": "Retail Trade",
  "48-49": "Transportation and Warehousing",
  "51": "Information",
  "52": "Finance and Insurance",
  "53": "Real Estate and Rental and Leasing",
  "54": "Professional, Scientific, and Technical Services",
  "55": "Management of Companies and Enterprises",
  "56": "Administrative and Support and Waste Management and Remediation Services",
  "61": "Educational Services",
  "62": "Health Care and Social Assistance",
  "71": "Arts, Entertainment, and Recreation",
  "72": "Accommodation and Food Services",
  "81": "Other Services (except Public Administration)",
  "92": "Public Administration",
};

// Federal agency standardization
export const AGENCY_STANDARDIZATION = {
  "Department of Defense": {
    code: "DOD",
    shortName: "DoD",
    category: "Defense",
  },
  "Department of Health and Human Services": {
    code: "HHS",
    shortName: "HHS",
    category: "Health",
  },
  "National Science Foundation": {
    code: "NSF",
    shortName: "NSF",
    category: "Science",
  },
  "Department of Energy": { code: "DOE", shortName: "DOE", category: "Energy" },
  "Department of Education": {
    code: "ED",
    shortName: "DoEd",
    category: "Education",
  },
  "Environmental Protection Agency": {
    code: "EPA",
    shortName: "EPA",
    category: "Environment",
  },
  "National Institutes of Health": {
    code: "NIH",
    shortName: "NIH",
    category: "Health",
  },
  "Small Business Administration": {
    code: "SBA",
    shortName: "SBA",
    category: "Business",
  },
  "Department of Agriculture": {
    code: "USDA",
    shortName: "USDA",
    category: "Agriculture",
  },
  "Department of Transportation": {
    code: "DOT",
    shortName: "DOT",
    category: "Transportation",
  },
  "Department of Commerce": {
    code: "DOC",
    shortName: "DoC",
    category: "Commerce",
  },
  "Department of Justice": {
    code: "DOJ",
    shortName: "DOJ",
    category: "Justice",
  },
  "Department of Homeland Security": {
    code: "DHS",
    shortName: "DHS",
    category: "Security",
  },
  "General Services Administration": {
    code: "GSA",
    shortName: "GSA",
    category: "Administration",
  },
};

// Opportunity type standardization
export const OPPORTUNITY_TYPES = {
  Grant: "grant",
  Contract: "contract",
  Procurement: "procurement",
  "Cooperative Agreement": "cooperative_agreement",
  "Other Transaction Authority": "other",
  SBIR: "grant", // Small Business Innovation Research
  STTR: "grant", // Small Business Technology Transfer
};

// Status standardization
export const STATUS_MAPPING = {
  posted: "open",
  forecasted: "forecasted",
  closed: "closed",
  cancelled: "closed",
  archived: "closed",
  awarded: "closed",
  active: "open",
  inactive: "closed",
};

// Set-aside type standardization for contracts
export const SET_ASIDE_TYPES = {
  SBA: "8(a)",
  "8A": "8(a)",
  HZ: "HubZone",
  HUBZONE: "HubZone",
  SDVOSB: "SDVOSB",
  VOSB: "VOSB",
  WOSB: "WOSB",
  SDB: "Small Disadvantaged Business",
};

// Data enrichment class
export class DataEnrichmentEngine {
  private industryKeywords: Map<string, string[]>;
  private locationCache: Map<
    string,
    { state?: string; city?: string; country?: string }
  >;

  constructor() {
    this.industryKeywords = this.buildIndustryKeywords();
    this.locationCache = new Map();
  }

  // Main standardization method
  standardizeOpportunity(
    sourceData: any,
    sourceType: "grants.gov" | "usaspending.gov" | "state" | "local",
  ): Opportunity {
    switch (sourceType) {
      case "grants.gov":
        return this.standardizeGrantsGov(sourceData);
      case "usaspending.gov":
        return this.standardizeUSASpending(sourceData);
      default:
        return this.standardizeGeneric(sourceData, sourceType);
    }
  }

  // Grants.gov standardization
  private standardizeGrantsGov(grant: GrantsGovGrant): Opportunity {
    const standardized: Opportunity = {
      id: `grants-gov-${grant.id}`,
      title: this.cleanText(grant.title),
      agency: this.standardizeAgency(grant.agency),
      description: this.cleanText(""), // Will be fetched from details API
      eligibilityCriteria: "",
      deadline: this.standardizeDate(grant.closeDate),
      amount: 0, // Will be enriched from details
      linkToApply: `https://grants.gov/web/grants/view-opportunity.html?oppId=${grant.id}`,
      sourceAPI: "Grants.gov",
      opportunityNumber: grant.number,
      opportunityStatus: this.standardizeStatus(grant.oppStatus),
      postedDate: this.standardizeDate(grant.openDate),
      categories: this.extractCategories(grant.title, ""),
      type: "grant",
      jurisdiction: "federal",
      agencyCode: grant.agencyCode,
      cfda: grant.alnist || [],
      lastUpdated: new Date().toISOString(),
    };

    return this.enrichOpportunity(standardized);
  }

  // USAspending.gov standardization
  private standardizeUSASpending(award: any): Opportunity {
    // Handle different possible data structures from USAspending API
    const awardData = award.Award || award;

    // Safely extract award ID with fallbacks
    const awardId =
      awardData?.generated_unique_award_id ||
      awardData?.award_id ||
      awardData?.id ||
      awardData?.piid ||
      `unknown-${Date.now()}`;

    // Safely extract basic fields with null checks
    const description =
      awardData?.description || awardData?.award_description || "Federal Award";
    const agencyName =
      awardData?.awarding_agency_name ||
      awardData?.agency_name ||
      "Federal Agency";
    const amount =
      awardData?.award_amount ||
      awardData?.total_obligation ||
      awardData?.obligation_amount ||
      0;
    const awardType =
      awardData?.award_type || awardData?.type_description || "contract";

    const standardized: Opportunity = {
      id: `usaspending-${awardId}`,
      title: this.cleanText(description),
      agency: this.standardizeAgency(agencyName),
      description: this.cleanText(description),
      eligibilityCriteria:
        "See award documentation for specific eligibility requirements",
      deadline: "", // Historical data, no deadline
      amount:
        typeof amount === "number"
          ? amount
          : parseFloat(amount?.toString() || "0") || 0,
      linkToApply: `https://usaspending.gov/award/${awardId}`,
      sourceAPI: "USAspending.gov",
      opportunityNumber: awardData?.award_id_piid || awardData?.piid || awardId,
      opportunityStatus: "closed", // Historical awards are closed
      postedDate: this.standardizeDate(
        awardData?.award_latest_action_date || awardData?.action_date || null,
      ),
      categories: this.extractCategories("", description),
      type: this.determineOpportunityTypeFromAward(awardType),
      jurisdiction: "federal",
      industryCategories: this.standardizeNAICS(
        awardData?.naics_code ? [awardData.naics_code] : [],
      ),
      performancePeriod: {
        start: this.standardizeDate(
          awardData.period_of_performance_start_date || null,
        ),
        end: this.standardizeDate(
          awardData.period_of_performance_current_end_date || null,
        ),
      },
      placeOfPerformance: {
        city: awardData.place_of_performance_city,
        state: awardData.place_of_performance_state,
        country: "United States",
      },
      lastUpdated: new Date().toISOString(),
    };

    return this.enrichOpportunity(standardized);
  }

  // Generic standardization for state/local sources
  private standardizeGeneric(data: any, sourceType: string): Opportunity {
    const standardized: Opportunity = {
      id: `${sourceType}-${data.id || Math.random().toString(36).substr(2, 9)}`,
      title: this.cleanText(data.title || data.name || ""),
      agency: this.standardizeAgency(data.agency || data.department || ""),
      description: this.cleanText(data.description || ""),
      eligibilityCriteria: data.eligibility || "",
      deadline: this.standardizeDate(
        data.deadline || data.dueDate || data.closeDate,
      ),
      amount: this.extractAmount(
        data.amount || data.value || data.estimatedValue,
      ),
      linkToApply: data.link || data.url || "",
      sourceAPI: sourceType,
      opportunityNumber: data.number || data.id || "",
      opportunityStatus: this.standardizeStatus(data.status || "active"),
      postedDate: this.standardizeDate(data.posted || data.publishDate),
      categories: this.extractCategories(
        data.title || "",
        data.description || "",
      ),
      type: this.determineOpportunityType(data.type, data.category),
      jurisdiction: sourceType === "state" ? "state" : "local",
      lastUpdated: new Date().toISOString(),
    };

    return this.enrichOpportunity(standardized);
  }

  // Enrichment methods
  private enrichOpportunity(opportunity: Opportunity): Opportunity {
    // Add industry categories based on content analysis
    opportunity.industryCategories = this.enrichIndustryCategories(opportunity);

    // Add keywords for better searchability
    opportunity.keywords = this.extractKeywords(opportunity);

    // Determine business size applicability
    opportunity.businessSize = this.determineBusinessSize(opportunity);

    // Calculate search score based on relevance factors
    opportunity.searchScore = this.calculateSearchScore(opportunity);

    return opportunity;
  }

  // Utility methods
  private cleanText(text: string): string {
    if (!text) return "";
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\w\s\-.,!?()]/g, "") // Remove special chars except basic punctuation
      .trim();
  }

  private standardizeAgency(agency: string): string {
    if (!agency) return "";

    const normalized = agency.trim();
    const standardInfo =
      AGENCY_STANDARDIZATION[normalized as keyof typeof AGENCY_STANDARDIZATION];

    return standardInfo ? normalized : agency;
  }

  private standardizeDate(dateStr: string | null): string {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  }

  private standardizeStatus(status: string): string {
    if (!status) return "open";
    return (
      STATUS_MAPPING[status.toLowerCase() as keyof typeof STATUS_MAPPING] ||
      status.toLowerCase()
    );
  }

  private standardizeNAICS(naicsCodes: string[]): string[] {
    return naicsCodes
      .map((code) => {
        const sector = code.substring(0, 2);
        return (
          NAICS_CATEGORIES[sector as keyof typeof NAICS_CATEGORIES] || code
        );
      })
      .filter(Boolean);
  }

  private extractAmount(amountStr: string | number | undefined): number {
    if (!amountStr) return 0;

    if (typeof amountStr === "number") return amountStr;

    // Extract numbers from string, handle currency formatting
    const cleaned = amountStr.toString().replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }

  private extractCategories(title: string, description: string): string[] {
    const content = `${title} ${description}`.toLowerCase();
    const categories: Set<string> = new Set();

    // Technology categories
    if (
      /artificial intelligence|machine learning|ai |ml |data science/i.test(
        content,
      )
    ) {
      categories.add("Artificial Intelligence & Machine Learning");
    }
    if (
      /cybersecurity|cyber security|information security|data protection/i.test(
        content,
      )
    ) {
      categories.add("Cybersecurity");
    }
    if (
      /software|technology|digital|it |information technology/i.test(content)
    ) {
      categories.add("Information Technology");
    }

    // Research categories
    if (/research|study|investigation|scientific|academic/i.test(content)) {
      categories.add("Research & Development");
    }
    if (/health|medical|healthcare|clinical|biomedical/i.test(content)) {
      categories.add("Healthcare & Medical");
    }
    if (/education|training|learning|academic|school/i.test(content)) {
      categories.add("Education & Training");
    }

    // Infrastructure categories
    if (
      /infrastructure|construction|building|facility|renovation/i.test(content)
    ) {
      categories.add("Infrastructure & Construction");
    }
    if (
      /environment|environmental|climate|sustainability|green energy/i.test(
        content,
      )
    ) {
      categories.add("Environmental & Sustainability");
    }
    if (/transportation|transit|highway|aviation|maritime/i.test(content)) {
      categories.add("Transportation");
    }

    return Array.from(categories);
  }

  private extractKeywords(opportunity: Opportunity): string[] {
    const text =
      `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const keywords: Set<string> = new Set();

    // Extract important terms
    const words = text.split(/\s+/).filter((word) => word.length > 3);
    const importantWords = words.filter(
      (word) =>
        !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/.test(word) &&
        /^[a-zA-Z]+$/.test(word),
    );

    importantWords.slice(0, 10).forEach((word) => keywords.add(word));

    // Add agency as keyword
    if (opportunity.agency) {
      keywords.add(opportunity.agency.toLowerCase().replace(/[^a-z]/g, ""));
    }

    return Array.from(keywords);
  }

  private determineBusinessSize(opportunity: Opportunity): string[] {
    const sizes: string[] = ["any-size"]; // Default

    // Check for small business indicators
    if (
      opportunity.setAsideType ||
      /small business|sba|8\(a\)|hubzone|sdvosb|wosb/i.test(
        opportunity.description,
      )
    ) {
      sizes.push("small-business");
    }

    // Check for large business indicators
    if (opportunity.amount > 10000000) {
      // $10M+
      sizes.push("large-business");
    }

    return sizes;
  }

  private calculateSearchScore(opportunity: Opportunity): number {
    let score = 100; // Base score

    // Boost for complete information
    if (opportunity.description.length > 100) score += 10;
    if (opportunity.amount > 0) score += 5;
    if (opportunity.deadline) score += 5;
    if (opportunity.categories.length > 0) score += 10;
    if (opportunity.industryCategories?.length) score += 5;

    // Boost for recent postings
    if (opportunity.postedDate) {
      const postDate = new Date(opportunity.postedDate);
      const daysSincePost =
        (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePost < 30) score += 15;
      else if (daysSincePost < 90) score += 10;
    }

    // Boost for high-value opportunities
    if (opportunity.amount > 1000000) score += 20;
    else if (opportunity.amount > 100000) score += 10;

    return Math.min(score, 200); // Cap at 200
  }

  // Helper methods for specific data extraction
  private determineOpportunityType(
    type?: string,
    baseType?: string,
  ): Opportunity["type"] {
    const typeStr = (type || baseType || "").toLowerCase();

    if (typeStr.includes("grant") || typeStr.includes("funding"))
      return "grant";
    if (typeStr.includes("contract") || typeStr.includes("procurement"))
      return "contract";
    if (typeStr.includes("cooperative")) return "cooperative_agreement";

    return "other";
  }

  private determineOpportunityTypeFromAward(
    awardType: string,
  ): Opportunity["type"] {
    const type = awardType.toLowerCase();

    if (type.includes("grant") || type.includes("assistance")) return "grant";
    if (type.includes("contract") || type.includes("procurement"))
      return "contract";
    if (type.includes("cooperative")) return "cooperative_agreement";

    return "other";
  }

  private standardizeSetAside(setAside?: string): string | undefined {
    if (!setAside) return undefined;
    return (
      SET_ASIDE_TYPES[setAside.toUpperCase() as keyof typeof SET_ASIDE_TYPES] ||
      setAside
    );
  }

  private buildIndustryKeywords(): Map<string, string[]> {
    const map = new Map<string, string[]>();

    map.set("Technology", [
      "software",
      "ai",
      "machine learning",
      "cybersecurity",
      "cloud",
      "data",
    ]);
    map.set("Healthcare", [
      "medical",
      "health",
      "clinical",
      "biomedical",
      "pharmaceutical",
    ]);
    map.set("Research", [
      "research",
      "study",
      "scientific",
      "innovation",
      "development",
    ]);
    map.set("Education", [
      "education",
      "training",
      "learning",
      "academic",
      "curriculum",
    ]);
    map.set("Infrastructure", [
      "construction",
      "infrastructure",
      "facility",
      "building",
    ]);
    map.set("Environmental", [
      "environment",
      "climate",
      "sustainability",
      "green",
      "renewable",
    ]);

    return map;
  }

  private enrichIndustryCategories(opportunity: Opportunity): string[] {
    const existing = opportunity.industryCategories || [];
    const content =
      `${opportunity.title} ${opportunity.description}`.toLowerCase();
    const additional: Set<string> = new Set();

    for (const [category, keywords] of Array.from(this.industryKeywords)) {
      if (keywords.some((keyword) => content.includes(keyword))) {
        additional.add(category);
      }
    }

    return [...existing, ...Array.from(additional)];
  }
}

// Export singleton instance
export const dataEnrichment = new DataEnrichmentEngine();
