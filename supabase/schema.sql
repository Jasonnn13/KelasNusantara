-- Supabase schema for KelasNusantara
-- Run this in Supabase SQL editor (or supabase CLI)

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists moddatetime schema public; -- for updated_at trigger

-- Enums
create type public.user_role as enum ('student','maestro','admin');
create type public.enrollment_status as enum ('pending','active','cancelled');
create type public.class_level as enum ('beginner','intermediate','advanced');

-- Profiles (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maestros (specialized profile)
create table if not exists public.maestros (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  region text,
  discipline text,
  bio text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories
create table if not exists public.categories (
  id bigserial primary key,
  slug text unique not null,
  name text not null
);

-- Classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id bigint references public.categories(id) on delete set null,
  maestro_id uuid not null references public.maestros(id) on delete cascade,
  description text,
  thumbnail_url text,
  price_cents integer not null default 0,
  currency char(3) not null default 'IDR',
  level public.class_level not null default 'beginner',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- basic search
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description,'')), 'B')
  ) stored
);

create index if not exists classes_maestro_idx on public.classes (maestro_id);
create index if not exists classes_category_idx on public.classes (category_id);
create index if not exists classes_published_idx on public.classes (published);
create index if not exists classes_search_idx on public.classes using gin (search);

-- Enrollments
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (user_id, class_id)
);
create index if not exists enrollments_user_idx on public.enrollments (user_id);
create index if not exists enrollments_class_idx on public.enrollments (class_id);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (user_id, class_id)
);

-- Favorites
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, class_id)
);

-- Utility: auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger maestros_updated_at before update on public.maestros
for each row execute function public.touch_updated_at();
create trigger classes_updated_at before update on public.classes
for each row execute function public.touch_updated_at();

-- View: public classes joined
create or replace view public.v_classes as
select c.id,
       c.title,
       c.description,
       c.thumbnail_url,
       c.price_cents,
       c.currency,
       c.level,
       c.published,
       c.created_at,
       m.id as maestro_id,
       m.display_name as maestro_name,
       m.region as maestro_region,
       m.discipline as maestro_discipline,
       m.photo_url as maestro_photo_url,
       cat.name as category,
       cat.slug as category_slug
from public.classes c
left join public.maestros m on m.id = c.maestro_id
left join public.categories cat on cat.id = c.category_id
where c.published is true;

-- RLS
alter table public.profiles enable row level security;
alter table public.maestros enable row level security;
alter table public.categories enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone" on public.profiles
for select using (true);
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
for insert with check (auth.uid() = id);

-- Maestros policies
create policy "Maestros readable by everyone" on public.maestros for select using (true);
create policy "User can upsert own maestro row" on public.maestros
for insert with check (auth.uid() = id);
create policy "Maestro can update own row" on public.maestros
for update using (auth.uid() = id);

-- Categories: read-all, write-admin (simplified: restrict to service role)
create policy "Categories readable by everyone" on public.categories for select using (true);

-- Classes policies
create policy "Classes readable by everyone" on public.classes for select using (true);
create policy "Maestro can insert classes" on public.classes
for insert with check (auth.uid() = maestro_id);
create policy "Maestro can update own classes" on public.classes
for update using (auth.uid() = maestro_id);

-- Enrollments: users see own; maestros see for their classes
create policy "Users see their enrollments" on public.enrollments for select
using (auth.uid() = user_id or exists (
  select 1 from public.classes c where c.id = enrollments.class_id and c.maestro_id = auth.uid()
));
create policy "Users can enroll themselves" on public.enrollments for insert
with check (auth.uid() = user_id);

-- Reviews: readable by all, insert only if enrolled
create policy "Reviews readable by everyone" on public.reviews for select using (true);
create policy "Enrolled users can review" on public.reviews for insert
with check (exists (
  select 1 from public.enrollments e
  where e.user_id = auth.uid() and e.class_id = reviews.class_id and e.status = 'active'
));

-- Favorites: users manage their own
create policy "Users read their favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users write their favorites" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Follow maestros
create table if not exists public.follows_maestros (
  user_id uuid not null references public.profiles(id) on delete cascade,
  maestro_id uuid not null references public.maestros(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, maestro_id)
);
alter table public.follows_maestros enable row level security;
create policy "Users read their follows" on public.follows_maestros for select using (auth.uid() = user_id);
create policy "Users write their follows" on public.follows_maestros for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: create a public media bucket
insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

-- Storage policies (read all, write authenticated)
create policy "Public read media" on storage.objects for select using (
  bucket_id = 'media'
);
create policy "Auth users write media" on storage.objects for insert to authenticated with check (
  bucket_id = 'media' and auth.role() = 'authenticated'
);
create policy "Auth users update/delete own media" on storage.objects for update using (
  bucket_id = 'media' and owner = auth.uid()
) with check (
  bucket_id = 'media' and owner = auth.uid()
);
