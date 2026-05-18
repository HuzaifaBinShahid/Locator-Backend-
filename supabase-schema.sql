-- Locator Supabase schema
-- Run this once in Supabase dashboard: SQL Editor → New query → paste → Run

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  password text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  biometric_enabled boolean not null default false,
  profile_image text,
  nie_or_dni text,
  social_security_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date text not null,
  checkin_time timestamptz not null,
  checkout_time timestamptz,
  checkin_latitude double precision not null,
  checkin_longitude double precision not null,
  checkin_address text not null,
  checkout_latitude double precision,
  checkout_longitude double precision,
  checkout_address text,
  total_hours double precision not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists attendance_user_date_idx on attendance (user_id, date desc);
create index if not exists attendance_checkin_time_idx on attendance (checkin_time desc);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  brand text,
  manufacturer text,
  model_name text,
  device_name text not null,
  os_name text,
  os_version text,
  os_build_id text,
  device_type text,
  total_memory bigint,
  supported_cpu_architectures text[],
  device_year_class int,
  is_device boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_name)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();

drop trigger if exists attendance_set_updated_at on attendance;
create trigger attendance_set_updated_at before update on attendance
  for each row execute function set_updated_at();

drop trigger if exists devices_set_updated_at on devices;
create trigger devices_set_updated_at before update on devices
  for each row execute function set_updated_at();
