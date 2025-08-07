import React from "react";
import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary/50 text-secondary-foreground border-t border-border mt-20">
      <div className="container mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground pt-4 pb-2">
              🏛️ Grant Finder
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your gateway to federal funding opportunities. Search thousands of
              grants from Grants.gov to find the perfect match for your
              organization.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider pt-4 pb-2">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/grants"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Search All Grants
              </Link>
              <Link
                href="/topics/small-business-grants"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Small Business Grants
              </Link>
              <Link
                href="/topics/nonprofit-funding"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Nonprofit Funding
              </Link>
              <Link
                href="/glossary"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Glossary & FAQ
              </Link>
            </nav>
          </div>

          {/* Data Source */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider pt-4 pb-2">
              Data Source
            </h4>
            <div className="space-y-3">
              <a
                href="https://www.grants.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span>Grants.gov</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <p className="text-xs text-muted-foreground">
                Official U.S. government site for federal grant opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Grant Finder. Built with Next.js,
            TypeScript, and Tailwind CSS.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-red-500" /> for grant
            seekers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
