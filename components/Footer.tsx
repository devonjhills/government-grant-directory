"use client";

import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted/50 border-border/40 text-center py-6 px-4 mt-12 border-t">
      <div className="container mx-auto">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Grant Finder. All rights reserved.
        </p>
        {/* Optional: Add other links here */}
      </div>
    </footer>
  );
};

export default Footer;
