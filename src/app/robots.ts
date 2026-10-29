import type { MetadataRoute } from 'next';
import { getSiteData } from '@/lib/data';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = getSiteData().settings;
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/rooms/compare/'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
