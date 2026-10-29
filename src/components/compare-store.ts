'use client';

import { useSyncExternalStore } from 'react';

// 비교함: 최대 3개 객실. 같은 브라우저에서만 유지되는 편의 기능이라 localStorage에 둔다.
const KEY = 'sunsetcoast.compare';
export const COMPARE_MAX = 3;
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 저장이 막힌 브라우저에서는 이 화면에서만 유지 */
  }
  listeners.forEach((l) => l());
}

export function toggleCompare(slug: string): boolean {
  const cur = read();
  if (cur.includes(slug)) return write(cur.filter((s) => s !== slug)), true;
  if (cur.length >= COMPARE_MAX) return false;
  write([...cur, slug]);
  return true;
}

export const clearCompare = () => write([]);

const EMPTY: string[] = [];
export function useCompare(): string[] {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    read,
    () => EMPTY,
  );
}
