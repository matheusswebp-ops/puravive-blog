import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";
import { getCategories } from "@/lib/data";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ViewTracker />
    </>
  );
}
