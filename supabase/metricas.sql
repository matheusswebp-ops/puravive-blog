-- Métricas do blog: registro de visitas.
-- Rode este arquivo uma vez no SQL Editor do Supabase.
--
-- Não guarda IP nem nada que identifique a pessoa: o visitor_hash é um hash
-- irreversível de IP + navegador + um sal que muda todo dia, o que permite
-- contar "visitantes únicos do dia" sem saber quem são.

create table if not exists public.page_views (
  id bigserial primary key,
  path text not null,
  post_id uuid references public.posts(id) on delete set null,
  visitor_hash text not null,
  referrer_host text,
  device text,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);
create index if not exists page_views_post_id_idx
  on public.page_views (post_id, created_at desc);

alter table public.page_views enable row level security;

-- Qualquer visitante pode registrar uma visita, mas só isso: não pode ler,
-- editar nem apagar.
drop policy if exists "visitante registra visita" on public.page_views;
create policy "visitante registra visita"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

-- Só quem está logado no admin enxerga os números.
drop policy if exists "admin le metricas" on public.page_views;
create policy "admin le metricas"
  on public.page_views for select
  to authenticated
  using (true);
