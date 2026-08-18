import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-normal.woff2", weight: "500 700", style: "normal" },
    { path: "./fonts/fraunces-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});

const worksans = localFont({
  src: [{ path: "./fonts/worksans-normal.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-worksans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.puravive.com.br"),
  title: {
    default: "Blog PuraVive",
    template: "%s · Blog PuraVive",
  },
  description:
    "Conteúdo sobre digestão, articulações, metabolismo, sono, beleza e energia, pra cuidar do corpo inteiro.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${worksans.variable}`}>
      <body className="flex flex-col min-h-screen">{children}</body>
    </html>
  );
}
