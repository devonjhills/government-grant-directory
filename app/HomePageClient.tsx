"use client";

import React, { useState } from "react"; // Removed useEffect
import { useRouter } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import GrantList from "@/app/components/GrantList";
import type { Grant } from "@/types";
// Removed searchGrants import, it's not used here anymore

// mockGrantsData is removed from here, will be passed from server or handled by server if API fails

interface HomePageClientProps {
  initialFeaturedGrants: Grant[];
  initialError?: string | null;
}

export default function HomePageClient({
  initialFeaturedGrants,
  initialError,
}: HomePageClientProps) {
  const router = useRouter();
  const [featuredGrants, setFeaturedGrants] = useState<Grant[]>(
    initialFeaturedGrants
  );
  const [error, setError] = useState<string | null>(initialError || null);
  // Set loading to true only if no initial data/error is provided,
  // though with server-side fetching, this might always be false on initial load.
  // This primarily handles cases where client-side fetching might still be a fallback (not in this refactor's scope).
  const [isLoading, setIsLoading] = useState<boolean>(
    initialFeaturedGrants.length === 0 && !initialError
  );

  // useEffect for data fetching has been removed.

  const handleSearch = (searchTerm: string) => {
    router.push(`/grants?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    // Main container: Replaced inline styles with Tailwind classes
    <main className="container mx-auto px-6 py-12 max-w-5xl">
      {/* Header section: Styled using Tailwind typography and spacing */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-4 leading-tight">
          Welcome to the Government Grant Finder
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Your one-stop portal to discover and apply for government grants. Use
          the search below to find opportunities relevant to your needs.
        </p>
      </header>

      {/* SearchBar: Already refactored, integrates here. It has its own margins. */}
      <SearchBar onSearch={handleSearch} />

      {/* Featured Grants Section: Styled h2 and loading/error states */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">
          Featured Grants
        </h2>
        {isLoading ? (
          <p className="text-center text-gray-500">
            Loading featured grants...
          </p>
        ) : error ? (
          <p className="text-center text-red-600 font-medium">{error}</p>
        ) : featuredGrants.length > 0 ? (
          <GrantList grants={featuredGrants} />
        ) : (
          // Fallback to mock data if API fails but no error state was set for this case before,
          // now ensuring it's explicitly handled or removed if mock data isn't desired on API error.
          // If there was an error (initialError was passed), it shows the error.
          // If initialFeaturedGrants is empty and no error, GrantList will show "No grants found."
          // The direct rendering of mockGrantsData on error is now handled by the server component passing it as initialFeaturedGrants.
          <GrantList grants={featuredGrants} />
        )}
      </section>
    </main>
  );
}
