-- Rental Marketplace production schema. Existing Textdoc tables are intentionally
-- left untouched during the product replacement migration and can be retired separately.
create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists vector;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, disabled_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text, phone_e164 text, locale text not null default 'en-US', time_zone text not null default 'America/Chicago',
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.renter_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  move_in_date date, preferences jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null, organization_type text not null check (organization_type in ('individual_landlord','property_manager','leasing_company')),
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.provider_accounts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), organization_id uuid references public.organizations(id),
  provider_type text not null check (provider_type in ('individual_landlord','property_manager','leasing_representative')),
  status text not null default 'unverified' check (status in ('unverified','email_verified','phone_verified','identity_pending','identity_verified','business_verified','property_authority_attested','property_authority_verified','rejected','suspended')),
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade, user_id uuid not null references public.users(id) on delete cascade,
  membership_role text not null check (membership_role in ('owner','admin','manager','leasing_agent','analyst')), created_at timestamptz not null default now(), primary key (organization_id,user_id)
);
create table public.role_assignments (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('renter','provider','moderator','admin')), organization_id uuid references public.organizations(id),
  granted_by uuid references public.users(id), created_at timestamptz not null default now(), unique(user_id,role,organization_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id), raw_address text not null, normalized_address text not null,
  address_components jsonb not null default '{}'::jsonb, city text not null, state text not null, postal_code text not null, location geography(point,4326),
  geocoding_provider text, geocoding_confidence numeric(4,3) check (geocoding_confidence between 0 and 1), address_visibility text not null default 'approximate' check (address_visibility in ('exact','approximate','private')),
  external_property_id text, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index properties_location_gist on public.properties using gist(location);
create index properties_normalized_address_idx on public.properties(normalized_address,postal_code);
create table public.buildings (
  id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id), name text, building_type text, floors integer check(floors is null or floors > 0),
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.units (
  id uuid primary key default gen_random_uuid(), building_id uuid references public.buildings(id), property_id uuid not null references public.properties(id), unit_number text,
  bedrooms numeric(4,1) not null check(bedrooms >= 0), bathrooms numeric(4,1) not null check(bathrooms > 0), square_feet integer check(square_feet is null or square_feet > 0),
  property_type text not null check(property_type in ('apartment','house','townhouse','condo','room')),
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.listings (
  id uuid primary key default gen_random_uuid(), unit_id uuid not null references public.units(id), provider_account_id uuid not null references public.provider_accounts(id),
  slug text not null unique, title text not null check(char_length(title) between 8 and 160), description text not null,
  status text not null default 'draft' check(status in ('draft','submitted','needs_review','approved','published','rejected','suspended','expired','rented','archived')),
  advertised_rent_cents integer not null check(advertised_rent_cents >= 0), available_on date, furnished boolean not null default false,
  pet_policy text not null default 'none' check(pet_policy in ('none','cats','dogs','cats_and_dogs')), provider_reported_voucher_acceptance boolean,
  published_at timestamptz, expires_at timestamptz, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index listings_public_search_idx on public.listings(status,expires_at,updated_at desc);
create index listings_provider_idx on public.listings(provider_account_id,status);
create table public.listing_sources (
  id uuid primary key default gen_random_uuid(), name text not null unique, source_type text not null check(source_type in ('direct','csv','licensed_api','fixture')),
  display_rights text not null default 'provider_attested', trust_weight integer not null default 50 check(trust_weight between 0 and 100), enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.listing_source_records (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), source_id uuid not null references public.listing_sources(id),
  external_id text not null, raw_payload jsonb, source_url text, contact_routing jsonb not null default '{}'::jsonb, synchronized_at timestamptz,
  display_allowed boolean not null default false, deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(source_id,external_id)
);
create table public.listing_import_jobs (
  id uuid primary key default gen_random_uuid(), source_id uuid not null references public.listing_sources(id), provider_account_id uuid references public.provider_accounts(id),
  idempotency_key text not null unique, status text not null, row_count integer not null default 0, error_count integer not null default 0, summary jsonb not null default '{}'::jsonb,
  rollback_of uuid references public.listing_import_jobs(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.listing_sync_records (
  id uuid primary key default gen_random_uuid(), source_record_id uuid not null references public.listing_source_records(id), status text not null, attempt_count integer not null default 0,
  error_message text, started_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now()
);
create table public.listing_status_history (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), from_status text, to_status text not null, reason text,
  actor_id uuid references public.users(id), created_at timestamptz not null default now()
);
create table public.availability_events (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), available_on date, available boolean not null, source_record_id uuid references public.listing_source_records(id), created_at timestamptz not null default now()
);
create table public.price_events (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), advertised_rent_cents integer not null check(advertised_rent_cents >= 0), source_record_id uuid references public.listing_source_records(id), created_at timestamptz not null default now()
);
create table public.lease_terms (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), months integer not null check(months > 0), start_date date, end_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(listing_id,months)
);
create table public.concessions (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), kind text not null check(kind in ('free_days','free_weeks','free_months','fixed_credit','percentage','move_in_credit')),
  value numeric(12,2) not null check(value >= 0), eligible_lease_months integer[], applied_at text not null, effective_start date, effective_end date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.listing_fees (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), name text not null, category text not null,
  amount_type text not null check(amount_type in ('fixed','range','percentage','estimated')), amount_cents integer check(amount_cents >= 0), minimum_cents integer check(minimum_cents >= 0), maximum_cents integer check(maximum_cents >= minimum_cents), basis_points integer check(basis_points >= 0),
  cadence text not null check(cadence in ('monthly','one_time','annual','usage_based')), required boolean not null, refundable boolean not null, source_type text not null check(source_type in ('provider_reported','platform_estimated')),
  taxable boolean, pet_specific boolean not null default false, parking_specific boolean not null default false, effective_start date, effective_end date, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((amount_type in ('fixed','estimated') and amount_cents is not null) or (amount_type='range' and minimum_cents is not null and maximum_cents is not null) or (amount_type='percentage' and basis_points is not null))
);
create table public.amenities (id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, category text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.listing_amenities (listing_id uuid not null references public.listings(id) on delete cascade, amenity_id uuid not null references public.amenities(id), provider_reported boolean not null default true, details text, primary key(listing_id,amenity_id));
create table public.property_amenities (property_id uuid not null references public.properties(id) on delete cascade, amenity_id uuid not null references public.amenities(id), provider_reported boolean not null default true, details text, primary key(property_id,amenity_id));
create table public.photos (id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), storage_path text not null, alt_text text not null, sort_order integer not null default 0, sha256 text, created_at timestamptz not null default now());
create table public.videos (id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), url text not null, caption_url text, provider text, created_at timestamptz not null default now());
create table public.floor_plans (id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), storage_path text not null, label text, media_type text not null, created_at timestamptz not null default now());

create table public.verification_records (
  id uuid primary key default gen_random_uuid(), subject_type text not null check(subject_type in ('listing','provider','property')), subject_id uuid not null,
  level text not null check(level in ('email','phone','address','authority','business')), status text not null check(status in ('active','pending','expired','revoked')),
  method text not null, verified_by uuid references public.users(id), verified_at timestamptz, expires_at timestamptz, reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index verification_active_subject_idx on public.verification_records(subject_type,subject_id,status,expires_at);
create table public.verification_evidence_metadata (id uuid primary key default gen_random_uuid(), verification_record_id uuid not null references public.verification_records(id), hosted_provider text, external_reference text, evidence_type text not null, reviewed_at timestamptz, created_at timestamptz not null default now());
create table public.fraud_signals (id uuid primary key default gen_random_uuid(), subject_type text not null, subject_id uuid not null, signal_code text not null, confidence numeric(4,3) check(confidence between 0 and 1), explanation jsonb not null, status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.fraud_reports (id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), reporter_id uuid references public.users(id), reason text not null, details text not null, status text not null default 'received', contact_email text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.duplicate_candidates (id uuid primary key default gen_random_uuid(), listing_a_id uuid not null references public.listings(id), listing_b_id uuid not null references public.listings(id), confidence numeric(4,3) not null check(confidence between 0 and 1), explanation jsonb not null, status text not null default 'open', merged_listing_id uuid references public.listings(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(listing_a_id,listing_b_id));
create table public.moderation_cases (id uuid primary key default gen_random_uuid(), subject_type text not null, subject_id uuid not null, case_type text not null, priority text not null default 'normal', status text not null default 'open', assigned_to uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.moderation_actions (id uuid primary key default gen_random_uuid(), case_id uuid not null references public.moderation_cases(id), actor_id uuid not null references public.users(id), action text not null, reason text not null check(char_length(reason)>=10), previous_state jsonb, next_state jsonb, created_at timestamptz not null default now());
create table public.provider_attestations (id uuid primary key default gen_random_uuid(), provider_account_id uuid not null references public.provider_accounts(id), listing_id uuid references public.listings(id), attestation_type text not null, version text not null, accepted_at timestamptz not null, ip_hash text, created_at timestamptz not null default now());
create table public.audit_logs (id bigint generated always as identity primary key, actor_id uuid references public.users(id), actor_role text, action text not null, subject_type text not null, subject_id text, reason text, metadata jsonb not null default '{}'::jsonb, request_id text, created_at timestamptz not null default now());

create table public.saved_listings (user_id uuid not null references public.users(id), listing_id uuid not null references public.listings(id), note text, saved_at timestamptz not null default now(), primary key(user_id,listing_id));
create table public.saved_searches (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), title text not null, criteria jsonb not null, alert_frequency text not null, email_enabled boolean not null default false, last_run_at timestamptz, last_result_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.alert_subscriptions (id uuid primary key default gen_random_uuid(), saved_search_id uuid not null references public.saved_searches(id), event_types text[] not null, enabled boolean not null default true, last_notification_key text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.comparison_sets (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), name text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.comparison_items (comparison_set_id uuid not null references public.comparison_sets(id) on delete cascade, listing_id uuid not null references public.listings(id), added_at timestamptz not null default now(), primary key(comparison_set_id,listing_id));
create table public.leads (id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.listings(id), renter_id uuid references public.users(id), provider_account_id uuid not null references public.provider_accounts(id), status text not null default 'new' check(status in ('new','contacted','tour_requested','closed','spam')), first_responded_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.contact_requests (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id), encrypted_contact jsonb not null, message text not null, consent_at timestamptz not null, idempotency_key text not null unique, created_at timestamptz not null default now());
create table public.tour_requests (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id), preferred_start timestamptz not null, preferred_end timestamptz not null, time_zone text not null, tour_type text not null check(tour_type in ('in_person','video')), status text not null default 'requested', message text, idempotency_key text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.notification_preferences (user_id uuid primary key references public.users(id), email_marketing boolean not null default false, search_alerts boolean not null default true, transactional_email boolean not null default true, sms boolean not null default false, consent_updated_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.recently_viewed (user_id uuid not null references public.users(id), listing_id uuid not null references public.listings(id), viewed_at timestamptz not null default now(), primary key(user_id,listing_id));

create table public.search_index_outbox (id bigint generated always as identity primary key, listing_id uuid not null references public.listings(id), operation text not null check(operation in ('upsert','delete','full_reindex')), payload_version integer not null default 1, status text not null default 'pending' check(status in ('pending','processing','completed','failed','dead_letter')), attempt_count integer not null default 0, last_error text, available_at timestamptz not null default now(), processed_at timestamptz, created_at timestamptz not null default now());
create index search_index_outbox_worker_idx on public.search_index_outbox(status,available_at,id);
create table public.webhook_events (id uuid primary key default gen_random_uuid(), provider text not null, external_event_id text not null, signature_valid boolean not null, status text not null default 'received', payload_hash text not null, received_at timestamptz not null default now(), processed_at timestamptz, unique(provider,external_event_id));
create table public.idempotency_keys (key text primary key, scope text not null, request_hash text not null, response_status integer, response_body jsonb, expires_at timestamptz not null, created_at timestamptz not null default now());
create table public.feature_flags (key text primary key, enabled boolean not null default false, configuration jsonb not null default '{}'::jsonb, updated_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.jurisdiction_rules (id uuid primary key default gen_random_uuid(), jurisdiction_code text not null, rule_key text not null, version integer not null, configuration jsonb not null, effective_at timestamptz not null, expires_at timestamptz, created_at timestamptz not null default now(), unique(jurisdiction_code,rule_key,version));
create table public.application_settings (key text primary key, value jsonb not null, updated_by uuid references public.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create or replace function public.has_role(required_role text) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.role_assignments r where r.user_id=auth.uid() and r.role=required_role) $$;
create or replace function public.owns_provider(target_provider uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.provider_accounts p where p.id=target_provider and (p.user_id=auth.uid() or exists(select 1 from public.organization_members m where m.organization_id=p.organization_id and m.user_id=auth.uid()))) $$;

alter table public.users enable row level security; alter table public.user_profiles enable row level security; alter table public.renter_profiles enable row level security;
alter table public.organizations enable row level security; alter table public.provider_accounts enable row level security; alter table public.organization_members enable row level security; alter table public.role_assignments enable row level security;
alter table public.properties enable row level security; alter table public.buildings enable row level security; alter table public.units enable row level security; alter table public.listings enable row level security;
alter table public.listing_source_records enable row level security; alter table public.verification_records enable row level security; alter table public.saved_listings enable row level security; alter table public.saved_searches enable row level security;
alter table public.leads enable row level security; alter table public.contact_requests enable row level security; alter table public.tour_requests enable row level security; alter table public.fraud_reports enable row level security; alter table public.audit_logs enable row level security;

create policy "public reads published current listings" on public.listings for select using(status='published' and deleted_at is null and (expires_at is null or expires_at>now()));
create policy "users manage own profile" on public.user_profiles for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "renters manage own profile" on public.renter_profiles for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users read own roles" on public.role_assignments for select using(user_id=auth.uid());
create policy "admins manage roles" on public.role_assignments for all using(public.has_role('admin')) with check(public.has_role('admin'));
create policy "providers read own account" on public.provider_accounts for select using(public.owns_provider(id) or public.has_role('moderator') or public.has_role('admin'));
create policy "providers manage own listings" on public.listings for all using(public.owns_provider(provider_account_id) or public.has_role('moderator') or public.has_role('admin')) with check(public.owns_provider(provider_account_id) or public.has_role('moderator') or public.has_role('admin'));
create policy "renters manage saved listings" on public.saved_listings for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "renters manage saved searches" on public.saved_searches for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "authorized parties read leads" on public.leads for select using(renter_id=auth.uid() or public.owns_provider(provider_account_id) or public.has_role('moderator') or public.has_role('admin'));
create policy "renters create reports" on public.fraud_reports for insert with check(reporter_id is null or reporter_id=auth.uid());
create policy "moderators manage reports" on public.fraud_reports for all using(public.has_role('moderator') or public.has_role('admin')) with check(public.has_role('moderator') or public.has_role('admin'));
create policy "admins read audit logs" on public.audit_logs for select using(public.has_role('admin'));

create trigger users_updated before update on public.users for each row execute function public.set_updated_at();
create trigger user_profiles_updated before update on public.user_profiles for each row execute function public.set_updated_at();
create trigger listings_updated before update on public.listings for each row execute function public.set_updated_at();
create trigger listing_fees_updated before update on public.listing_fees for each row execute function public.set_updated_at();

create or replace function public.queue_listing_index() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.search_index_outbox(listing_id,operation) values(coalesce(new.id,old.id),case when tg_op='DELETE' then 'delete' else 'upsert' end); return coalesce(new,old); end $$;
create trigger listings_search_outbox after insert or update or delete on public.listings for each row execute function public.queue_listing_index();
