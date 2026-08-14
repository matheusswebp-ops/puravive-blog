import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAllPostsForAdmin } from "@/lib/data";

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  agendado: "Agendado",
  publicado: "Publicado",
};

export default async function AdminDashboard() {
  const posts = await getAllPostsForAdmin();

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

        {posts.length === 0 ? (
          <p className="admin-empty">Nenhum post ainda. Crie o primeiro.</p>
        ) : (
          <div className="admin-post-table">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="admin-post-row"
              >
                <span className={`admin-status admin-status-${post.status}`}>
                  {STATUS_LABEL[post.status] ?? post.status}
                </span>
                <span className="admin-post-title">{post.title}</span>
                <span className="admin-post-category">
                  {post.category?.name ?? "Sem categoria"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
