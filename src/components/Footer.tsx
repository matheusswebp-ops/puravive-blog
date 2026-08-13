import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="brand-mark" href="/">
          <Image
            src="https://ierdkwezlsxkknjzokyy.supabase.co/storage/v1/object/public/covers/logo-puravive.png"
            alt="PuraVive"
            width={110}
            height={22}
            style={{ height: 22, width: "auto" }}
          />
        </Link>
        <nav className="footer-nav">
          <Link href="/categoria/articulacao">Categorias</Link>
          <Link href="/sobre">Sobre</Link>
          <a href="mailto:contato@puravive.com.br">Contato</a>
          <a href="https://www.puravive.com.br">Ver loja</a>
        </nav>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} PuraVive. Conteúdo informativo. Não
        substitui orientação médica.
      </p>
    </footer>
  );
}
