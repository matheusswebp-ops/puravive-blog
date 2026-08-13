import Image from "next/image";
import Link from "next/link";
import type { PostWithCategory } from "@/lib/types";

function readMinutes(publishedAt: string | null) {
  if (!publishedAt) return "";
  const days = Math.max(
    1,
    Math.round((Date.now() - new Date(publishedAt).getTime()) / 86400000)
  );
  if (days === 1) return "há 1 dia";
  if (days < 30) return `há ${days} dias`;
  const months = Math.round(days / 30);
  return months === 1 ? "há 1 mês" : `há ${months} meses`;
}

export default function PostCard({ post }: { post: PostWithCategory }) {
  return (
    <article className="post-card">
      <Link href={`/${post.slug}`}>
        <div className="post-media">
          {post.cover_image_url && (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              width={480}
              height={360}
            />
          )}
        </div>
      </Link>
      <div className="post-body">
        {post.category && (
          <Link href={`/categoria/${post.category.slug}`}>
            <span className="pill pill-tag">{post.category.name}</span>
          </Link>
        )}
        <Link href={`/${post.slug}`}>
          <h3>{post.title}</h3>
        </Link>
        <p>{post.excerpt}</p>
        <div className="meta-row">
          <span>Equipe PuraVive</span>
          <span className="dot">•</span>
          <span>{readMinutes(post.published_at)}</span>
        </div>
        <Link className="read-link" href={`/${post.slug}`}>
          Ler mais <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
