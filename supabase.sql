-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- MESSAGES TABLE
create table messages (
  id bigint generated always as identity primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text,
  file_url text,
  type text check (type in ('text','image','video','audio')) default 'text',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table messages enable row level security;

-- Policies
create policy "Users can see their messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert messages"
  on messages for insert
  with check (auth.uid() = sender_id);

-- SET REALTIME REPLICATION FOR MESSAGES
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table messages;

-- STORAGE bucket for chat files
insert into storage.buckets (id, name, public) values ('chat-files', 'chat-files', true);

create policy "Authenticated users can upload to chat-files"
    on storage.objects for insert
    to authenticated
    with check ( bucket_id = 'chat-files' );

create policy "Anyone can view chat-files"
    on storage.objects for select
    to public
    using ( bucket_id = 'chat-files' );

-- FRIENDSHIPS TABLE
create table friendships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  friend_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- Enable RLS
alter table friendships enable row level security;

-- Policies for friendships
create policy "Users can see their friendships"
  on friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can insert friendships where they are the user_id"
  on friendships for insert
  with check (auth.uid() = user_id);

create policy "Users can update their friendships"
  on friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

alter publication supabase_realtime add table friendships;
