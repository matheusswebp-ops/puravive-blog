"use client";

import { deletePost } from "@/app/admin/actions";

export default function DeletePostButton({ postId }: { postId: string }) {
  return (
    <form
      action={deletePost.bind(null, postId)}
      onSubmit={(e) => {
        if (!confirm("Excluir esse post? Não dá pra desfazer.")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="btn-danger">
        Excluir post
      </button>
    </form>
  );
}
