import { createClient } from "@/lib/supabase/server";

// Teto de segurança: acima disso a página passaria a demorar. Se bater, o
// aviso aparece na tela em vez de mostrar número errado em silêncio.
const ROW_LIMIT = 20000;

export type PeriodDays = 7 | 30 | 90;

type ViewRow = {
  created_at: string;
  post_id: string | null;
  path: string;
  visitor_hash: string;
  referrer_host: string | null;
  device: string | null;
};

export type DayPoint = { date: string; label: string; views: number };

export type PostRank = {
  postId: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  visitors: number;
};

export type Metrics = {
  available: boolean;
  truncated: boolean;
  views: number;
  visitors: number;
  previousViews: number;
  perDay: DayPoint[];
  topPosts: PostRank[];
  referrers: { host: string; views: number }[];
  devices: { mobile: number; desktop: number };
  otherPages: { path: string; views: number }[];
};

const EMPTY: Metrics = {
  available: false,
  truncated: false,
  views: 0,
  visitors: 0,
  previousViews: 0,
  perDay: [],
  topPosts: [],
  referrers: [],
  devices: { mobile: 0, desktop: 0 },
  otherPages: [],
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(key: string) {
  const [, month, day] = key.split("-");
  return `${day}/${month}`;
}

export async function getMetrics(days: PeriodDays): Promise<Metrics> {
  const supabase = await createClient();

  const now = Date.now();
  const start = new Date(now - days * 86400_000);
  // A janela anterior, do mesmo tamanho, serve pra dizer se subiu ou caiu.
  const previousStart = new Date(now - days * 2 * 86400_000);

  const { data, error } = await supabase
    .from("page_views")
    .select("created_at, post_id, path, visitor_hash, referrer_host, device")
    .gte("created_at", previousStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(ROW_LIMIT);

  // Tabela ainda não criada no Supabase: a tela mostra as instruções.
  if (error) return EMPTY;

  const rows = (data as ViewRow[] | null) ?? [];
  const startMs = start.getTime();
  const current = rows.filter((r) => new Date(r.created_at).getTime() >= startMs);
  const previous = rows.length - current.length;

  // Um dia por coluna, inclusive os dias sem nenhuma visita — buraco no meio
  // do gráfico é informação, não pode sumir.
  const perDayMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(now - i * 86400_000).toISOString().slice(0, 10);
    perDayMap.set(key, 0);
  }

  const visitors = new Set<string>();
  const postViews = new Map<string, number>();
  const postVisitors = new Map<string, Set<string>>();
  const referrers = new Map<string, number>();
  const pathViews = new Map<string, number>();
  let mobile = 0;
  let desktop = 0;

  for (const row of current) {
    const key = dayKey(row.created_at);
    if (perDayMap.has(key)) perDayMap.set(key, perDayMap.get(key)! + 1);

    visitors.add(row.visitor_hash);
    if (row.device === "mobile") mobile++;
    else desktop++;

    if (row.post_id) {
      postViews.set(row.post_id, (postViews.get(row.post_id) ?? 0) + 1);
      if (!postVisitors.has(row.post_id)) postVisitors.set(row.post_id, new Set());
      postVisitors.get(row.post_id)!.add(row.visitor_hash);
    } else {
      pathViews.set(row.path, (pathViews.get(row.path) ?? 0) + 1);
    }

    if (row.referrer_host) {
      referrers.set(row.referrer_host, (referrers.get(row.referrer_host) ?? 0) + 1);
    }
  }

  let topPosts: PostRank[] = [];
  if (postViews.size > 0) {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, slug, status")
      .in("id", [...postViews.keys()]);

    topPosts = (posts ?? [])
      .map((p) => ({
        postId: p.id as string,
        title: p.title as string,
        slug: p.slug as string,
        status: p.status as string,
        views: postViews.get(p.id as string) ?? 0,
        visitors: postVisitors.get(p.id as string)?.size ?? 0,
      }))
      .sort((a, b) => b.views - a.views);
  }

  return {
    available: true,
    truncated: rows.length >= ROW_LIMIT,
    views: current.length,
    visitors: visitors.size,
    previousViews: previous,
    perDay: [...perDayMap.entries()].map(([date, views]) => ({
      date,
      label: dayLabel(date),
      views,
    })),
    topPosts,
    referrers: [...referrers.entries()]
      .map(([host, views]) => ({ host, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6),
    devices: { mobile, desktop },
    otherPages: [...pathViews.entries()]
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
  };
}
