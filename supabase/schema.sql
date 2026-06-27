create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sort_order integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  brand text not null check (brand in ('LG', '삼성')),
  item_name text not null,
  display_name text not null,
  capacity_kg numeric,
  price_tier text,
  ata_price integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, brand, item_name)
);

create table if not exists item_channel_targets (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  channel_id uuid not null references channels(id) on delete cascade,
  target_url text,
  search_keyword text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, channel_id)
);

create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  channel_id uuid not null references channels(id) on delete cascade,
  captured_at timestamptz not null default now(),
  observed_price integer,
  observed_title text,
  observed_url text,
  screenshot_url text,
  status text not null default 'ok',
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_price_snapshots_item_channel_time
on price_snapshots (item_id, channel_id, captured_at desc);

insert into categories (name, description, sort_order)
values ('워시콤보', 'LG/삼성 대표 콤보 모델 채널별 ATA 비교', 1)
on conflict (name) do nothing;

insert into channels (code, name, sort_order, active)
values
  ('coupang', '쿠팡', 1, true),
  ('gmarket', 'G마켓', 2, true),
  ('himart', '하이마트', 3, true),
  ('naver', '네이버쇼핑', 4, false),
  ('danawa', '다나와', 5, false)
on conflict (code) do nothing;

with category as (
  select id from categories where name = '워시콤보'
)
insert into items (category_id, brand, item_name, display_name, capacity_kg, price_tier, ata_price)
select category.id, 'LG', 'WL21...', 'LG 워시콤보 대표모델', 25, 'premium', 2780000 from category
on conflict (category_id, brand, item_name) do nothing;

with category as (
  select id from categories where name = '워시콤보'
)
insert into items (category_id, brand, item_name, display_name, capacity_kg, price_tier, ata_price)
select category.id, '삼성', 'WD25...', '삼성 워시콤보 대표모델', 25, 'premium', 2190000 from category
on conflict (category_id, brand, item_name) do nothing;
