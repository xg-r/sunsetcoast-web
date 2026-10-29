'use client';

import { useEffect, useState } from 'react';

/**
 * 오늘 노을 시각. 백엔드 GET {NEXT_PUBLIC_API_BASE_URL}/sunset-time 에서 받아 그대로 보여준다 (계약: docs/api/sunset-time.md).
 * 캐시는 백엔드가 관리한다. 프론트는 캐시하지 않고 화면에 들어올 때마다 조회한다.
 * 받지 못하면(주소 없음, 4초 초과, 오류 응답, 형식 오류) 이 영역을 숨긴다. 나머지 화면은 영향을 받지 않는다.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const TIMEOUT_MS = 4000;

interface Day { date: string; sunset: string }
interface SunsetResponse { today: Day; tomorrow: Day }
type State =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ok'; time: string; today: boolean; left: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const isDay = (d: unknown): d is Day =>
  !!d && typeof d === 'object' && DATE.test((d as Day).date) && TIME.test((d as Day).sunset);

/** 백엔드가 준 날짜·시각(한국 시간)을 시점으로 */
const at = (d: Day) => new Date(`${d.date}T${d.sunset}:00+09:00`).getTime();

async function fetchSunset(): Promise<SunsetResponse> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_BASE_URL 없음');
  const r = await fetch(`${API_BASE}/sunset-time`, { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) });
  console.log('r', r);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (!isDay(j?.today) || !isDay(j?.tomorrow)) throw new Error('응답 형식이 계약과 다름');
  return j;
}

/** 오늘 해가 아직 안 졌으면 오늘, 졌으면 내일 값을 보여준다 */
function toState({ today, tomorrow }: SunsetResponse, now = Date.now()): State {
  const showToday = at(today) > now;
  const day = showToday ? today : tomorrow;
  const mins = Math.max(0, Math.round((at(day) - now) / 6e4));
  const left = !showToday
    ? '오늘 노을은 졌어요. 내일 노을도 같이 봐요'
    : mins < 60
      ? `${mins}분 뒤, 데크에서 노을 볼 시간이에요`
      : `${Math.floor(mins / 60)}시간 ${mins % 60}분 뒤, 데크에서 노을 볼 시간이에요`;
  return { status: 'ok', time: day.sunset, today: showToday, left };
}

export function SunsetTime() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    fetchSunset()
      .then((data) => {
        if (!alive) return;
        setState(toState(data));
        // 남은 시간 문구만 1분마다 다시 계산한다 (다시 조회하지 않음)
        timer = setInterval(() => setState(toState(data)), 60_000);
      })
      .catch((e) => {
        if (process.env.NODE_ENV !== 'production') console.info('[sunset-time]', e.message);
        if (alive) setState({ status: 'unavailable' });
      });
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (state.status === 'unavailable') return null;

  const ok = state.status === 'ok';
  return (
    <div className="flex flex-col gap-1" aria-live="polite" aria-busy={!ok}>
      <span className="flex items-baseline gap-2">
        <span className="eyebrow">{!ok || state.today ? "Today's sunset" : "Tomorrow's sunset"}</span>
        <span className="text-xs text-mute">{!ok || state.today ? '오늘 노을' : '내일 노을'}</span>
      </span>
      <span className={`font-display text-[4.5rem] font-normal leading-none tracking-tight tabular-nums text-coral md:text-[6rem] ${ok ? '' : 'opacity-30'}`}>
        {ok ? state.time : '--:--'}
      </span>
      <span className="min-h-[1.5em] text-sm text-mute">{ok ? state.left : ''}</span>
    </div>
  );
}
