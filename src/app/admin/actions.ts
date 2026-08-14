"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type PostFormState = { error: string | null; savedAt?: number };

function readPostFields(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const status = String(formData.get("status") || "rascunho");

  return {
    title,
    slug: rawSlug ? slugify(rawSlug) : slugify(title),
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    content_html: String(formData.get("content_html") || ""),
    cover_image_url: String(formData.get("cover_image_url") || "") || null,
    category_id: String(formData.get("category_id") || "") || null,
    status,
    published_at:
      status === "publicado"
        ? new Date().toISOString()
        : status === "agendado"
          ? String(formData.get("scheduled_at") || "") || null
          : null,
    meta_title: String(formData.get("meta_title") || "").trim() || null,
    meta_description:
      String(formData.get("meta_description") || "").trim() || null,
    product_name: String(formData.get("product_name") || "").trim() || null,
    product_image_url:
      String(formData.get("product_image_url") || "") || null,
    product_description:
      String(formData.get("product_description") || "").trim() || null,
    product_url: String(formData.get("product_url") || "").trim() || null,
  };
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login de novo." };

  const fields = readPostFields(formData);
  if (!fields.title) return { error: "Título é obrigatório." };
  if (!fields.slug) return { error: "Não foi possível gerar o link do post." };

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...fields, author_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um post com esse link. Mude o título ou o link." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin/posts/${data.id}`);
}

export async function updatePost(
  postId: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada, faça login de novo." };

  const fields = readPostFields(formData);
  if (!fields.title) return { error: "Título é obrigatório." };
  if (!fields.slug) return { error: "Não foi possível gerar o link do post." };

  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", postId)
    .maybeSingle();

  const { error } = await supabase
    .from("posts")
    .update(fields)
    .eq("id", postId);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um post com esse link. Mude o título ou o link." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/${fields.slug}`);
  if (existing?.slug && existing.slug !== fields.slug) {
    revalidatePath(`/${existing.slug}`);
  }
  redirect("/admin");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  await supabase.from("posts").delete().eq("id", postId);

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}
