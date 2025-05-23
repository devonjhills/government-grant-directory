import { MetadataRoute } from 'next';
// Import your data fetching services if you intend to make parts of the sitemap dynamic.
// For example: import { searchGrants } from '@/app/services/grantsGovService';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.grantfinder.example.com'; // Ensure NEXT_PUBLIC_BASE_URL is set in your .env file

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/grants`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/topics/nonprofit-funding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/topics/small-business-grants`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Example for dynamic grant detail pages:
  // This part is commented out as it requires careful consideration of how many grants to fetch
  // and the potential load on your data sources during the build or request time.
  /*
  let dynamicGrantRoutes: MetadataRoute.Sitemap = [];
  try {
    // Fetch a selection of grants (e.g., most recent, most popular, or all if manageable)
    // const response = await searchGrants({ rows: 200, oppStatuses: 'posted' }); // Example: fetch 200 grants
    // if (response.grants) {
    //   dynamicGrantRoutes = response.grants.map((grant) => ({
    //     url: `${BASE_URL}/grants/${grant.id}`,
    //     lastModified: grant.postedDate ? new Date(grant.postedDate) : new Date(),
    //     changeFrequency: 'daily', // Or based on how often grant details change
    //     priority: 0.6,
    //   }));
    // }
  } catch (error) {
    console.error('Error fetching grants for sitemap:', error);
  }
  */
  
  // return [...staticRoutes, ...dynamicGrantRoutes];
  return staticRoutes; // Returning only static routes for now
}
