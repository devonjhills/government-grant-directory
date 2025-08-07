"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue || "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
          <Input
            type="text"
            placeholder="Search grants by keyword (e.g., research, education, small business, nonprofit)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search grants by keyword"
            className="pl-12 pr-32 py-6 text-lg rounded-lg border-2 border-border focus:border-primary transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
          <Button
            type="submit"
            aria-label="Search grants"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold">Grants.gov</span> • Search thousands of federal grants
        </p>
      </div>
    </div>
  );
};

export default SearchBar;
