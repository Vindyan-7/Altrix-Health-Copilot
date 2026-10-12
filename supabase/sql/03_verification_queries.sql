-- =============================================================================
-- Altrix Labs Health Copilot — Migration 03: Read-Only Verification Queries
-- FOR MANUAL REVIEW AND EXECUTION IN SUPABASE SQL EDITOR
-- Safe, read-only checks: does not insert, update, delete, or alter any data.
-- =============================================================================

-- 1. Check UUID extension
select extname, extversion
from pg_extension
where extname = 'uuid-ossp';

-- 2. Verify all 6 user tables exist in the public schema
select table_name, table_type
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'health_documents',
    'extraction_runs',
    'extracted_fields',
    'observations',
    'audit_events'
  )
order by table_name;

-- 3. Verify Row Level Security (RLS) is ENABLED on all 6 tables
-- (Every returned row must have rowsecurity = true)
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'health_documents',
    'extraction_runs',
    'extracted_fields',
    'observations',
    'audit_events'
  )
order by tablename;

-- 4. Verify all RLS policies across the public schema
-- (Should list policies for profiles, health_documents, extraction_runs, extracted_fields, observations, audit_events)
select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 5. Verify audit_events immutability (No UPDATE or DELETE policies must exist)
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'audit_events'
  and cmd in ('UPDATE', 'DELETE');
-- (Expected result: 0 rows returned, proving append-only immutability)

-- 6. Verify Auth Trigger function exists with SECURITY DEFINER and search_path = public
select proname, prosecdef, proconfig
from pg_proc
where proname = 'handle_new_user';
-- (Expected result: prosecdef = true, proconfig = {search_path=public})

-- 7. Verify Auth Trigger is attached to auth.users
select trigger_name, event_manipulation, event_object_schema, event_object_table, action_timing
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
  and trigger_name = 'on_auth_user_created';

-- 8. Verify Private Storage Bucket 'health_documents_vault' exists and is not public
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'health_documents_vault';
-- (Expected result: public = false, file_size_limit = 10485760)

-- 9. Verify Storage Object RLS Policies
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like '%health document%';
-- (Expected result: policies for INSERT, SELECT, UPDATE, DELETE enforcing folder auth.uid() isolation)
