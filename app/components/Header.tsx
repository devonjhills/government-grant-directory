import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-6 px-8 shadow-lg">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-wide hover:opacity-90 transition-colors duration-300">
          Grant Finder
        </Link>
        <nav className="flex flex-wrap justify-end items-center space-x-6 text-base font-semibold">
          <Link
            href="/"
            className="hover:underline transition-colors px-4 py-2 rounded-md hover:bg-primary/20">
            Home
          </Link>
          <Link
            href="/grants"
            className="hover:underline transition-colors px-4 py-2 rounded-md hover:bg-primary/20">
            Search Grants
          </Link>
          <Link
            href="/topics/small-business-grants"
            className="hover:underline transition-colors px-4 py-2 rounded-md hover:bg-primary/20">
            Small Business
          </Link>
          <Link
            href="/topics/nonprofit-funding"
            className="hover:underline transition-colors px-4 py-2 rounded-md hover:bg-primary/20">
            Nonprofit
          </Link>
          <Link
            href="/glossary"
            className="hover:underline transition-colors px-4 py-2 rounded-md hover:bg-primary/20">
            Glossary & FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
