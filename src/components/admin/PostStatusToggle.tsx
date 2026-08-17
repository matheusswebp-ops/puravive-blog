"use client";

import { useTransition } from "react";
import { setPostStatus } from "@/app/admin/actions";
import type { PostStatus } from "@/lib/types";

export default function PostStatusToggle({
  postId,
  status,
}: {
  postId: string;
  status: PostStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const willPublish = status !== "publicado";

  function handleClick() {
    if (
      !willPublish &&
      !confirm("Tirar esse post do ar? Ele volta a ser um rascunho.")
    ) {
      return;
    }
    startTransition(async () => {
      await setPostStatus(postId, willPublish ? "publicado" : "rascunho");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`admin-row-action${willPublish ? " admin-row-action-publish" : ""}`}
    >
      {isPending ? "Salvando…" : willPublish ? "Publicar" : "Despublicar"}
    </button>
  );
}
