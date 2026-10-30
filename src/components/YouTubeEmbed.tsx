'use client';

import { useState } from 'react';
import { Icon } from './Icon';

/** 유튜브 영상은 첫 로딩을 막지 않도록 썸네일만 보여주고, 눌렀을 때 플레이어를 불러온다 */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-band">
      {on ? (
        <iframe
          title={title}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          className="size-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group size-full" data-track="video_play" data-video={id}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 유튜브 썸네일 (외부 이미지) */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="size-full object-cover" />
          <span className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover:bg-black/30">
            <span className="flex items-center gap-2 rounded-full bg-[#fffaf3]/95 px-4 py-2.5 text-sm font-semibold text-[#2b211c]">
              <Icon name="tv" className="size-4 text-coral" />
              눌러서 영상 보기
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
