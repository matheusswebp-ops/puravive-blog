import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getHomeFeed } from "@/lib/data";

export default async function HomePage() {
  const { featured, grid } = await getHomeFeed();

  return (
    <>
      <section className="hero">
        <Link href={featured ? `/${featured.slug}` : "/"}>
          <Image
            className="hero-banner"
            src="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/hero-banner.webp"
            alt="Sua saúde tem várias partes. A gente cuida de todas."
            width={1920}
            height={712}
            priority
          />
        </Link>
      </section>

      {featured && (
        <section className="featured-wrap wrap">
          <p className="section-label">Em destaque</p>
          <article className="featured-card">
            <Link href={`/${featured.slug}`}>
              <div className="featured-media">
                {featured.cover_image_url && (
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    width={800}
                    height={600}
                  />
                )}
              </div>
            </Link>
            <div className="featured-body">
              {featured.category && (
                <Link href={`/categoria/${featured.category.slug}`}>
                  <span className="pill pill-tag">
                    {featured.category.name}
                  </span>
                </Link>
              )}
              <Link href={`/${featured.slug}`}>
                <h2>{featured.title}</h2>
              </Link>
              <p>{featured.excerpt}</p>
              <div className="meta-row">
                <span>Equipe PuraVive</span>
                <span className="dot">•</span>
                <span>Leitura completa</span>
              </div>
              <Link className="read-link" href={`/${featured.slug}`}>
                Ler artigo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </section>
      )}

      <section className="grid-wrap wrap">
        <p className="section-label">Mais recentes</p>
        <div className="post-grid">
          {grid.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-inner">
          <h2>Leve esse cuidado pro seu dia a dia.</h2>
          <p>Suplementos naturais pensados pra cada área do seu bem-estar.</p>
          <a className="btn-light" href="https://www.puravive.com.br">
            Conhecer os suplementos
          </a>
        </div>
      </section>
    </>
  );
}
