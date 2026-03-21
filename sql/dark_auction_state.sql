-- Dark Auction: выполни в Supabase → SQL Editor → Run
-- Ошибка 404 на .../dark_auction_state значит таблицы ещё нет в проекте.

create table if not exists public.dark_auction_state (
  id int primary key default 1,
  slot_key text not null default '',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Стартовая строка (одна на всё приложение)
insert into public.dark_auction_state (id, slot_key, data)
values (1, '', '{}'::jsonb)
on conflict (id) do nothing;

-- Опционально: доступ с anon-ключом (как у твоего клиента в game.js)
alter table public.dark_auction_state enable row level security;

drop policy if exists "dark_auction_state_select_anon" on public.dark_auction_state;
drop policy if exists "dark_auction_state_insert_anon" on public.dark_auction_state;
drop policy if exists "dark_auction_state_update_anon" on public.dark_auction_state;

create policy "dark_auction_state_select_anon"
  on public.dark_auction_state for select
  to anon, authenticated
  using (true);

create policy "dark_auction_state_insert_anon"
  on public.dark_auction_state for insert
  to anon, authenticated
  with check (true);

create policy "dark_auction_state_update_anon"
  on public.dark_auction_state for update
  to anon, authenticated
  using (true)
  with check (true);

-- Если RLS не нужен — можно не включать alter enable row level security
-- и удалить блок с policies (тогда таблица доступна как другие твои таблицы без RLS).
