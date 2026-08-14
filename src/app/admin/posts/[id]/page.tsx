import { notFound } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import PostForm from "@/components/admin/PostForm";
import DeletePostButton from "@/components/admin/DeletePostButton";
import { getCategories, getPostById } from "@/lib/data";
import { updatePost } from "@/app/admin/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [categories, post] = await Promise.all([
    getCategories(),
    getPostById(id),
  ]);

  if (!post) notFound();

  return (
    <>
      <AdminHeader />
      <div className="admin-content">
        <div className="admin-content-head">
          <h1>Editar post</h1>
          <DeletePostButton postId={post.id} />
        </div>
        <PostForm
          categories={categories}
          post={post}
          action={updatePost.bind(null, post.id)}
        />
      </div>
    </>
  );
}
