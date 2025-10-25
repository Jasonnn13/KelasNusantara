-- Seed data for KelasNusantara (uses Storage 'media' bucket)
-- This assumes you will upload the referenced images to the 'media' bucket.
-- See scripts/upload-media.ts for a helper to upload local public/ assets.

-- Categories
insert into public.categories (slug, name) values
  ('tari-bali', 'Tari Bali')
, ('gamelan', 'Gamelan')
, ('batik', 'Batik')
on conflict do nothing;

-- Dummy users (service role only). Replace with real auth.users IDs in production.
-- These inserts will succeed in Supabase SQL editor (service role bypasses RLS).
insert into public.profiles (id, full_name, avatar_url, role) values
  ('11111111-1111-1111-1111-111111111111','Ibu Saras Dewi', 'portrait-maestro-tari-bali.jpg', 'maestro')
, ('22222222-2222-2222-2222-222222222222','Mas Rendra Sapto', 'portrait-maestro-gamelan-jawa.jpg', 'maestro')
, ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Siswa Satu', null, 'student')
on conflict (id) do update set full_name=excluded.full_name, role=excluded.role;

insert into public.maestros (id, display_name, region, discipline, bio, photo_url) values
  ('11111111-1111-1111-1111-111111111111','Ibu Saras Dewi','Bali','Tari Legong','Penari dan koreografer Legong.','portrait-maestro-tari-bali.jpg')
, ('22222222-2222-2222-2222-222222222222','Mas Rendra Sapto','Yogyakarta','Gamelan','Pengrawit dan pengajar karawitan.','portrait-maestro-gamelan-jawa.jpg')
on conflict (id) do update set display_name=excluded.display_name;

-- Example classes bound to those maestros (thumbnails stored as STORAGE PATHS in 'media' bucket)
insert into public.classes (title, category_id, maestro_id, description, thumbnail_url, price_cents, currency, level, published)
select 'Tari Legong', (select id from public.categories where slug='tari-bali'), '11111111-1111-1111-1111-111111111111',
       'Pelajari teknik dasar, ekspresi, dan filosofi Tari Legong.', 'tari-bali-legong.jpg', 150000, 'IDR', 'beginner', true;

insert into public.classes (title, category_id, maestro_id, description, thumbnail_url, price_cents, currency, level, published)
select 'Gamelan Jawa', (select id from public.categories where slug='gamelan'), '22222222-2222-2222-2222-222222222222',
       'Memahami laras, gendhing, dan permainan instrumen inti gamelan.', 'gamelan-jawa-ensemble.jpg', 200000, 'IDR', 'beginner', true;

insert into public.classes (title, category_id, maestro_id, description, thumbnail_url, price_cents, currency, level, published)
select 'Membatik Tulis', (select id from public.categories where slug='batik'), '11111111-1111-1111-1111-111111111111',
       'Dari menggambar pola hingga pewarnaan — proses batik tulis lengkap.', 'batik-tulis-workshop.jpg', 175000, 'IDR', 'beginner', true;

-- Example enrollment + review from student user
insert into public.enrollments (user_id, class_id, status)
  select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id, 'active' from public.classes order by created_at asc limit 1;

insert into public.reviews (user_id, class_id, rating, comment)
  select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id, 5, 'Kelasnya sangat jelas dan menyenangkan!'
  from public.classes order by created_at asc limit 1;
