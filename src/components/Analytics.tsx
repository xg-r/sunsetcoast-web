'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** 이벤트 기록. GA4 측정 ID가 없으면 아무것도 하지 않는다 (개발 중에는 콘솔에만 남김) */
export function track(name: string, params: Record<string, string> = {}) {
  const payload = { page: location.pathname, ...params };
  if (window.gtag) window.gtag('event', name, payload);
  else if (process.env.NODE_ENV !== 'production') console.info('[track]', name, payload);
}

/**
 * data-track="이벤트명" 이 붙은 링크·버튼의 클릭을 한곳에서 기록한다.
 * 예약·전화 버튼은 서버에서 그린 HTML 그대로 두고, 이 컴포넌트만 브라우저에서 동작한다.
 */
/** GA4 측정 ID는 환경별로 .env.development / .env.production 에서 정한다 (README "환경 변수") */
export function Analytics({ gaId, host }: { gaId: string | null; host: string | null }) {
  useEffect(() => {
    // host가 정해져 있으면 그 도메인에서만 보낸다. 로컬에서 운영 빌드를 띄워도(npm run serve) 운영 통계에 섞이지 않는다
    const onHost = !host || location.hostname === host || location.hostname.endsWith(`.${host}`);
    if (gaId && onHost && !window.gtag) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', gaId);
    }
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-track]');
      if (!el) return;
      const { track: name, ...rest } = el.dataset;
      track(name!, Object.fromEntries(Object.entries(rest).filter(([, v]) => v)) as Record<string, string>);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [gaId, host]);
  return null;
}
