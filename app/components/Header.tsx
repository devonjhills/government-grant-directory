import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold"> {/* Adjusted text size for responsiveness */}
          Grant Finder
        </Link>
        <nav className="flex flex-wrap justify-end items-center space-x-2 sm:space-x-4 text-sm sm:text-base"> {/* Added flex-wrap and responsive text/spacing */}
          <Link href="/" className="hover:text-secondary transition-colors px-2 py-1"> {/* Added padding for better touch targets */}
            Home
          </Link>
          <Link href="/grants" className="hover:text-secondary transition-colors px-2 py-1">
            Search Grants
          </Link>
          <Link href="/topics/small-business-grants" className="hover:text-secondary transition-colors px-2 py-1">
            Small Business
          </Link>
          <Link href="/topics/nonprofit-funding" className="hover:text-secondary transition-colors px-2 py-1">
            Nonprofit
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
