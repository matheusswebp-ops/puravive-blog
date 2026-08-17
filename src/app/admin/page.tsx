import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import PostStatusToggle from "@/components/admin/PostStatusToggle";
import { getAllPostsForAdmin } from "@/lib/data";
import { effectiveStatus } from "@/lib/post-status";
import type { PostStatus } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  agendado: "Agendado",
  publicado: "Publicado",
};

const TABS: { key: PostStatus | "todos"; label: string; empty: string }[] = [
  { key: "todos", label: "Todos", empty: "Nenhum post ainda. Crie o primeiro." },
  { key: "rascunho", label: "Rascunhos", empty: "Nenhum rascunho no momento." },
  { key: "agendado", label: "Agendados", empty: "Nenhum post agendado." },
  {
    key: "publicado",
    label: "Publicados",
    empty: "Nenhum post publicado ainda.",
  },
];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const raw = await getAllPostsForAdmin();
  // Agendado cuja hora chegou já conta como publicado nas abas e na etiqueta.
  const posts = raw.map((p) => ({ ...p, status: effectiveStatus(p) }));

  const active =
    TABS.find((t) => t.key === status)?.key ?? ("todos" as const);

  const count = (key: PostStatus | "todos") =>
    key === "todos"
      ? posts.length
      : posts.filter((p) => p.status === key).length;

  const visible =
    active === "todos" ? posts : posts.filter((p) => p.status === active);

  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <>
      <AdminHeader />
      <div className="admin-content">
        <div className="admin-content-head">
          <h1>Posts</h1>
          <Link className="btn-store" href="/admin/posts/novo">
            Novo post
          </Link>
        </div>

        <nav className="admin-tabs">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === "todos" ? "/admin" : `/admin?status=${tab.key}`}
              className={`admin-tab${tab.key === active ? " admin-tab-active" : ""}`}
            >
              {tab.label}
              <span className="admin-tab-count">{count(tab.key)}</span>
            </Link>
          ))}
        </nav>

        {visible.length === 0 ? (
          <p className="admin-empty">{activeTab.empty}</p>
        ) : (
          <div className="admin-post-table">
            {visible.map((post) => (
              <div key={post.id} className="admin-post-row">
                <span className={`admin-status admin-status-${post.status}`}>
                  {STATUS_LABEL[post.status] ?? post.status}
                </span>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="admin-post-title"
                >
                  {post.title}
                </Link>
                <span className="admin-post-category">
                  {post.category?.name ?? "Sem categoria"}
                </span>
                <PostStatusToggle postId={post.id} status={post.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
