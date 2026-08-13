import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getPostBySlug, getRelatedPosts } from "@/lib/data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      type: "article",
    },
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.category_id);

  return (
    <>
      <div className="wrap breadcrumb">
        <Link href="/">Blog</Link>
        <span className="sep">/</span>
        {post.category && (
          <>
            <Link href={`/categoria/${post.category.slug}`}>
              {post.category.name}
            </Link>
            <span className="sep">/</span>
          </>
        )}
        <span className="current">{post.title}</span>
      </div>

      <div className="wrap article-head">
        {post.category && (
          <Link href={`/categoria/${post.category.slug}`}>
            <span className="pill pill-tag">{post.category.name}</span>
          </Link>
        )}
        <h1>{post.title}</h1>
        <div className="article-meta">
          <span className="author">Equipe PuraVive</span>
          <span className="dot">•</span>
          <span>{formatDate(post.published_at)}</span>
        </div>
      </div>

      {post.cover_image_url && (
        <figure className="article-hero">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            width={1000}
            height={500}
            priority
          />
        </figure>
      )}

      <article
        className="article-body"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />

      {related.length > 0 && (
        <section className="related-wrap wrap">
          <p className="section-label">Continue lendo</p>
          <div className="post-grid">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
