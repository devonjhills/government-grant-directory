"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Search, Award, Users } from "lucide-react";
import SearchBar from "@/app/components/SearchBar";
import GrantList from "@/app/components/GrantList";
import type { Grant } from "@/types";

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
  const [isLoading, setIsLoading] = useState<boolean>(
    initialFeaturedGrants.length === 0 && !initialError
  );

  const handleSearch = (searchTerm: string) => {
    router.push(`/grants?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <main className="max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-6xl md:text-7xl font-extrabold text-primary mb-6 leading-tight">
            Grant Finder
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover federal funding opportunities with ease. Search, filter, and find the perfect grants for your organization.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex flex-col items-center p-6 bg-white/50 rounded-xl border border-border/50">
              <Search className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground text-center">
                Find grants by keyword, category, or agency
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/50 rounded-xl border border-border/50">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Real-time Data</h3>
              <p className="text-sm text-muted-foreground text-center">
                Direct integration with Grants.gov API
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/50 rounded-xl border border-border/50">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Federal Grants</h3>
              <p className="text-sm text-muted-foreground text-center">
                Access thousands of government opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mb-20">
        <SearchBar onSearch={handleSearch} />
      </section>

      {/* Featured Grants Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Opportunities
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover the latest grant opportunities available now
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive font-medium text-lg mb-4">{error}</p>
            <p className="text-muted-foreground">
              Please try refreshing the page or searching for grants directly.
            </p>
          </div>
        ) : featuredGrants.length > 0 ? (
          <GrantList grants={featuredGrants} />
        ) : (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No featured grants available at the moment.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
