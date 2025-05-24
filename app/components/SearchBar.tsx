"use client"; // Keep this if it uses client-side hooks like useState

import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Verify path
import { Button } from "@/components/ui/button"; // Verify path

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue || "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl items-center space-x-4 mx-auto my-10 px-4 sm:px-0">
      <Input
        type="text"
        placeholder="Enter keyword (e.g., research, education, non-profit)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 rounded-l-md border-r-0 px-4 py-2 text-base"
      />
      <Button
        type="submit"
        className="rounded-r-md px-6 py-2 text-base font-semibold hover:bg-primary/90 transition-colors">
        Search Grants
      </Button>
    </form>
  );
};

export default SearchBar;
