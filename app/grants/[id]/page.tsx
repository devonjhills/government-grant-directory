import React from 'react';
import type { Metadata } from 'next';
import type { Grant } from '@/types';
import Link from 'next/link';
import { getGrantDetails } from '@/app/services/grantsGovService'; // Import getGrantDetails

interface GrantDetailPageProps {
  params: { id: string };
}

// Base URL for constructing absolute URLs for SEO
const BASE_URL = "https://www.grantfinder.example.com"; // Replace with actual domain in production

export async function generateMetadata({ params }: GrantDetailPageProps): Promise<Metadata> {
  const grant = await getGrantDetails(params.id); // Use real data fetching

  if (!grant) {
    return {
      title: "Grant Not Found",
      description: "The grant you are looking for could not be found.",
    };
  }

  const descriptionSnippet = grant.description.substring(0, 160); // Ensure description is not too long
  const keywords = [...grant.categories, grant.agency, 'government grant', params.id];

  return {
    title: grant.title, // Uses template from layout.tsx
    description: descriptionSnippet,
    keywords: keywords,
    openGraph: {
      title: grant.title,
      description: descriptionSnippet,
      type: 'article',
      url: `${BASE_URL}/grants/${grant.id}`, // Absolute URL
      // images: [ { url: 'some-image-url.jpg' } ] // Optional
    },
  };
}

export default async function GrantDetailPage({ params }: GrantDetailPageProps) {
  const grant = await getGrantDetails(params.id); // Use real data fetching

  if (!grant) {
    return (
      <main style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', textAlign: 'center' }}>
        <p>Grant not found.</p>
        <Link href="/grants">
          Back to Search Results
        </Link>
      </main>
    );
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Assuming USD, adjust if grant data includes currency
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(grant.amount);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "GovernmentGrant",
    "name": grant.title,
    "description": grant.description,
    "url": `${BASE_URL}/grants/${grant.id}`, // Absolute URL
    "provider": {
      "@type": "GovernmentOrganization",
      "name": grant.agency
    },
    "datePosted": grant.postedDate, // Ensure these are ISO 8601 format
    "applicationDeadline": grant.deadline, // Ensure these are ISO 8601 format
    "grantAmount": {
      "@type": "MonetaryAmount",
      "value": grant.amount,
      "currency": "USD" // Assuming USD
    },
    "eligibility": grant.eligibilityCriteria,
    "keywords": grant.categories.join(', ')
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <main style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2.5em', marginBottom: '0.5em' }}>{grant.title}</h1>
          <p style={{ fontSize: '1.1em', color: '#555' }}><strong>Agency:</strong> {grant.agency}</p>
          <p style={{ fontSize: '1em', color: '#555' }}><strong>Opportunity Number:</strong> {grant.opportunityNumber}</p>
          <p style={{ fontSize: '1em', color: '#555' }}><strong>Status:</strong> {grant.opportunityStatus}</p>
        </header>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8em', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Grant Overview</h2>
          <p style={{ lineHeight: '1.7' }}>{grant.description}</p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8em', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Eligibility</h2>
          <p style={{ lineHeight: '1.7' }}>{grant.eligibilityCriteria}</p>
        </section>

        <section style={{ marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.8em', marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Key Information</h2>
          <p><strong>Deadline:</strong> {grant.deadline}</p>
          <p><strong>Posted Date:</strong> {grant.postedDate}</p>
          <p><strong>Funding Amount:</strong> {formattedAmount}</p>
          <p><strong>Categories:</strong> {grant.categories.join(', ')}</p>
          <p><strong>Data Source:</strong> {grant.sourceAPI}</p>
        </section>

        <section style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <a 
            href={grant.linkToApply} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-block', 
              padding: '12px 25px', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px', 
              fontSize: '1.2em',
              fontWeight: 'bold'
            }}
          >
            Apply Here
          </a>
        </section>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link href="/grants">
            &larr; Back to Search Results
          </Link>
        </div>
      </main>
    </>
  );
}
