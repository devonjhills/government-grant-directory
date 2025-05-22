import React, { useState, FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <input
        type="text"
        placeholder="Enter search keyword..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flexGrow: 1 }}
      />
      <button 
        type="submit"
        style={{ padding: '8px 16px', border: 'none', backgroundColor: '#0070f3', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
