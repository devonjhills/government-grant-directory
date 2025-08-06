import { NextResponse } from 'next/server';
import { Opportunity } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.grantfinder.example.com';
const SITE_NAME = 'Government Grant & Procurement Directory';
const SITE_DESCRIPTION = 'Latest government grants, contracts, and procurement opportunities';

export async function GET() {
  // In production, this would fetch recent opportunities from the database
  // For now, we'll create a placeholder feed structure
  
  const currentDate = new Date().toISOString();
  const buildDate = new Date().toUTCString();
  
  // Placeholder opportunities - in production, fetch from database
  const opportunities: Partial<Opportunity>[] = [
    // These would be fetched from your data sources
  ];

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME}</title>
    <description>${SITE_DESCRIPTION}</description>
    <link>${BASE_URL}</link>
    <language>en-US</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <managingEditor>noreply@grantdirectory.com (Grant Directory)</managingEditor>
    <webMaster>noreply@grantdirectory.com (Grant Directory)</webMaster>
    <generator>Government Grant &amp; Procurement Directory RSS Generator</generator>
    <category>Government Funding</category>
    <category>Procurement</category>
    <category>Grants</category>
    <category>Contracts</category>
    <ttl>60</ttl>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${BASE_URL}</link>
      <width>144</width>
      <height>144</height>
      <description>Latest government funding opportunities</description>
    </image>
    
    <!-- Placeholder items - in production, these would be dynamically generated -->
    <item>
      <title>RSS Feed Configuration Complete</title>
      <description>The RSS feed for government grants and procurement opportunities is now configured and ready for dynamic content.</description>
      <link>${BASE_URL}</link>
      <guid isPermaLink="false">rss-config-${currentDate}</guid>
      <pubDate>${buildDate}</pubDate>
      <category>System</category>
      <dc:creator>System</dc:creator>
    </item>
    
    ${opportunities.map(opportunity => `
    <item>
      <title><![CDATA[${opportunity.title || 'Opportunity Title'}]]></title>
      <description><![CDATA[${(opportunity.description || 'Opportunity description').substring(0, 300)}...]]></description>
      <link>${BASE_URL}/opportunities/${opportunity.id}</link>
      <guid isPermaLink="true">${BASE_URL}/opportunities/${opportunity.id}</guid>
      <pubDate>${opportunity.postedDate ? new Date(opportunity.postedDate).toUTCString() : buildDate}</pubDate>
      <category>${opportunity.type || 'opportunity'}</category>
      <category>${opportunity.agency || 'Government'}</category>
      ${opportunity.categories?.map(cat => `<category>${cat}</category>`).join('') || ''}
      <dc:creator>${opportunity.agency || 'Government Agency'}</dc:creator>
      ${opportunity.amount ? `<content:encoded><![CDATA[
        <p><strong>Amount:</strong> $${opportunity.amount?.toLocaleString()}</p>
        <p><strong>Agency:</strong> ${opportunity.agency}</p>
        <p><strong>Deadline:</strong> ${opportunity.deadline}</p>
        <p><strong>Description:</strong> ${opportunity.description}</p>
        <p><a href="${opportunity.linkToApply}" target="_blank">Apply Now</a></p>
      ]]></content:encoded>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'CDN-Cache-Control': 'public, max-age=3600',
      'Vercel-CDN-Cache-Control': 'public, max-age=3600',
    },
  });
}