import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getHomeFeed } from "@/lib/data";

export default async function HomePage() {
  const { featured, grid } = await getHomeFeed();

  return (
    <>
      <section className="hero">
        <Link href={featured ? `/${featured.slug}` : "/"}>
          <picture>
            <source
              media="(max-width: 620px)"
              srcSet="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/hero-banner-mobile.png"
            />
            <img
              className="hero-banner"
              src="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/hero-banner-v2.png"
              alt="Sua saúde tem várias partes. A gente cuida de todas."
              width={2051}
              height={767}
              fetchPriority="high"
            />
          </picture>
        </Link>
      </section>

      <section className="grid-wrap wrap">
        <p className="section-label">Mais recentes</p>
        <div className="post-grid">
          {featured && <PostCard post={featured} />}
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
