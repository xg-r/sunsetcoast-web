'use client';

import { useState } from 'react';
import { Icon } from './Icon';

/** 지도는 첫 로딩을 막지 않도록 눌렀을 때만 불러온다 (API 키가 필요 없는 구글 지도 임베드) */
export function MapEmbed({ query, lat, lng }: { query: string; lat: number; lng: number }) {
  const [on, setOn] = useState(false);
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-band md:aspect-[16/7]">
      {on ? (
        <iframe
          title="선셋코스트 위치 지도"
          src={`https://www.google.com/maps?q=${lat},${lng}(${encodeURIComponent(query)})&z=15&output=embed`}
          className="size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="flex size-full flex-col items-center justify-center gap-2 text-mute">
          <Icon name="map" className="size-8 text-coral" />
          <span className="text-sm font-medium text-ink">눌러서 지도 보기</span>
          <span className="text-xs">데이터를 아끼려고 지도는 누를 때 불러와요</span>
        </button>
      )}
    </div>
  );
}
