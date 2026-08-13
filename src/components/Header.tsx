"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

export default function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const isCategory = pathname.startsWith("/categoria");
  const isAbout = pathname === "/sobre";

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-mark" href="/">
            <Image
              src="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/logo-puravive.png"
              alt="PuraVive"
              width={110}
              height={22}
              style={{ height: 22, width: "auto" }}
              priority
            />
          </Link>
          <nav className="main-nav">
            <Link href="/" className={isHome ? "active" : ""}>
              Blog
            </Link>
            <Link
              href="/categoria/articulacao"
              className={isCategory ? "active" : ""}
            >
              Categorias
            </Link>
            <Link href="/sobre" className={isAbout ? "active" : ""}>
              Sobre
            </Link>
          </nav>
          <a className="btn-store" href="https://www.puravive.com.br">
            Ver loja
          </a>
          <button
            className={`menu-toggle${menuOpen ? " open" : ""}`}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMenuOpen(false)}
        />
        <nav className="mobile-menu-panel">
          <div className="mobile-menu-head">
            <Link className="brand-mark" href="/">
              <Image
                src="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/logo-puravive.png"
                alt="PuraVive"
                width={110}
                height={22}
                style={{ height: 22, width: "auto" }}
              />
            </Link>
            <button
              className="mobile-menu-close"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="mobile-menu-nav">
            <Link href="/" className={isHome ? "active" : ""}>
              Blog
            </Link>
            <Link
              href="/categoria/articulacao"
              className={isCategory ? "active" : ""}
            >
              Categorias <span className="chev">→</span>
            </Link>
            <Link href="/sobre" className={isAbout ? "active" : ""}>
              Sobre
            </Link>
          </div>
          <p className="mobile-menu-cats-label">Explorar por área</p>
          <div className="mobile-menu-cats">
            {categories.map((c) => (
              <Link key={c.id} className="pill" href={`/categoria/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mobile-menu-foot">
            <a className="btn-store" href="https://www.puravive.com.br">
              Ver loja
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
