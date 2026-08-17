-- Rode este arquivo uma vez no SQL Editor do Supabase.
-- Ele faz duas coisas: faz o agendamento de posts funcionar de verdade e
-- libera o gerenciamento de categorias pelo admin.

-- ---------------------------------------------------------------------------
-- 1. AGENDAMENTO
-- ---------------------------------------------------------------------------
-- Até aqui, um post "agendado" nunca ia ao ar: nada virava o status e o
-- visitante só enxerga "publicado". Esta política resolve a visibilidade no
-- minuto exato — assim que a hora marcada chega, o post aparece no blog,
-- sem depender de nenhuma rotina ter rodado.

drop policy if exists "agendado vencido e publico" on public.posts;
create policy "agendado vencido e publico"
  on public.posts for select
  to anon
  using (
    status = 'agendado'
    and published_at is not null
    and published_at <= now()
  );

-- E esta função arruma o status depois, pro banco e o admin não ficarem
-- dizendo "agendado" para um post que já está no ar. É security definer para
-- rodar sem precisar da chave de serviço: a única coisa que ela faz é a
-- transição que já deveria ter acontecido, então é inofensiva mesmo se
-- chamada por qualquer um.
create or replace function public.publicar_agendados()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  afetados integer;
begin
  update public.posts
     set status = 'publicado'
   where status = 'agendado'
     and published_at is not null
     and published_at <= now();
  get diagnostics afetados = row_count;
  return afetados;
end;
$$;

grant execute on function public.publicar_agendados() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. CATEGORIAS
-- ---------------------------------------------------------------------------
-- Ordem do menu do blog. Antes a categoria fixada no topo estava escrita no
-- código ("articulacao"); agora é um número que você controla pelo admin.
alter table public.categories
  add column if not exists position integer not null default 100;

update public.categories set position = 0 where slug = 'articulacao';

-- Sem estas políticas o admin não consegue criar nem editar categoria
-- nenhuma: a RLS bloqueia toda escrita. Visitante anônimo continua só lendo.
drop policy if exists "admin gerencia categorias" on public.categories;
create policy "admin gerencia categorias"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);
