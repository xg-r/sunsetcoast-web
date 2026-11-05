/** 선셋코스트 심볼 — 아치 창 너머 바다로 지는 해. src/app/icon.svg 와 같은 그림 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#e8896b" />
      <path d="M14 58V30a18 18 0 0 1 36 0v28z" fill="#fbf6f0" />
      <path d="M20 44a12 12 0 0 1 24 0z" fill="#a64e30" />
      <path d="M18 49h28M23 54h18" stroke="#52707e" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
