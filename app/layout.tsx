import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.grantfinder.example.com"), // Placeholder URL
  title: {
    default:
      "Government Grant & Procurement Directory - Find Funding & Contract Opportunities",
    template: "%s | Grant & Procurement Directory",
  },
  description:
    "Comprehensive directory of federal, state and local government grants, contracts, and procurement opportunities. Search funding opportunities for small businesses, nonprofits, and researchers. AI-optimized directory with real-time updates from official government APIs.",
  keywords: [
    "government grants",
    "government contracts",
    "procurement opportunities",
    "small business grants",
    "nonprofit grants",
    "federal grants",
    "state grants",
    "federal contracts",
    "government procurement",
    "funding opportunities",
    "research funding",
    "grant search",
    "contract opportunities",
    "tender opportunities",
    "USAspending.gov",
    "Grants.gov",
    "NAICS codes",
    "set aside contracts",
    "8(a) contracts",
    "SDVOSB",
    "WOSB",
    "HubZone",
  ],
  authors: [{ name: "Government Grant & Procurement Directory" }],
  creator: "Government Grant & Procurement Directory",
  publisher: "Government Grant & Procurement Directory",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Government Funding and Procurement",
  classification: "Business Directory",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification tags when available
    // google: "verification_token",
    // yandex: "verification_token",
    // yahoo: "verification_token",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        {
          url: "/feed.xml",
          title: "Grant & Procurement Opportunities RSS Feed",
        },
      ],
    },
  },
  openGraph: {
    title:
      "Government Grant & Procurement Directory - Find Funding & Contract Opportunities",
    description:
      "Comprehensive directory of government grants, contracts, and procurement opportunities from federal, state and local sources. Real-time updates from official APIs.",
    url: "/",
    siteName: "Government Grant & Procurement Directory",
    images: [
      {
        url: "/og-image-main-site.png",
        width: 1200,
        height: 630,
        alt: "Government Grant & Procurement Directory - Funding and Contract Opportunities",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Government Grant & Procurement Directory - Find Funding & Contract Opportunities",
    description:
      "Comprehensive directory of government grants, contracts, and procurement opportunities. Real-time updates from official APIs.",
    images: ["/og-image-main-site.png"],
    creator: "@grantdirectory", // Replace with actual Twitter handle
  },
  appleWebApp: {
    capable: false, // Disabled to avoid deprecated meta tag warning
    title: "Grant & Procurement Directory",
    statusBarStyle: "default",
  },
  other: {
    "application-name": "Government Grant & Procurement Directory",
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#ffffff",
    // AI-specific meta tags for better crawling and understanding
    "ai-content-declaration": "ai-assisted",
    "content-type": "government-funding-directory",
    "data-sources": "Grants.gov,SAM.gov,USAspending.gov,State-APIs,Local-APIs",
    "update-frequency": "daily",
    "content-classification": "public-procurement-data",
  },
};

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  WebSiteStructuredData,
  OrganizationStructuredData,
} from "@/app/components/StructuredData";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.grantfinder.example.com";

  return (
    <html
      lang="en"
      className="h-full bg-background text-foreground antialiased"
    >
      <head>
        <WebSiteStructuredData
          name="Government Grant & Procurement Directory"
          description="Comprehensive directory of federal, state and local government grants, contracts, and procurement opportunities"
          url={baseUrl}
        />
        <OrganizationStructuredData
          name="Government Grant & Procurement Directory"
          description="AI-optimized directory providing real-time access to government funding and procurement opportunities"
          url={baseUrl}
        />
        <link rel="preconnect" href="https://api.grants.gov" />
        <link rel="preconnect" href="https://api.sam.gov" />
        <link rel="preconnect" href="https://api.usaspending.gov" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />

        {/* Fallback styles to prevent complete unstyling */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Fallback critical styles if Tailwind fails to load */
            html { height: 100%; }
            body { 
              height: 100%; 
              margin: 0; 
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #f8fafc;
              color: #334155;
              line-height: 1.6;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            /* Critical layout fallbacks */
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .min-h-full { min-height: 100%; }
            .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .text-4xl { font-size: 2.25rem; }
            .text-xl { font-size: 1.25rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .bg-blue-600 { background-color: #2563eb; }
            .text-white { color: #ffffff; }
            .rounded { border-radius: 0.375rem; }
            .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
          `,
          }}
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      {/* Ensure html and body take full height for sticky footer */}
      <body className="flex flex-col min-h-full font-sans">
        {/* Flex column for sticky footer */}
        <Header />
        <main className="flex-grow container mx-auto py-12 max-w-7xl">
          {/* flex-grow pushes footer down */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
