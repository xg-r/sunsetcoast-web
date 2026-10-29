'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import { track } from './Analytics';

// 카카오톡 공유: 휴대폰에서는 시스템 공유 시트(Web Share API)에 카카오톡이 나온다.
// 카카오 JavaScript SDK는 앱 키 등록이 필요해서 쓰지 않는다. 미리보기는 페이지의 OG 태그로 나온다.
// 공유 시트가 없는 PC에서는 링크를 복사한다.
export function ShareButton({ title, text, room }: { title: string; text?: string; room?: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = location.href.split('#')[0];
    track('share_click', { room: room ?? '' });
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* 사용자가 공유 시트를 닫음 */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      prompt('링크를 복사해 주세요', url);
    }
  }
  return (
    <button type="button" onClick={share} className="btn btn-ghost relative w-[2.875rem] px-0" aria-label="카카오톡 등으로 공유하기">
      <Icon name="share" />
      {copied && (
        <span role="status" className="absolute bottom-full right-0 mb-2 rounded-full bg-ink px-3 py-1 text-xs font-medium text-bg">
          링크를 복사했어요
        </span>
      )}
    </button>
  );
}
