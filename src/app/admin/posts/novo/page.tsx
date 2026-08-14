import AdminHeader from "@/components/admin/AdminHeader";
import PostForm from "@/components/admin/PostForm";
import { getCategories } from "@/lib/data";
import { createPost } from "@/app/admin/actions";

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <>
      <AdminHeader />
      <div className="admin-content">
        <h1>Novo post</h1>
        <PostForm categories={categories} action={createPost} />
      </div>
    </>
  );
}
