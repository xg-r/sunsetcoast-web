import { BookingDock } from '@/components/BookingDock';
import { PostCard } from '@/components/PostCard';
import { getSiteData } from '@/lib/data';
import { activePosts } from '@/lib/posts';
import { pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = pageMeta(data, { title: '소식', description: '선셋코스트의 공지, 이벤트, 돌고래 소식.', path: '/news/' });

export default function NewsPage() {
  const posts = activePosts(data);
  return (
    <>
      <section className="wrap flex flex-col gap-6 pt-6">
        <div>
          <span className="eyebrow">news</span>
          <h1 className="h2 mt-1">소식</h1>
          <p className="mt-2 text-[14px] text-mute">공지, 이벤트, 그리고 바다 앞에서 만난 돌고래 이야기를 전해요.</p>
        </div>
        {posts.length ? (
          <div className="grid gap-3 md:grid-cols-2">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        ) : (
          <p className="rounded-3xl border border-dashed border-line p-8 text-center text-sm text-mute">
            아직 올라온 소식이 없어요. 인스타그램{' '}
            <a href={`https://www.instagram.com/${data.settings.instagram}/`} target="_blank" rel="noopener" className="text-coral underline" data-track="insta_click" data-placement="news">@{data.settings.instagram}</a>
            에서 요즘 모습을 볼 수 있어요.
          </p>
        )}
      </section>
      <BookingDock />
    </>
  );
}
