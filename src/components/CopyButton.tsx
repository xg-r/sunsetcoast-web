'use client';

import { useState } from 'react';
import { Icon } from './Icon';

export function CopyButton({ text, label = '복사' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      prompt('복사해 주세요', text);
    }
  }
  return (
    <button type="button" onClick={copy} className="btn btn-ghost min-h-10 shrink-0 px-3 text-[13px]" aria-live="polite">
      <Icon name={done ? 'check' : 'copy'} className="size-4" />
      {done ? '복사했어요' : label}
    </button>
  );
}
