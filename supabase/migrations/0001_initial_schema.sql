create extension if not exists pgcrypto;

create type document_role as enum ('owner', 'editor', 'commenter', 'viewer');
create type comment_status as enum ('open', 'resolved');
create type suggestion_status as enum ('open', 'accepted', 'rejected');
create type suggestion_kind as enum ('insertion', 'deletion', 'modification');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  content jsonb not null,
  page_settings jsonb not null,
  style_registry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.document_acl (
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role document_role not null,
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  snapshot jsonb not null,
  label text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.yjs_updates (
  id bigserial primary key,
  document_id uuid not null references public.documents(id) on delete cascade,
  update bytea not null,
  clock bigint not null,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  anchor jsonb not null,
  body text not null,
  status comment_status not null default 'open',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  range jsonb not null,
  kind suggestion_kind not null,
  payload jsonb not null,
  status suggestion_status not null default 'open',
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  width integer,
  height integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigserial primary key,
  actor_id uuid references auth.users(id) on delete set null,
  document_id uuid references public.documents(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index documents_owner_id_idx on public.documents(owner_id);
create index document_acl_user_id_idx on public.document_acl(user_id);
create index document_versions_document_id_idx on public.document_versions(document_id, created_at desc);
create index yjs_updates_document_clock_idx on public.yjs_updates(document_id, clock);
create index comments_document_id_idx on public.comments(document_id, status);
create index suggestions_document_id_idx on public.suggestions(document_id, status);
create index assets_document_id_idx on public.assets(document_id);
create index audit_events_document_id_idx on public.audit_events(document_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_acl enable row level security;
alter table public.document_versions enable row level security;
alter table public.yjs_updates enable row level security;
alter table public.comments enable row level security;
alter table public.suggestions enable row level security;
alter table public.assets enable row level security;
alter table public.audit_events enable row level security;

create or replace function public.can_access_document(target_document_id uuid, minimum_role document_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.document_acl acl
    where acl.document_id = target_document_id
      and acl.user_id = auth.uid()
      and (
        acl.role = 'owner'
        or acl.role = minimum_role
        or (minimum_role in ('commenter', 'viewer') and acl.role in ('editor', 'commenter'))
        or (minimum_role = 'viewer' and acl.role in ('editor', 'commenter', 'viewer'))
      )
  );
$$;

create policy "profiles are readable by self" on public.profiles
for select using (id = auth.uid());

create policy "documents readable by acl" on public.documents
for select using (public.can_access_document(id, 'viewer'));

create policy "documents insertable by owner" on public.documents
for insert with check (owner_id = auth.uid());

create policy "documents editable by editors" on public.documents
for update using (public.can_access_document(id, 'editor'))
with check (public.can_access_document(id, 'editor'));

create policy "acl readable by document members" on public.document_acl
for select using (public.can_access_document(document_id, 'viewer'));

create policy "acl manageable by owners" on public.document_acl
for all using (public.can_access_document(document_id, 'owner'))
with check (public.can_access_document(document_id, 'owner'));

create policy "versions readable by members" on public.document_versions
for select using (public.can_access_document(document_id, 'viewer'));

create policy "versions creatable by editors" on public.document_versions
for insert with check (public.can_access_document(document_id, 'editor'));

create policy "comments readable by members" on public.comments
for select using (public.can_access_document(document_id, 'viewer'));

create policy "comments creatable by commenters" on public.comments
for insert with check (public.can_access_document(document_id, 'commenter'));

create policy "suggestions readable by members" on public.suggestions
for select using (public.can_access_document(document_id, 'viewer'));

create policy "suggestions creatable by commenters" on public.suggestions
for insert with check (public.can_access_document(document_id, 'commenter'));

create policy "assets readable by members" on public.assets
for select using (public.can_access_document(document_id, 'viewer'));

create policy "assets creatable by editors" on public.assets
for insert with check (public.can_access_document(document_id, 'editor'));
