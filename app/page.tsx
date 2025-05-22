"use client"; // Add "use client" directive

import React, { useState, useEffect } from 'react'; // Import useEffect, useState
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation'; // Import useRouter
import SearchBar from '@/app/components/SearchBar';
import GrantList from '@/app/components/GrantList';
import type { Grant } from '@/types'; // Corrected path if types is at root
import { searchGrants } from '@/app/services/grantsGovService'; // Import searchGrants

// Static metadata can remain as it's suitable for a client component rendering
// primarily static shell content with dynamic data sections.
export const metadata: Metadata = {
  title: 'Search Government Grants', // Will use template: "Search Government Grants | Grant Finder"
  description: 'Find and explore a wide directory of government grants for small businesses and non-profits. Start your search today!',
  keywords: ['grant search', 'funding opportunities', 'small business', 'non-profit', 'government funding'],
  openGraph: {
    title: 'Search Government Grants | Grant Finder', // Explicit full title for OG
    description: 'Find and explore a wide directory of government grants for small businesses and non-profits. Start your search today!',
    type: 'website',
    url: '/' // In a real app, this should be the absolute URL to the homepage
  }
};

export default function HomePage() {
  const router = useRouter();
  const [featuredGrants, setFeaturedGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch a few grants, e.g., 5, with a general keyword or recent status
        const response = await searchGrants({ keyword: "business", rows: 5, oppStatuses: "posted" });
        setFeaturedGrants(response.grants);
      } catch (err) {
        console.error("Failed to fetch featured grants:", err);
        setError("Could not load featured grants.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []); // Empty dependency array to run once on mount

  const handleSearch = (searchTerm: string) => {
    router.push(`/grants?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Welcome to the Government Grant Finder</h1>
        <p style={{ fontSize: '1.1em', color: '#555' }}>
          Your one-stop portal to discover and apply for government grants. 
          Use the search below to find opportunities relevant to your needs.
        </p>
      </header>
      
      <SearchBar onSearch={handleSearch} />
      
      <section style={{ marginTop: '30px' }}>
        <h2>Featured Grants</h2>
        {isLoading ? (
          <p>Loading featured grants...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : featuredGrants.length === 0 ? (
          <p>No featured grants available at the moment.</p>
        ) : (
          <GrantList grants={featuredGrants} />
        )}
      </section>
    </main>
  );
}
