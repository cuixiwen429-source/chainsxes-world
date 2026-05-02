create extension if not exists "pgcrypto";

create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  category text not null check (char_length(category) between 1 and 60),
  body text not null check (char_length(body) between 1 and 20000),
  owner_id uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.essay_media (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essays(id) on delete cascade,
  type text not null check (type in ('image', 'audio')),
  file_path text not null,
  public_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  category text not null check (char_length(category) between 1 and 60),
  file_path text not null,
  public_url text not null,
  file_name text not null,
  owner_id uuid not null references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists essays_created_at_idx on public.essays (created_at desc);
create index if not exists essay_media_essay_id_idx on public.essay_media (essay_id);
create index if not exists photos_created_at_idx on public.photos (created_at desc);

alter table public.essays enable row level security;
alter table public.essay_media enable row level security;
alter table public.photos enable row level security;

drop policy if exists "Public can read essays" on public.essays;
drop policy if exists "Admin can insert essays" on public.essays;
drop policy if exists "Admin can update own essays" on public.essays;
drop policy if exists "Admin can delete own essays" on public.essays;

create policy "Public can read essays"
on public.essays for select
using (true);

create policy "Admin can insert essays"
on public.essays for insert
with check (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

create policy "Admin can update own essays"
on public.essays for update
using (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
)
with check (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

create policy "Admin can delete own essays"
on public.essays for delete
using (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

drop policy if exists "Public can read essay media" on public.essay_media;
drop policy if exists "Admin can insert essay media" on public.essay_media;
drop policy if exists "Admin can update essay media" on public.essay_media;
drop policy if exists "Admin can delete essay media" on public.essay_media;

create policy "Public can read essay media"
on public.essay_media for select
using (true);

create policy "Admin can insert essay media"
on public.essay_media for insert
with check (
  auth.jwt() ->> 'email' = '694586386@qq.com'
  and exists (
    select 1
    from public.essays
    where essays.id = essay_media.essay_id
      and essays.owner_id = auth.uid()
  )
);

create policy "Admin can update essay media"
on public.essay_media for update
using (
  auth.jwt() ->> 'email' = '694586386@qq.com'
  and exists (
    select 1
    from public.essays
    where essays.id = essay_media.essay_id
      and essays.owner_id = auth.uid()
  )
)
with check (
  auth.jwt() ->> 'email' = '694586386@qq.com'
  and exists (
    select 1
    from public.essays
    where essays.id = essay_media.essay_id
      and essays.owner_id = auth.uid()
  )
);

create policy "Admin can delete essay media"
on public.essay_media for delete
using (
  auth.jwt() ->> 'email' = '694586386@qq.com'
  and exists (
    select 1
    from public.essays
    where essays.id = essay_media.essay_id
      and essays.owner_id = auth.uid()
  )
);

drop policy if exists "Public can read photos" on public.photos;
drop policy if exists "Admin can insert photos" on public.photos;
drop policy if exists "Admin can update own photos" on public.photos;
drop policy if exists "Admin can delete own photos" on public.photos;

create policy "Public can read photos"
on public.photos for select
using (true);

create policy "Admin can insert photos"
on public.photos for insert
with check (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

create policy "Admin can update own photos"
on public.photos for update
using (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
)
with check (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

create policy "Admin can delete own photos"
on public.photos for delete
using (
  auth.uid() = owner_id
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chainsxes-media',
  'chainsxes-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/webm',
    'audio/ogg'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view media files" on storage.objects;
drop policy if exists "Admin can upload media files" on storage.objects;
drop policy if exists "Admin can update media files" on storage.objects;
drop policy if exists "Admin can delete media files" on storage.objects;

create policy "Public can view media files"
on storage.objects for select
using (bucket_id = 'chainsxes-media');

create policy "Admin can upload media files"
on storage.objects for insert
with check (
  bucket_id = 'chainsxes-media'
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

create policy "Admin can update media files"
on storage.objects for update
using (
  bucket_id = 'chainsxes-media'
  and auth.jwt() ->> 'email' = '694586386@qq.com'
)
with check (
  bucket_id = 'chainsxes-media'
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);

create policy "Admin can delete media files"
on storage.objects for delete
using (
  bucket_id = 'chainsxes-media'
  and auth.jwt() ->> 'email' = '694586386@qq.com'
);
