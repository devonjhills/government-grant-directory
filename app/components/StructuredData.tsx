import { Opportunity } from "@/types";

interface WebSiteStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

interface OpportunityStructuredDataProps {
  opportunity: Opportunity;
  url: string;
}

interface OrganizationStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

export function WebSiteStructuredData({
  name,
  description,
  url,
}: WebSiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: name,
    description: description,
    url: url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "DataCatalog",
      name: "Government Funding and Procurement Opportunities",
      description:
        "Comprehensive directory of government grants, contracts, and procurement opportunities",
      publisher: {
        "@type": "Organization",
        name: name,
      },
      dataset: [
        {
          "@type": "Dataset",
          name: "Federal Grants Database",
          description: "Federal grant opportunities from Grants.gov",
          creator: {
            "@type": "Organization",
            name: "Grants.gov",
          },
        },
        {
          "@type": "Dataset",
          name: "Federal Spending Database",
          description:
            "Historical federal awards and spending data from USAspending.gov",
          creator: {
            "@type": "Organization",
            name: "USAspending.gov",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

export function OpportunityStructuredData({
  opportunity,
  url,
}: OpportunityStructuredDataProps) {
  const getOpportunityType = (type: string) => {
    switch (type) {
      case "grant":
        return "GovernmentGrant";
      case "contract":
      case "procurement":
        return "GovernmentContract";
      case "cooperative_agreement":
        return "CooperativeAgreement";
      default:
        return "GovernmentService";
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": getOpportunityType(opportunity.type),
    identifier: opportunity.id,
    name: opportunity.title,
    description: opportunity.description,
    url: url,
    provider: {
      "@type": "GovernmentOrganization",
      name: opportunity.agency,
      identifier: opportunity.agencyCode,
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: opportunity.linkToApply,
      availableLanguage: "English",
    },
    serviceType: opportunity.type,
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    ...(opportunity.amount && {
      offers: {
        "@type": "Offer",
        price: opportunity.amount,
        priceCurrency: "USD",
      },
    }),
    ...(opportunity.deadline && {
      applicationDeadline: opportunity.deadline,
    }),
    ...(opportunity.categories &&
      opportunity.categories.length > 0 && {
        category: opportunity.categories,
      }),
    ...(opportunity.industryCategories &&
      opportunity.industryCategories.length > 0 && {
        industryCode: opportunity.industryCategories,
      }),
    ...(opportunity.contactInfo && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        ...(opportunity.contactInfo.name && {
          name: opportunity.contactInfo.name,
        }),
        ...(opportunity.contactInfo.email && {
          email: opportunity.contactInfo.email,
        }),
        ...(opportunity.contactInfo.phone && {
          telephone: opportunity.contactInfo.phone,
        }),
      },
    }),
    datePosted: opportunity.postedDate,
    validThrough: opportunity.deadline,
    isAccessibleForFree: true,
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

export function OrganizationStructuredData({
  name,
  description,
  url,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: name,
    description: description,
    url: url,
    logo: `${url}/logo.png`,
    sameAs: [
      // Add social media profiles when available
      // "https://twitter.com/grantdirectory",
      // "https://linkedin.com/company/grant-directory"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    serviceType: [
      "Government Grant Directory",
      "Procurement Opportunities Directory",
      "Funding Database",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}
