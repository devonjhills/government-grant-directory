import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-t from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 text-center py-8 px-6 mt-16 border-t border-gray-300 dark:border-gray-700">
      <div className="container mx-auto max-w-4xl">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
          © {new Date().getFullYear()} Grant Finder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
