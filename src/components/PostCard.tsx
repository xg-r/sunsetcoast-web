import { POST_KIND_LABEL } from '@/lib/posts';
import type { Post } from '@/lib/types';
import { Photo } from './Photo';

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  return (
    <article id={`post-${post.id}`} className={`grid items-center gap-3 card p-3 ${post.image ? 'grid-cols-[6rem_1fr]' : ''}`}>
      {post.image && (
        <div className="aspect-square overflow-hidden rounded-2xl bg-band">
          <Photo k={post.image} alt={post.title} sizes="96px" />
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-0.5 px-1">
        <span className="label">
          {POST_KIND_LABEL[post.kind]} · {post.publishedAt.replaceAll('-', '.')}
        </span>
        <b className="text-[15px]">{post.title}</b>
        <p className={`whitespace-pre-line text-[13px] text-mute ${compact ? 'line-clamp-2' : ''}`}>{post.body}</p>
      </div>
    </article>
  );
}
