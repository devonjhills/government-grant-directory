import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground text-center py-8 px-6 mt-16 border-t border-border">
      <div className="container mx-auto max-w-4xl">
        <p className="text-sm text-muted-foreground font-light">
          © {new Date().getFullYear()} Grant Finder. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
