"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GrantList from "@/app/components/GrantList";
import type { Grant } from "@/types";

interface FeaturedGrantsCardProps {
  title: string;
  description: string;
  featuredGrants: Grant[];
  featuredError?: string | null;
}

export default function FeaturedGrantsCard({
  title,
  description,
  featuredGrants,
  featuredError = null,
}: FeaturedGrantsCardProps) {
  return (
    <section className="mb-16 shadow-lg border border-border rounded-xl p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {featuredGrants.length === 0 && !featuredError && (
            <p className="text-center text-muted-foreground py-12 text-lg">
              Loading featured grants...
            </p>
          )}
          {featuredError && (
            <p className="text-center text-destructive py-12 text-lg">
              {featuredError}
            </p>
          )}
          {featuredGrants.length > 0 && <GrantList grants={featuredGrants} />}
        </CardContent>
      </Card>
    </section>
  );
}
