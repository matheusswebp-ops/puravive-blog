export type PostStatus = "rascunho" | "agendado" | "publicado";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  category_id: string | null;
  status: PostStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PostWithCategory = Post & {
  category: Category | null;
};
