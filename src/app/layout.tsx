import type { Metadata, Viewport } from 'next';
import { Dancing_Script, Nanum_Myeongjo } from 'next/font/google';
import { Analytics } from '@/components/Analytics';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { ogImage } from '@/components/Photo';
import { getSiteData } from '@/lib/data';
import { jsonLd, websiteJsonLd } from '@/lib/seo';
import './globals.css';

// 제목은 얇은 명조, 영문 포인트는 손글씨. 빌드 때 내려받아 사이트에 같이 올린다 (외부 요청 없음).
const myeongjo = Nanum_Myeongjo({ weight: ['400', '700'], subsets: ['latin'], preload: false, variable: '--font-myeongjo', display: 'swap' });
const dancing = Dancing_Script({ weight: ['500', '600'], subsets: ['latin'], variable: '--font-dancing', display: 'swap' });

const { settings } = getSiteData();

export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  // 홈은 키워드를 담은 seo.title, 하위 페이지는 "페이지 | 상호"
  title: { default: settings.seo.title, template: `%s | ${settings.name}` },
  description: settings.seo.description,
  verification: { other: { 'naver-site-verification': settings.seo.naverVerification } },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: settings.name,
    images: ogImage(settings.heroImage) ? [{ url: ogImage(settings.heroImage)!, width: 1200, height: 630 }] : [],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { 'max-image-preview': 'large' } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf6f0' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1917' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${myeongjo.variable} ${dancing.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
          본문으로 건너뛰기
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteJsonLd(getSiteData()))} />
        <SiteHeader />
        <main id="main" className="pb-24">{children}</main>
        <SiteFooter />
        <Analytics gaId={process.env.NEXT_PUBLIC_GA_ID || null} host={process.env.NEXT_PUBLIC_GA_HOST || null} />
      </body>
    </html>
  );
}
