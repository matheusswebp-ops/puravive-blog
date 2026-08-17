import { publishDueScheduledPosts } from "@/lib/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Toda entrada no admin acerta o status de quem já venceu, para lista e
  // editor nunca discordarem do que o blog está mostrando.
  await publishDueScheduledPosts();

  return <div className="admin-shell">{children}</div>;
}
