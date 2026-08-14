import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/lib/data";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

const CATEGORY_BANNERS: Record<string, { src: string; width: number; height: number }> = {
  articulacao: { src: "/categories/articulacao.png", width: 2172, height: 724 },
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ??
      `Artigos sobre ${category.name.toLowerCase()} no blog PuraVive.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [posts, allCategories] = await Promise.all([
    getPostsByCategory(category.id),
    getCategories(),
  ]);

  return (
    <>
      <div className="wrap breadcrumb">
        <Link href="/">Blog</Link>
        <span className="sep">/</span>
        <span className="current">{category.name}</span>
      </div>

      {CATEGORY_BANNERS[slug] ? (
        <section className="category-hero-banner">
          <Image
            src={CATEGORY_BANNERS[slug].src}
            alt={category.name}
            width={CATEGORY_BANNERS[slug].width}
            height={CATEGORY_BANNERS[slug].height}
            priority
          />
          {(category.description || posts.length >= 0) && (
            <div className="wrap category-hero-meta">
              {category.description && (
                <p className="category-hero-lead">{category.description}</p>
              )}
              <p className="category-count">
                {posts.length
                  ? `${posts.length} ${posts.length > 1 ? "artigos" : "artigo"}`
                  : "Em breve"}
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="category-hero">
          <div className="wrap category-hero-inner">
            <span className="pill pill-tag">Categoria</span>
            <h1>{category.name}</h1>
            {category.description && (
              <p className="category-hero-lead">{category.description}</p>
            )}
            <p className="category-count">
              {posts.length
                ? `${posts.length} ${posts.length > 1 ? "artigos" : "artigo"}`
                : "Em breve"}
            </p>
          </div>
        </section>
      )}

      <div className="wrap other-cats">
        <span className="label">Outras áreas:</span>
        {allCategories.map((c) => (
          <Link
            key={c.id}
            className={`pill${c.slug === slug ? " pill-current" : ""}`}
            href={`/categoria/${c.slug}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <section className="posts-wrap wrap">
        <div className="post-grid">
          {posts.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="empty-state">
              <span className="pill pill-tag">Em breve</span>
              <h3>Ainda não temos artigos publicados em {category.name}</h3>
              <p>
                Estamos preparando o conteúdo dessa área. Enquanto isso, dá
                uma olhada nos temas que já estão no ar.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
