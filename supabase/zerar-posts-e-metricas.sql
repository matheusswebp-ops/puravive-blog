-- Zera o blog: apaga TODOS os posts e TODAS as métricas de acesso.
-- Rode no SQL Editor do Supabase. Só lá: a RLS impede esse apagamento pelo
-- site e pela chave pública, de propósito.
--
-- ATENÇÃO: não tem volta. Confira os números que o primeiro bloco mostra
-- antes de rodar o resto.
--
-- O que NÃO é tocado: categorias, usuários do admin e as imagens no Storage.

-- ---------------------------------------------------------------------------
-- 1. O QUE VAI SER APAGADO (rode sozinho primeiro, só confere)
-- ---------------------------------------------------------------------------
select
  (select count(*) from public.posts)      as posts_que_serao_apagados,
  (select count(*) from public.page_views) as visitas_que_serao_apagadas;

-- ---------------------------------------------------------------------------
-- 2. APAGAR (rode depois de conferir os números acima)
-- ---------------------------------------------------------------------------
-- As visitas saem primeiro: page_views aponta pra posts, e apagar na ordem
-- contrária deixaria as linhas com post_id nulo em vez de sumirem.
begin;

delete from public.page_views;
delete from public.posts;

commit;

-- ---------------------------------------------------------------------------
-- 3. CONFERIR (as duas contas têm que voltar zero)
-- ---------------------------------------------------------------------------
select
  (select count(*) from public.posts)      as posts_restantes,
  (select count(*) from public.page_views) as visitas_restantes;
