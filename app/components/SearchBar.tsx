"use client"; // Keep this if it uses client-side hooks like useState

import React, { useState } from 'react';
import { Input } from '@/components/ui/input'; // Verify path
import { Button } from '@/components/ui/button'; // Verify path

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl items-center space-x-2 mx-auto my-8"> {/* Increased max-w and added margin */}
      <Input
        type="text"
        placeholder="Enter keyword (e.g., research, education, non-profit)" // Updated placeholder
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1" // Input takes available space
      />
      <Button type="submit">Search Grants</Button> {/* More specific button text */}
    </form>
  );
};

export default SearchBar;
