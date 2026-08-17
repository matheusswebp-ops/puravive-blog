import type { PostStatus } from "@/lib/types";

// Um post agendado cuja hora já passou está no ar (quem libera é a política
// de RLS), mesmo que a rotina diária ainda não tenha acertado o status. O
// admin precisa mostrar a verdade, não o que está gravado na coluna.
export function effectiveStatus(post: {
  status: PostStatus;
  published_at: string | null;
}): PostStatus {
  if (
    post.status === "agendado" &&
    post.published_at &&
    new Date(post.published_at).getTime() <= Date.now()
  ) {
    return "publicado";
  }
  return post.status;
}
