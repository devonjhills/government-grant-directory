import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-6 px-8 shadow-lg border-b">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-wide hover:opacity-90 transition-all duration-300 hover:scale-105">
          🏛️ Grant Finder
        </Link>
        <nav className="flex flex-wrap justify-end items-center space-x-2 md:space-x-4 text-sm md:text-base font-medium">
          <Link
            href="/"
            className="hover:text-accent-foreground transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm">
            Home
          </Link>
          <Link
            href="/grants"
            className="hover:text-accent-foreground transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm">
            Search Grants
          </Link>
          <Link
            href="/topics/small-business-grants"
            className="hover:text-accent-foreground transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm">
            Small Business
          </Link>
          <Link
            href="/topics/nonprofit-funding"
            className="hover:text-accent-foreground transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm">
            Nonprofit
          </Link>
          <Link
            href="/glossary"
            className="hover:text-accent-foreground transition-all duration-200 px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-sm">
            Glossary & FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
