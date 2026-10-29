import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[60vh] flex-col items-start justify-center gap-4">
      <span className="eyebrow">404</span>
      <h1 className="h2">찾는 페이지가 없어요</h1>
      <p className="text-mute">주소가 바뀌었거나 없어진 페이지예요.</p>
      <div className="flex gap-2">
        <Link href="/" className="btn btn-primary">홈으로</Link>
        <Link href="/rooms/" className="btn btn-ghost">객실 보기</Link>
      </div>
    </section>
  );
}
