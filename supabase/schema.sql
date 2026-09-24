-- BloodLink Supabase/PostgreSQL schema
-- Supabase SQL Editor-এ চালান। service-role key কখনো ফ্রন্টএন্ডে রাখবেন না।

create extension if not exists "uuid-ossp";

do $$ begin create type user_role as enum ('USER','DONOR','MODERATOR','ADMIN','SUPER_ADMIN'); exception when duplicate_object then null; end $$;
do $$ begin create type account_status as enum ('active','suspended','banned'); exception when duplicate_object then null; end $$;
do $$ begin create type request_status as enum ('DRAFT','PENDING_REVIEW','ACTIVE','PARTIALLY_FULFILLED','FULFILLED','EXPIRED','CANCELLED','REJECTED'); exception when duplicate_object then null; end $$;
do $$ begin create type urgency_level as enum ('normal','urgent','critical'); exception when duplicate_object then null; end $$;

create table if not exists divisions (id text primary key, name_bn text not null, active boolean default true);
create table if not exists districts (id text primary key, division_id text references divisions(id), name_bn text not null, active boolean default true);
create table if not exists upazilas (id text primary key, district_id text references districts(id), name_bn text not null, active boolean default true);
create table if not exists hospitals (id uuid primary key default uuid_generate_v4(), name_bn text not null, division_id text references divisions(id), district_id text references districts(id), upazila_id text references upazilas(id), address text, phone text, verified boolean default false, active boolean default true, created_at timestamptz default now());

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null, email text, phone text,
  avatar_url text, role user_role default 'USER', account_status account_status default 'active',
  phone_verified boolean default false, email_verified boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists donor_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade unique,
  blood_group text check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  division_id text references divisions(id), district_id text references districts(id), upazila_id text references upazilas(id),
  availability boolean default true, last_donation_date date, donation_count int default 0,
  contact_preference text default 'contact', profile_visibility text default 'public', verified boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists blood_requests (
  id text primary key,
  requester_id uuid references profiles(id) on delete set null,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  bags_required int not null check (bags_required between 1 and 10), bags_fulfilled int default 0,
  urgency urgency_level default 'urgent',
  division_id text references divisions(id), district_id text references districts(id), upazila_id text references upazilas(id),
  hospital_id uuid references hospitals(id), location_text text,
  required_date date not null, required_time text, description text check (char_length(description) <= 500),
  contact_phone text not null, whatsapp_enabled boolean default true,
  status request_status default 'ACTIVE', expires_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists saved_requests (id uuid primary key default uuid_generate_v4(), user_id uuid references profiles(id) on delete cascade, request_id text references blood_requests(id) on delete cascade, created_at timestamptz default now(), unique(user_id, request_id));
create table if not exists notifications (id uuid primary key default uuid_generate_v4(), user_id uuid references profiles(id) on delete cascade, type text, title text, message text, reference_id text, is_read boolean default false, created_at timestamptz default now());
create table if not exists conversations (id uuid primary key default uuid_generate_v4(), request_id text references blood_requests(id) on delete set null, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists conversation_participants (conversation_id uuid references conversations(id) on delete cascade, user_id uuid references profiles(id) on delete cascade, primary key (conversation_id, user_id));
create table if not exists messages (id uuid primary key default uuid_generate_v4(), conversation_id uuid references conversations(id) on delete cascade, sender_id uuid references profiles(id) on delete set null, message text check (char_length(message) between 1 and 2000), is_read boolean default false, created_at timestamptz default now());
create table if not exists reports (id uuid primary key default uuid_generate_v4(), reporter_id uuid references profiles(id) on delete set null, request_id text references blood_requests(id) on delete set null, reported_user_id uuid references profiles(id) on delete set null, reason text not null, description text, status text default 'নতুন', reviewed_by uuid references profiles(id) on delete set null, reviewed_at timestamptz, created_at timestamptz default now());
create table if not exists admin_logs (id uuid primary key default uuid_generate_v4(), admin_id uuid references profiles(id) on delete set null, action text not null, target_type text, target_id text, metadata jsonb, created_at timestamptz default now());

alter table profiles enable row level security;
alter table donor_profiles enable row level security;
alter table blood_requests enable row level security;
alter table saved_requests enable row level security;
alter table notifications enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;

-- Public: শুধু ACTIVE অনুরোধ পড়তে পারবে
drop policy if exists "public active requests" on blood_requests;
create policy "public active requests" on blood_requests for select using (status = 'ACTIVE');

-- Authenticated: নিজের অনুরোধ তৈরি/আপডেট
drop policy if exists "own requests all" on blood_requests;
create policy "own requests all" on blood_requests for all using (auth.uid() = requester_id) with check (auth.uid() = requester_id);

-- Profiles: সবাই সীমিত পড়া, নিজেরটা লেখা (সার্ভারে role পরিবর্তন নিষেধ — ট্রিগার/ফাংশনে গার্ড করুন)
drop policy if exists "profiles read" on profiles; create policy "profiles read" on profiles for select using (true);
drop policy if exists "own profile" on profiles; create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Saved/notif: শুধু নিজের
drop policy if exists "own saved" on saved_requests; create policy "own saved" on saved_requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own notif" on notifications; create policy "own notif" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- অ্যাডমিন রোল চেক হেল্পার (সার্ভার-সাইড ফাংশনে ব্যবহার করুন, ক্লায়েন্টে বিশ্বাস নয়)
create or replace function public.is_admin() returns boolean language sql security definer as $$ select exists (select 1 from profiles where id = auth.uid() and role in ('ADMIN','SUPER_ADMIN','MODERATOR')) $$;

-- মেয়াদোত্তীর্ণকরণ ক্রন (pg_cron থাকলে প্রতি ঘণ্টায়): ACTIVE → EXPIRED
-- update blood_requests set status='EXPIRED' where status='ACTIVE' and coalesce(expires_at, (required_date::timestamptz + interval '1 day')) < now();
