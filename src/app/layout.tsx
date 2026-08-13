import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCategories } from "@/lib/data";

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
  title: {
    default: "Blog PuraVive",
    template: "%s · Blog PuraVive",
  },
  description:
    "Conteúdo sobre digestão, articulações, metabolismo, sono, beleza e energia — pra cuidar do corpo inteiro.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categories = await getCategories();

  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${worksans.variable}`}>
      <body className="flex flex-col min-h-screen">
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
