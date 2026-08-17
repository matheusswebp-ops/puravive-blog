import { createClient } from "@/lib/supabase/server";
import type { Category, Post, PostWithCategory } from "@/lib/types";

const POST_WITH_CATEGORY = "*, category:categories(*)";

// O que o blog mostra: publicado, mais agendado cuja hora já chegou.
//
// Não dá pra deixar isso só por conta da regra do banco. A regra esconde de
// visitante anônimo, mas as páginas do site rodam com a sessão de quem está
// no navegador — com o admin logado, elas passavam a enxergar rascunho e
// agendado. O blog ficava diferente pra quem escreve e pra quem lê, e um
// post agendado parecia já estar no ar.
function visibleFilter() {
  const now = new Date().toISOString();
  return `status.eq.publicado,and(status.eq.agendado,published_at.lte.${now})`;
}

export function isPubliclyVisible(post: {
  status: string;
  published_at: string | null;
}) {
  if (post.status === "publicado") return true;
  return (
    post.status === "agendado" &&
    post.published_at !== null &&
    new Date(post.published_at).getTime() <= Date.now()
  );
}

// A ordem do menu vem da coluna position, editável no admin. Antes a
// categoria do topo estava fixada no código.
//
// A coluna só passa a existir depois do supabase/agendamento-e-categorias.sql;
// até lá o banco recusa a ordenação e caímos de volta no nome, pra o menu do
// blog não ficar vazio enquanto a migração não roda.
async function fetchCategoriesOrdered(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Category[]> {
  const byPosition = await supabase
    .from("categories")
    .select("*")
    .order("position")
    .order("name");

  if (!byPosition.error) return (byPosition.data as Category[]) ?? [];

  const byName = await supabase.from("categories").select("*").order("name");
  return (byName.data as Category[]) ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  return fetchCategoriesOrdered(supabase);
}

export async function getCategoriesWithCounts(): Promise<
  (Category & { postCount: number })[]
> {
  const supabase = await createClient();
  const [categories, { data: posts }] = await Promise.all([
    fetchCategoriesOrdered(supabase),
    supabase.from("posts").select("category_id"),
  ]);

  const counts = new Map<string, number>();
  for (const post of posts ?? []) {
    if (post.category_id) {
      counts.set(post.category_id, (counts.get(post.category_id) ?? 0) + 1);
    }
  }

  return categories.map((c) => ({
    ...c,
    postCount: counts.get(c.id) ?? 0,
  }));
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getPostsByCategory(
  categoryId: string,
  limit?: number
): Promise<PostWithCategory[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .eq("category_id", categoryId)
    .or(visibleFilter())
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return (data as PostWithCategory[] | null) ?? [];
}

export async function getHomeFeed(): Promise<{
  featured: PostWithCategory | null;
  grid: PostWithCategory[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .or(visibleFilter())
    .order("published_at", { ascending: false })
    .limit(4);

  const posts = (data as PostWithCategory[] | null) ?? [];
  return {
    featured: posts[0] ?? null,
    grid: posts.slice(1),
  };
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .eq("slug", slug)
    .maybeSingle();

  const post = data as PostWithCategory | null;
  // 404 para rascunho e agendado que ainda não venceu, inclusive para quem
  // está logado: o endereço tem que responder igual para todo mundo.
  if (!post || !isPubliclyVisible(post)) return null;
  return post;
}

export async function getRelatedPosts(
  currentPostId: string,
  categoryId: string | null,
  limit = 3
): Promise<PostWithCategory[]> {
  const supabase = await createClient();

  const { data: sameCategory } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .neq("id", currentPostId)
    .eq("category_id", categoryId ?? "")
    .or(visibleFilter())
    .order("published_at", { ascending: false })
    .limit(limit);

  const results = (sameCategory as PostWithCategory[] | null) ?? [];
  if (results.length >= limit) return results;

  const { data: others } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .neq("id", currentPostId)
    .neq("category_id", categoryId ?? "")
    .or(visibleFilter())
    .order("published_at", { ascending: false })
    .limit(limit - results.length);

  return [...results, ...((others as PostWithCategory[] | null) ?? [])];
}

export async function getAllPublishedPostSlugs(): Promise<
  Pick<Post, "slug" | "updated_at">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .or(visibleFilter());
  return data ?? [];
}

// Vira o status de quem já venceu. A rotina diária faz o mesmo, mas rodar
// isto ao entrar no admin evita a tela dizer "agendado" para um post que já
// está no ar — no editor não dava pra maquiar, o rádio lê o status cru.
export async function publishDueScheduledPosts(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("publicar_agendados");
  return Number(data ?? 0);
}

export async function getAllPostsForAdmin(): Promise<PostWithCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .order("updated_at", { ascending: false });
  return (data as PostWithCategory[] | null) ?? [];
}

export async function getPostById(id: string): Promise<PostWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .eq("id", id)
    .maybeSingle();
  return data as PostWithCategory | null;
}
