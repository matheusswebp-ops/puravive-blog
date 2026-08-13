import { createClient } from "@/lib/supabase/server";
import type { Category, Post, PostWithCategory } from "@/lib/types";

const POST_WITH_CATEGORY = "*, category:categories(*)";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  return data ?? [];
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
