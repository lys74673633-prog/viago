-- users 테이블: 일일 무료 할당량 (daily_quota)
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  daily_quota int not null default 5 check (daily_quota >= 0),
  quota_date date not null default ((timezone('Asia/Seoul', now()))::date),
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- 신규 가입 시 users 행 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, daily_quota, quota_date)
  values (
    new.id,
    new.email,
    coalesce((current_setting('app.settings.daily_free_limit', true))::int, 5),
    (timezone('Asia/Seoul', now()))::date
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 날짜가 바뀌면 quota 리셋 후 1 차감. 프리미엄은 차감하지 않음.
create or replace function public.consume_daily_quota(p_limit int default 5)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (timezone('Asia/Seoul', now()))::date;
  row public.users%rowtype;
begin
  if uid is null then
    return jsonb_build_object(
      'ok', false,
      'error', 'UNAUTHENTICATED',
      'remaining', 0,
      'limit', p_limit
    );
  end if;

  insert into public.users (id, email, daily_quota, quota_date)
  values (uid, null, p_limit, today)
  on conflict (id) do nothing;

  select * into row from public.users where id = uid for update;

  if row.is_premium then
    return jsonb_build_object(
      'ok', true,
      'remaining', p_limit,
      'limit', p_limit,
      'is_premium', true,
      'exhausted', false
    );
  end if;

  if row.quota_date is distinct from today then
    row.daily_quota := p_limit;
    row.quota_date := today;
  end if;

  if row.daily_quota <= 0 then
    update public.users
      set daily_quota = 0,
          quota_date = today,
          updated_at = now()
      where id = uid;

    return jsonb_build_object(
      'ok', false,
      'error', 'QUOTA_EXCEEDED',
      'remaining', 0,
      'limit', p_limit,
      'is_premium', false,
      'exhausted', true
    );
  end if;

  update public.users
    set daily_quota = row.daily_quota - 1,
        quota_date = today,
        updated_at = now()
    where id = uid
    returning * into row;

  return jsonb_build_object(
    'ok', true,
    'remaining', row.daily_quota,
    'limit', p_limit,
    'is_premium', false,
    'exhausted', row.daily_quota <= 0
  );
end;
$$;

create or replace function public.get_daily_quota(p_limit int default 5)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (timezone('Asia/Seoul', now()))::date;
  row public.users%rowtype;
begin
  if uid is null then
    return jsonb_build_object(
      'remaining', p_limit,
      'limit', p_limit,
      'used', 0,
      'is_premium', false,
      'authenticated', false
    );
  end if;

  insert into public.users (id, daily_quota, quota_date)
  values (uid, p_limit, today)
  on conflict (id) do nothing;

  select * into row from public.users where id = uid;

  if row.quota_date is distinct from today and not row.is_premium then
    update public.users
      set daily_quota = p_limit,
          quota_date = today,
          updated_at = now()
      where id = uid
      returning * into row;
  end if;

  if row.is_premium then
    return jsonb_build_object(
      'remaining', p_limit,
      'limit', p_limit,
      'used', 0,
      'is_premium', true,
      'authenticated', true
    );
  end if;

  return jsonb_build_object(
    'remaining', row.daily_quota,
    'limit', p_limit,
    'used', greatest(0, p_limit - row.daily_quota),
    'is_premium', false,
    'authenticated', true
  );
end;
$$;

grant execute on function public.consume_daily_quota(int) to authenticated;
grant execute on function public.get_daily_quota(int) to authenticated, anon;
