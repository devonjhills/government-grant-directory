"use client"; // Keep this if it uses client-side hooks like useState

import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Verify path
import { Button } from "@/components/ui/button"; // Verify path

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl items-center space-x-3 mx-auto my-8">
      <Input
        type="text"
        placeholder="Enter keyword (e.g., research, education, non-profit)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 rounded-l-md border-r-0 focus:ring-2 focus:ring-pink-400"
      />
      <Button
        type="submit"
        className="rounded-r-md bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 text-white">
        Search Grants
      </Button>
    </form>
  );
};

export default SearchBar;
