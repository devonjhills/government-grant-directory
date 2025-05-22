import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Government Grant Finder',
    template: '%s | Grant Finder',
  },
  description: 'Your comprehensive resource for finding federal and state government grants for small businesses and non-profits.',
  keywords: ['government grants', 'small business grants', 'nonprofit grants', 'federal grants', 'state grants'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en"> {/* Ensure lang="en" is set */}
      <body>{children}</body>
    </html>
  );
}
