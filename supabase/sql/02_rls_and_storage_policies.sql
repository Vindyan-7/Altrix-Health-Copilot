-- =============================================================================
-- Altrix Labs Health Copilot — Migration 02: RLS Policies, Triggers & Storage
-- FOR MANUAL REVIEW AND EXECUTION ONLY BY PRODUCT MANAGER (Vindyan)
-- DO NOT CONNECT OR RUN AUTOMATICALLY
-- Idempotent script: Safe to execute on fresh projects or re-run without errors
-- =============================================================================

-- 1. Profile Creation Trigger on Supabase Auth Signup
-- Secure search_path explicitly set to 'public' to prevent path hijacking
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, preferred_language, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en'),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Restrict function execution so only postgres system / trigger runs it
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Row Level Security Policies for Core Tables
-- Drop existing policies first to guarantee idempotent re-runs

-- Table: profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Table: health_documents
drop policy if exists "Users can view own health documents" on public.health_documents;
create policy "Users can view own health documents"
  on public.health_documents for select
  using (auth.uid() = profile_id and deleted_at is null);

drop policy if exists "Users can insert own health documents" on public.health_documents;
create policy "Users can insert own health documents"
  on public.health_documents for insert
  with check (auth.uid() = profile_id and profile_id is not null);

drop policy if exists "Users can update own health documents" on public.health_documents;
create policy "Users can update own health documents"
  on public.health_documents for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Users can delete own health documents" on public.health_documents;
create policy "Users can delete own health documents"
  on public.health_documents for delete
  using (auth.uid() = profile_id);

-- Table: extraction_runs (Scoped through parent health document)
drop policy if exists "Users can view extraction runs for own documents" on public.extraction_runs;
create policy "Users can view extraction runs for own documents"
  on public.extraction_runs for select
  using (
    exists (
      select 1 from public.health_documents d
      where d.id = extraction_runs.document_id
      and d.profile_id = auth.uid()
      and d.deleted_at is null
    )
  );

drop policy if exists "Users can insert extraction runs for own documents" on public.extraction_runs;
create policy "Users can insert extraction runs for own documents"
  on public.extraction_runs for insert
  with check (
    exists (
      select 1 from public.health_documents d
      where d.id = extraction_runs.document_id
      and d.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can update extraction runs for own documents" on public.extraction_runs;
create policy "Users can update extraction runs for own documents"
  on public.extraction_runs for update
  using (
    exists (
      select 1 from public.health_documents d
      where d.id = extraction_runs.document_id
      and d.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.health_documents d
      where d.id = extraction_runs.document_id
      and d.profile_id = auth.uid()
    )
  );

-- Table: extracted_fields (Scoped through parent health document)
drop policy if exists "Users can view extracted fields for own documents" on public.extracted_fields;
create policy "Users can view extracted fields for own documents"
  on public.extracted_fields for select
  using (
    exists (
      select 1 from public.health_documents d
      where d.id = extracted_fields.document_id
      and d.profile_id = auth.uid()
      and d.deleted_at is null
    )
  );

drop policy if exists "Users can insert extracted fields for own documents" on public.extracted_fields;
create policy "Users can insert extracted fields for own documents"
  on public.extracted_fields for insert
  with check (
    exists (
      select 1 from public.health_documents d
      where d.id = extracted_fields.document_id
      and d.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can update review status on own extracted fields" on public.extracted_fields;
create policy "Users can update review status on own extracted fields"
  on public.extracted_fields for update
  using (
    exists (
      select 1 from public.health_documents d
      where d.id = extracted_fields.document_id
      and d.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.health_documents d
      where d.id = extracted_fields.document_id
      and d.profile_id = auth.uid()
    )
    and (reviewed_by is null or reviewed_by = auth.uid())
  );

drop policy if exists "Users can delete extracted fields for own documents" on public.extracted_fields;
create policy "Users can delete extracted fields for own documents"
  on public.extracted_fields for delete
  using (
    exists (
      select 1 from public.health_documents d
      where d.id = extracted_fields.document_id
      and d.profile_id = auth.uid()
    )
  );

-- Table: observations (Timeline & Trends: Scoped directly to profile_id)
drop policy if exists "Users can view own observations" on public.observations;
create policy "Users can view own observations"
  on public.observations for select
  using (auth.uid() = profile_id);

drop policy if exists "Users can insert own observations" on public.observations;
create policy "Users can insert own observations"
  on public.observations for insert
  with check (auth.uid() = profile_id and profile_id is not null);

drop policy if exists "Users can update own observations" on public.observations;
create policy "Users can update own observations"
  on public.observations for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

drop policy if exists "Users can delete own observations" on public.observations;
create policy "Users can delete own observations"
  on public.observations for delete
  using (auth.uid() = profile_id);

-- Table: audit_events (Append-only audit trail: No UPDATE or DELETE allowed)
drop policy if exists "Users can view own audit events" on public.audit_events;
create policy "Users can view own audit events"
  on public.audit_events for select
  using (auth.uid() = actor_id);

drop policy if exists "Users can insert own audit events" on public.audit_events;
create policy "Users can insert own audit events"
  on public.audit_events for insert
  with check (auth.uid() = actor_id and actor_id is not null);

-- 3. Performant Indexes for Foreign Keys, Timeline and Document Queries
create index if not exists idx_health_documents_profile_status
  on public.health_documents (profile_id, status)
  where deleted_at is null;

create index if not exists idx_observations_profile_code_date
  on public.observations (profile_id, code_or_name, observed_at desc);

create index if not exists idx_extracted_fields_document_id
  on public.extracted_fields (document_id);

create index if not exists idx_extraction_runs_document_id
  on public.extraction_runs (document_id);

create index if not exists idx_audit_events_actor_created
  on public.audit_events (actor_id, created_at desc);

-- 4. Supabase Storage Bucket & Object Policies (health_documents_vault)
-- Insert private bucket configuration into storage.buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'health_documents_vault',
  'health_documents_vault',
  false,
  10485760, -- 10 MB limit per file
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

-- Storage Object RLS: Users can only manage files in their own folder: <profile_id>/<filename>
drop policy if exists "Users can upload own health document files" on storage.objects;
create policy "Users can upload own health document files"
  on storage.objects for insert
  with check (
    bucket_id = 'health_documents_vault'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can view own health document files" on storage.objects;
create policy "Users can view own health document files"
  on storage.objects for select
  using (
    bucket_id = 'health_documents_vault'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own health document files" on storage.objects;
create policy "Users can update own health document files"
  on storage.objects for update
  using (
    bucket_id = 'health_documents_vault'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'health_documents_vault'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own health document files" on storage.objects;
create policy "Users can delete own health document files"
  on storage.objects for delete
  using (
    bucket_id = 'health_documents_vault'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
