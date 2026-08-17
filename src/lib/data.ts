import { createClient } from "@/lib/supabase/server";
import type { Category, Post, PostWithCategory } from "@/lib/types";

const POST_WITH_CATEGORY = "*, category:categories(*)";

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
  return data as PostWithCategory | null;
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
    .order("published_at", { ascending: false })
    .limit(limit);

  const results = (sameCategory as PostWithCategory[] | null) ?? [];
  if (results.length >= limit) return results;

  const { data: others } = await supabase
    .from("posts")
    .select(POST_WITH_CATEGORY)
    .neq("id", currentPostId)
    .neq("category_id", categoryId ?? "")
    .order("published_at", { ascending: false })
    .limit(limit - results.length);

  return [...results, ...((others as PostWithCategory[] | null) ?? [])];
}

export async function getAllPublishedPostSlugs(): Promise<
  Pick<Post, "slug" | "updated_at">[]
> {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("slug, updated_at");
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
