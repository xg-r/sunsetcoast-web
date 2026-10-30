import type { MediaAppearance } from '@/lib/types';
import { Icon } from './Icon';
import { YouTubeEmbed } from './YouTubeEmbed';

/** JTBC 〈끝사랑〉 */
export const programLabel = (m: MediaAppearance) => `${m.broadcaster} 〈${m.program}〉`;

/** 2024-10-10 → 2024년 10월 10일 */
const dateLabel = (d: string) => `${d.slice(0, 4)}년 ${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일`;

/** 캠핑장이 나온 방송 목록 (소개 페이지) */
export function MediaAppearances({ media }: { media: MediaAppearance[] }) {
  return (
    <ul className="grid gap-8 md:grid-cols-2 md:gap-6">
      {media.map((m) => (
        <li key={m.id} className="flex flex-col gap-3">
          {m.youtubeId && <YouTubeEmbed id={m.youtubeId} title={`${programLabel(m)} ${m.episode ?? ''}`.trim()} />}
          <div className="flex flex-col gap-1.5">
            <p className="text-[12.5px] text-mute">
              {[m.episode, `${dateLabel(m.airedAt)} 방송`].filter(Boolean).join(' · ')}
            </p>
            <h3 className="font-display text-lg font-bold">{programLabel(m)}</h3>
            <p className="text-[14.5px] leading-relaxed">{m.summary}</p>
            {m.youtubeId && (
              <a href={`https://www.youtube.com/watch?v=${m.youtubeId}`} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-coral" data-track="video_youtube_click" data-video={m.youtubeId}>
                유튜브에서 보기
                <Icon name="next" className="size-3.5" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
