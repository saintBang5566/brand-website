-- Setup draft. Run only in the selected Supabase project after review.
-- Payment webhooks or an authorized admin write access rows; browser users only read their own.
begin;

create table if not exists public.membership_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('active','trialing','canceled','past_due','expired')),
  plan_name text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.membership_access enable row level security;
revoke all on public.membership_access from anon, authenticated;
grant select on public.membership_access to authenticated;
drop policy if exists "members_read_own_access" on public.membership_access;
create policy "members_read_own_access" on public.membership_access
  for select to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.member_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz not null default now()
);
alter table public.member_posts enable row level security;
revoke all on public.member_posts from anon, authenticated;
grant select on public.member_posts to authenticated;
drop policy if exists "valid_members_read_published_posts" on public.member_posts;
create policy "valid_members_read_published_posts" on public.member_posts
  for select to authenticated using (
    published_at <= now() and exists (
      select 1 from public.membership_access a
      where a.user_id = (select auth.uid())
        and a.status in ('active','trialing','canceled')
        and a.expires_at > now()
    )
  );

commit;
