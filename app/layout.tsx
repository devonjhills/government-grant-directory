import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.grantfinder.example.com'), // Placeholder URL
  title: {
    default: 'Government Grant Finder - Your Source for Funding Opportunities', // Slightly more descriptive default for homepage
    template: '%s | Grant Finder',
  },
  description: 'Your comprehensive resource for finding federal and state government grants for small businesses, non-profits, and researchers. Search, filter, and apply for funding opportunities.', // Expanded description
  keywords: ['government grants', 'small business grants', 'nonprofit grants', 'federal grants', 'state grants', 'funding opportunities', 'research funding', 'grant search'], // Expanded keywords
  openGraph: { // Site-wide Open Graph defaults, suitable for homepage
    title: 'Government Grant Finder - Your Source for Funding Opportunities',
    description: 'Explore comprehensive listings of government grants to support your projects and initiatives.',
    url: '/', // Root URL
    siteName: 'Grant Finder',
    images: [
      {
        url: '/og-image-default.jpg', // Placeholder for a general site OG image
        width: 1200,
        height: 630,
        alt: 'Grant Finder - Funding Opportunities',
      },
    ],
    type: 'website',
  },
  twitter: { // Site-wide Twitter card defaults
    card: 'summary_large_image',
    title: 'Government Grant Finder - Your Source for Funding Opportunities',
    description: 'Explore comprehensive listings of government grants to support your projects and initiatives.',
    images: ['/og-image-default.jpg'], // Placeholder for a general site OG image
  },
};

import Header from '@/components/Header'; // Adjust path if needed
import Footer from '@/components/Footer'; // Adjust path if needed

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full"> {/* Ensure html and body take full height for sticky footer */}
      <body className="flex flex-col min-h-full"> {/* Flex column for sticky footer */}
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8"> {/* flex-grow pushes footer down */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
