-- Schema sync migration: captures changes applied directly to the live
-- database (columns, trigger, anonymity view, and RLS) so the repo can
-- reproduce production. Idempotent where possible.

-- 1. Columns added after the original migration
alter table afterframes
  add column if not exists is_anonymous boolean not null default false;

alter table afterframes
  add column if not exists updated_at timestamptz default now();

-- 2. updated_at auto-update trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists afterframes_updated_at on afterframes;
create trigger afterframes_updated_at
  before update on afterframes
  for each row
  execute function update_updated_at();

-- 3. handle_new_user trigger: prefer signup-metadata username,
--    fall back to email prefix.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Public-safe view: strips author identity from anonymous frames.
create or replace view public_frames as
select
  f.id,
  f.title,
  f.the_event,
  f.the_gut_punch,
  f.the_pivot,
  f.the_retroactive_why,
  f.the_one_liner,
  f.is_published,
  f.is_anonymous,
  f.published_at,
  f.updated_at,
  f.created_at,
  case when f.is_anonymous then null else f.author_id end as author_id,
  case when f.is_anonymous then null else p.username end as author_username,
  case when f.is_anonymous then null else p.avatar_url end as author_avatar_url
from afterframes f
left join profiles p on p.id = f.author_id
where f.is_published = true;

grant select on public_frames to anon, authenticated;

-- 5. RLS: replace the old permissive policy that exposed anonymous rows.
drop policy if exists "Public read published afterframes" on afterframes;

drop policy if exists "Anon read public non-anonymous" on afterframes;
create policy "Anon read public non-anonymous"
  on afterframes for select
  to anon
  using (is_published = true and is_anonymous = false);

drop policy if exists "Auth read public or own" on afterframes;
create policy "Auth read public or own"
  on afterframes for select
  to authenticated
  using (
    (is_published = true and is_anonymous = false)
    or author_id = auth.uid()
  );
