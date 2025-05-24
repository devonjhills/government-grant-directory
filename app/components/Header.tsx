import Link from "next/link";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-wide hover:text-pink-300 transition-colors duration-300">
          Grant Finder
        </Link>
        <nav className="flex flex-wrap justify-end items-center space-x-4 text-base font-medium">
          <Link
            href="/"
            className="hover:text-pink-300 transition-colors px-3 py-2 rounded-md">
            Home
          </Link>
          <Link
            href="/grants"
            className="hover:text-pink-300 transition-colors px-3 py-2 rounded-md">
            Search Grants
          </Link>
          <Link
            href="/topics/small-business-grants"
            className="hover:text-pink-300 transition-colors px-3 py-2 rounded-md">
            Small Business
          </Link>
          <Link
            href="/topics/nonprofit-funding"
            className="hover:text-pink-300 transition-colors px-3 py-2 rounded-md">
            Nonprofit
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
