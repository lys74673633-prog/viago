-- StudyPilot AI — MVP schema skeleton
-- profiles: Auth 유저 확장
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

-- 일일 이용 횟수 (서버 측 제한용 — 추후 API에서 사용)
create table if not exists public.usage_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  guest_key text,
  date_key date not null,
  count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usage_logs_owner_check check (
    user_id is not null or guest_key is not null
  )
);

create unique index if not exists usage_logs_user_date_uidx
  on public.usage_logs (user_id, date_key)
  where user_id is not null;

create unique index if not exists usage_logs_guest_date_uidx
  on public.usage_logs (guest_key, date_key)
  where guest_key is not null;

-- 세특 생성 이력 (선택)
create table if not exists public.setuk_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  subject text not null,
  keywords text not null,
  role_and_reflection text not null,
  academic_text text,
  career_text text,
  community_text text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.usage_logs enable row level security;
alter table public.setuk_generations enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "setuk_select_own" on public.setuk_generations
  for select using (auth.uid() = user_id);

create policy "setuk_insert_own" on public.setuk_generations
  for insert with check (auth.uid() = user_id);
