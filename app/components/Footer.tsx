import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground text-center py-10 px-8 mt-20 border-t border-border">
      <div className="container mx-auto max-w-7xl">
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          © {new Date().getFullYear()} Grant Finder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
