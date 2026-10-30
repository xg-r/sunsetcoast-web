import type { Metadata } from 'next';
import { ogImage } from '@/components/Photo';
import type { SiteData } from './types';

/** 페이지별 title · description · OG(카카오톡 미리보기) */
export function pageMeta(data: SiteData, opts: { title?: string; description?: string; path: string; image?: string }): Metadata {
  const og = ogImage(opts.image ?? data.settings.heroImage) ?? ogImage(data.settings.heroImage);
  const title = opts.title ?? data.settings.seo.title;
  const description = opts.description ?? data.settings.seo.description;
  return {
    title: opts.title,
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: data.settings.name,
      url: opts.path,
      title,
      description,
      images: og ? [{ url: og, width: 1200, height: 630 }] : [],
    },
  };
}

/** <script type="application/ld+json">에 넣을 값. "</script>"가 섞여도 태그가 닫히지 않게 < 를 이스케이프한다 */
export const jsonLd = (v: object) => ({ __html: JSON.stringify(v).replace(/</g, '\\u003c') });

const abs = (data: SiteData, path: string) => data.settings.siteUrl + path;

/** 네이버 플레이스 링크. tab이 review면 방문자 리뷰 탭으로 연다 */
export const naverPlaceUrl = (data: SiteData, tab?: 'review') => {
  const id = data.settings.naverPlaceId;
  if (!id) return null;
  return `https://map.naver.com/p/entry/place/${id}${tab ? `?placePath=%2F${tab}` : ''}`;
};

/** 제휴 숙소 링크. 상대 사이트의 GA4가 유입 경로와 누른 위치를 알 수 있도록 UTM을 붙인다 */
export const partnerUrl = (data: SiteData, placement: 'footer' | 'group_rental') => {
  const base = data.settings.partner.url;
  if (!base) return null;
  const u = new URL(base);
  u.search = new URLSearchParams({ utm_source: 'sunsetcoast', utm_medium: 'referral', utm_campaign: 'partner', utm_content: placement }).toString();
  return u.toString();
};

/** 구조화 데이터: 웹사이트 이름 (구글 검색 결과의 사이트 이름) */
export function websiteJsonLd(data: SiteData) {
  const s = data.settings;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${s.siteUrl}/#website`,
    name: '선셋코스트',
    alternateName: [s.name, s.nameEn],
    url: `${s.siteUrl}/`,
    inLanguage: 'ko-KR',
  };
}

/** 구조화 데이터: 캠핑장 (주소, 전화, 좌표, 반려동물 허용, 시설) */
export function campgroundJsonLd(data: SiteData) {
  const s = data.settings;
  const visible = data.rooms.filter((r) => r.visible);
  const feature = (name: string) => ({ '@type': 'LocationFeatureSpecification', name, value: true });
  return {
    '@context': 'https://schema.org',
    '@type': 'Campground',
    '@id': `${s.siteUrl}/#campground`,
    name: s.name,
    alternateName: s.nameEn,
    description: s.seo.description,
    url: s.siteUrl,
    telephone: s.phone,
    hasMap: naverPlaceUrl(data) ?? `https://map.naver.com/p/search/${encodeURIComponent(s.address)}`,
    amenityFeature: [
      feature('반려견 동반 객실'),
      feature('객실별 개별 화장실'),
      feature('객실별 개별 바베큐 데크'),
      feature('오션뷰'),
      ...data.services.map((sv) => feature(sv.name)),
    ],
    numberOfRooms: visible.length,
    image: ogImage(s.heroImage) ? s.siteUrl + ogImage(s.heroImage) : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '대정읍 노을해안로 232',
      addressLocality: '서귀포시',
      addressRegion: '제주특별자치도',
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng },
    petsAllowed: data.rooms.some((r) => r.visible && r.petsAllowed),
    checkinTime: '15:00',
    checkoutTime: '11:00',
    sameAs: [`https://www.instagram.com/${s.instagram}/`, naverPlaceUrl(data)].filter(Boolean),
  };
}

/** 구조화 데이터: 경로 (홈 > 객실 > 제돌이) */
export function breadcrumbJsonLd(data: SiteData, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: '홈', path: '/' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(data, it.path) })),
  };
}

/** 구조화 데이터: 자주 묻는 질문 */
export function faqJsonLd(data: SiteData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}
