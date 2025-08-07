import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-sm border-b">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide hover:opacity-90 transition-opacity"
        >
          🏛️ Grant Finder
        </Link>
        <nav className="flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/"
            className="text-primary-foreground hover:bg-white/10 transition-colors px-3 py-2 rounded-md"
          >
            Home
          </Link>
          <Link
            href="/grants"
            className="text-primary-foreground hover:bg-white/10 transition-colors px-3 py-2 rounded-md"
          >
            Search Grants
          </Link>
          <Link
            href="/topics/small-business-grants"
            className="text-primary-foreground hover:bg-white/10 transition-colors px-3 py-2 rounded-md"
          >
            Small Business
          </Link>
          <Link
            href="/topics/nonprofit-funding"
            className="text-primary-foreground hover:bg-white/10 transition-colors px-3 py-2 rounded-md"
          >
            Nonprofit
          </Link>
          <Link
            href="/glossary"
            className="text-primary-foreground hover:bg-white/10 transition-colors px-3 py-2 rounded-md"
          >
            Glossary & FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
