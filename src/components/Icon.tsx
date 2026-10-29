// 선 아이콘. 외부 아이콘 폰트 없이 SVG를 직접 넣어 첫 로딩을 가볍게 한다.
const PATHS: Record<string, string> = {
  toilet: '<path d="M6 3h7v7H6zM4 10h15a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6zM9 16l-1 5h8l-1-5"/>',
  shower: '<path d="M5 21V8a4 4 0 0 1 7.5-2M10 8h7a3.5 3.5 0 0 0-7 0M11 12v1M14 12v1M17 12v1M12 15v1M15 15v1"/>',
  bath: '<path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
  spa: '<path d="M3 15h18M5 15a7 4 0 0 0 14 0M8 11c0-2 2-2 2-4M12 11c0-2 2-2 2-4M16 11c0-2 2-2 2-4"/>',
  deck: '<path d="M2 14h20M4 14v6M20 14v6M2 10h20M6 10V6h12v4"/>',
  grill: '<path d="M4 10h16a8 8 0 0 1-16 0zM8 18l-2 4M16 18l2 4M9 3c1 1.5-1 2.5 0 4M13 3c1 1.5-1 2.5 0 4"/>',
  wave: '<path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 20c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M7 9c2-4 7-5 10-2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>',
  child: '<circle cx="8" cy="6" r="3"/><circle cx="17" cy="10" r="2"/><path d="M3 21v-3a5 5 0 0 1 10 0v3M14 21v-2a3 3 0 0 1 6 0v2"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z"/>',
  ruler: '<path d="M3 16 16 3l5 5L8 21zM7 12l2 2M10 9l2 2M13 6l2 2"/>',
  bed: '<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="11" r="1.6"/>',
  paw: '<circle cx="6.5" cy="10" r="1.8"/><circle cx="10.5" cy="6" r="1.8"/><circle cx="15.5" cy="7" r="1.8"/><circle cx="18.5" cy="11.5" r="1.8"/><path d="M8 17.5c0-3 2.5-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 2-2 2.5-4.5 2.5S8 19.5 8 17.5z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  snow: '<path d="M12 2v20M4 7l16 10M20 7 4 17M9 3l3 2 3-2M9 21l3-2 3 2"/>',
  flame: '<path d="M12 22a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6z"/>',
  tv: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
  fridge: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 9h12M9 5v2M9 12v3"/>',
  micro: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M5 8h10v8H5zM18 9v1M18 13v1"/>',
  kettle: '<path d="M6 20h12l-1-10a5 5 0 0 0-10 0zM17 12l3-2M9 5h6"/>',
  induction: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.5"/>',
  pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM2 10h20M10 6h4"/>',
  knife: '<path d="M4 20 16 8l2 2-9 9zM16 8l3-3a1.4 1.4 0 0 1 2 2l-3 3"/>',
  table: '<path d="M3 8h18M6 8v12M18 8v12M6 14h12"/>',
  sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 18v2M19 18v2"/>',
  mirror: '<ellipse cx="12" cy="9" rx="6" ry="7"/><path d="M12 16v5M8 21h8"/>',
  dryer: '<path d="M4 9a5 5 0 0 1 10 0 5 5 0 0 1-10 0zM14 7h6v4h-6M10 14l-1 7h3l1-7"/>',
  bottle: '<path d="M9 2h6M10 2v4l-2 3v12h8V9l-2-3V2M8 13h8"/>',
  towel: '<path d="M5 4h14v4H5zM6 8v12h12V8M9 14h6"/>',
  lamp: '<path d="M8 3h8l3 8H5zM12 11v8M8 21h8"/>',
  speaker: '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="14" r="3.5"/><circle cx="12" cy="6.5" r="1"/>',
  picnic: '<path d="M3 9h18M6 9l-2 11M18 9l2 11M8 14h8M9 9l-1 5M15 9l1 5"/>',
  ext: '<path d="M9 8h6v13H9zM12 8V4h4M10 4h2M15 6l3-1"/>',
  alarm: '<circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 2M5 4 2 7M19 4l3 3"/>',
  sun: '<circle cx="12" cy="15" r="4"/><path d="M2 19h20M12 5v3M5 9l2 2M19 9l-2 2M2 15h2M20 15h2"/>',
  bike: '<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M9 8h3M15 8l-3 8"/>',
  box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = '', label }: { name: string; className?: string; label?: string }) {
  // 크기 클래스를 따로 주지 않으면 기본 20px
  const size = /(^|\s)size-/.test(className) ? '' : 'size-5 ';
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 fill-none stroke-current ${size}${className}`}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? PATHS.info }}
    />
  );
}
