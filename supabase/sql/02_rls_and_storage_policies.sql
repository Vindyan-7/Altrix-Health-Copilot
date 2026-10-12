-- =============================================================================
-- Altrix Labs Health Copilot — Migration 02: RLS Policies, Triggers & Storage
-- FOR MANUAL REVIEW AND EXECUTION ONLY BY PRODUCT MANAGER (Vindyan)
-- DO NOT CONNECT OR RUN AUTOMATICALLY
-- =============================================================================

-- 1. Profile Creation Trigger on Supabase Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Row Level Security Policies for Core Tables

-- Profiles: Users can only read and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Health Documents: Users can only manage their own documents
create policy "Users can view own health documents"
  on public.health_documents for select
  using (auth.uid() = profile_id and deleted_at is null);

create policy "Users can insert own health documents"
  on public.health_documents for insert
  with check (auth.uid() = profile_id);

create policy "Users can update own health documents"
  on public.health_documents for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- Soft delete: Users can mark their own health documents as deleted
create policy "Users can delete own health documents"
  on public.health_documents for delete
  using (auth.uid() = profile_id);

-- Extracted Fields: Scoped through parent health document
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
  );

-- Observations (Timeline & Trends): Scoped to user's profile
create policy "Users can view own observations"
  on public.observations for select
  using (auth.uid() = profile_id);

create policy "Users can insert own observations"
  on public.observations for insert
  with check (auth.uid() = profile_id);

-- Audit Events: Users can view audit events concerning their own profile
create policy "Users can view own audit events"
  on public.audit_events for select
  using (auth.uid() = actor_id);

-- 3. Performant Indexes for Timeline and Document Queries
create index if not exists idx_health_documents_profile_status
  on public.health_documents (profile_id, status)
  where deleted_at is null;

create index if not exists idx_observations_profile_code_date
  on public.observations (profile_id, code_or_name, observed_at desc);

create index if not exists idx_extracted_fields_document_id
  on public.extracted_fields (document_id);

-- 4. Supabase Storage Bucket & Object Policies (health_documents_vault)
-- Insert private bucket if storage schema exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'health_documents_vault',
  'health_documents_vault',
  false,
  10485760, -- 10 MB limit
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png'];

-- Storage Object RLS: Users can only upload and read files within their own folder: <profile_id>/<filename>
create policy "Users can upload own health document files"
  on storage.objects for insert
  with check (
    bucket_id = 'health_documents_vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own health document files"
  on storage.objects for select
  using (
    bucket_id = 'health_documents_vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own health document files"
  on storage.objects for delete
  using (
    bucket_id = 'health_documents_vault'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
