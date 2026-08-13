import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a proposta da PuraVive e do blog: suplementação natural e conteúdo pra cuidar do corpo inteiro.",
};

export default async function AboutPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="wrap breadcrumb">
        <Link href="/">Blog</Link>
        <span className="sep">/</span>
        <span className="current">Sobre</span>
      </div>

      <section className="about-hero">
        <div className="wrap about-hero-inner">
          <span className="pill pill-tag">Sobre</span>
          <h1>Cuidado que começa antes do produto.</h1>
          <p className="about-hero-lead">
            A PuraVive nasceu pra oferecer suplementação natural pra quem já
            passou da fase de acreditar em solução mágica e quer entender o
            que realmente funciona no corpo.
          </p>
        </div>
      </section>

      <section className="wrap about-body">
        <p>
          Prisão de ventre, dor nas articulações, sono mais leve, metabolismo
          mais devagar: são queixas comuns depois de uma certa idade, e
          raramente têm uma causa só. Foi pensando nisso que a PuraVive passou
          a desenvolver suplementos naturais voltados pra cada uma dessas
          áreas, em vez de prometer uma fórmula única pra tudo.
        </p>
        <p>
          Esse blog nasceu do mesmo princípio. Antes de vender um produto, a
          gente prefere explicar o que está por trás do problema, porque
          entender o corpo é o primeiro passo pra cuidar dele direito.
        </p>
      </section>

      <section className="wrap pillars-wrap">
        <p className="section-label">O que guia a PuraVive</p>
        <div className="pillars-grid">
          <div className="pillar-card">
            <h3>100% natural</h3>
            <p>
              Fórmulas desenvolvidas com ingredientes naturais, sem depender
              de fórmulas sintéticas pesadas.
            </p>
          </div>
          <div className="pillar-card">
            <h3>Aprovado pela ANVISA</h3>
            <p>
              Todos os produtos têm registro e passam pelos critérios de
              segurança exigidos no Brasil.
            </p>
          </div>
          <div className="pillar-card">
            <h3>Garantia de 365 dias</h3>
            <p>
              Se não sentir diferença, você tem um ano inteiro pra pedir
              reembolso, sem letra miúda.
            </p>
          </div>
          <div className="pillar-card">
            <h3>Suporte antes da compra</h3>
            <p>
              Dúvida sobre qual produto faz sentido pra você? Tem gente de
              verdade pra responder antes de decidir.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap about-body about-body-blog">
        <p className="section-label">Sobre o conteúdo daqui</p>
        <p>
          Os artigos do blog são escritos pela equipe PuraVive com base em
          fontes públicas e no conhecimento acumulado sobre os temas que
          também guiam nossos produtos: digestão, articulações, sono,
          metabolismo, beleza e bem-estar geral.
        </p>
        <p>
          Nada aqui substitui uma consulta médica. A ideia é ajudar você a
          chegar mais informado na conversa com quem cuida da sua saúde, não
          substituir esse cuidado.
        </p>
      </section>

      <section className="wrap about-categories-wrap">
        <p className="section-label">Explore por área</p>
        <div className="pill-row">
          {categories.map((c) => (
            <Link key={c.id} className="pill" href={`/categoria/${c.slug}`}>
              {c.name}
            </Link>
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
