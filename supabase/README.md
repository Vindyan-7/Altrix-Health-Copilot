# Supabase Database & Storage Foundation

> **CRITICAL ARCHITECTURAL POLICY:**
> This repository never connects to the hosted Supabase instance automatically and never requests live database credentials. All database migrations must be reviewed and executed manually by the Product Manager (**Vindyan**) via the Supabase Dashboard SQL Editor.

---

## Migration Architecture & Security Review

### 1. [`sql/01_initial_schema.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/01_initial_schema.sql)
- **Execution Order:** Must be executed **FIRST** on a clean or existing project.
- **Prerequisites:** Enables `uuid-ossp` extension (`create extension if not exists "uuid-ossp"`).
- **Tables Created:**
  1. `profiles`: Linked to `auth.users(id)` via `references auth.users(id) on delete cascade`.
  2. `health_documents`: Document vault metadata with `is_synthetic_demo` boolean flag.
  3. `extraction_runs`: Audit records of OCR/extraction attempts, foreign-keyed to `health_documents(id)`.
  4. `extracted_fields`: Optical uncertainty (`is_uncertain`) decoupled from human review status (`review_status`).
  5. `observations`: Longitudinal trend and timeline points scoped to `profiles(id)` and `health_documents(id)`.
  6. `audit_events`: Security event log.
- **Row Level Security (RLS):** Explicitly enabled across all 6 tables via `alter table ... enable row level security`.
- **Synthetic Data Separation:** `is_synthetic_demo` flag ensures synthetic hackathon demo records are easily partitioned and never conflated with real patient records.

### 2. [`sql/02_rls_and_storage_policies.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/02_rls_and_storage_policies.sql)
- **Execution Order:** Must be executed **SECOND** (depends on tables created in Migration 01).
- **Idempotency Guarantee:**
  - Every policy definition is preceded by `DROP POLICY IF EXISTS "..." ON ...;` ensuring 100% idempotent reruns without `policy already exists` errors.
  - The trigger is guarded by `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`.
  - The storage bucket insertion uses `ON CONFLICT (id) DO UPDATE` to safely update bucket limits if already registered.
- **Auth Trigger (`handle_new_user`):**
  - Hardened with `SECURITY DEFINER` and an explicit `SET search_path = public` to mitigate search path hijacking.
  - Revokes direct function execution from `public`, `anon`, and `authenticated` roles so it is only callable by the internal database trigger engine on `auth.users`.
- **Table-Level RLS Policy Breakdown:**
  - `profiles`:
    - `SELECT`: `auth.uid() = id` (users can only view own profile)
    - `UPDATE`: `auth.uid() = id` (users can only update own profile)
  - `health_documents`:
    - `SELECT`: `auth.uid() = profile_id and deleted_at is null`
    - `INSERT`: `with check (auth.uid() = profile_id and profile_id is not null)`
    - `UPDATE`: `using (auth.uid() = profile_id) with check (auth.uid() = profile_id)`
    - `DELETE`: `using (auth.uid() = profile_id)`
  - `extraction_runs`:
    - `SELECT`, `INSERT`, `UPDATE`: Verified through parent document ownership (`exists (select 1 from public.health_documents d where d.id = extraction_runs.document_id and d.profile_id = auth.uid())`).
  - `extracted_fields`:
    - `SELECT`, `INSERT`, `DELETE`: Scoped through parent document ownership.
    - `UPDATE`: Scoped through parent document AND restricts `reviewed_by` to `auth.uid()`.
  - `observations`:
    - `SELECT`, `INSERT`, `UPDATE`, `DELETE`: Scoped directly to `auth.uid() = profile_id`.
  - `audit_events`:
    - `SELECT`: `auth.uid() = actor_id`
    - `INSERT`: `with check (auth.uid() = actor_id and actor_id is not null)`
    - **Append-Only Immutability:** No `UPDATE` or `DELETE` policies are defined. Because RLS is enabled, any attempt by authenticated users to update or delete audit records is blocked by PostgreSQL default deny.
- **Storage Vault (`health_documents_vault`):**
  - Private bucket (`public = false`) with 10 MB file size limit and strict MIME types (`application/pdf`, `image/jpeg`, `image/png`).
  - Tenant Isolation: Storage policies on `storage.objects` strictly require `bucket_id = 'health_documents_vault'` and `(storage.foldername(name))[1] = auth.uid()::text`. Users can never access or upload files outside their personal folder.

---

## Step-by-Step Manual Execution Guide for Product Manager (Vindyan)

1. **Log in:** Open your project dashboard at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Navigate:** Click **SQL Editor** in the left navigation sidebar.
3. **Step 1 — Create Tables & Base RLS:**
   - Click **New query**.
   - Copy and paste the entire content of [`supabase/sql/01_initial_schema.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/01_initial_schema.sql).
   - Click **Run** (Ctrl/Cmd + Enter).
   - Confirm output displays `Success. No rows returned`.
4. **Step 2 — Apply Triggers, RLS Policies, Indexes & Storage:**
   - Click **New query**.
   - Copy and paste the entire content of [`supabase/sql/02_rls_and_storage_policies.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/02_rls_and_storage_policies.sql).
   - Click **Run**.
   - Confirm output displays `Success. No rows returned`.
5. **Step 3 — Run Post-Migration Verification Queries:**
   Run the following verification script in SQL Editor:
   ```sql
   -- Verify all 6 tables have RLS enabled
   select tablename, rowsecurity
   from pg_tables
   where schemaname = 'public'
   order by tablename;

   -- Verify private storage bucket exists
   select id, name, public, file_size_limit
   from storage.buckets
   where id = 'health_documents_vault';
   ```
   All 6 tables should show `rowsecurity = true`, and `health_documents_vault` should show `public = false`.

6. **Guest Mode Integrity:**
   - Confirm that the guest-accessible Copilot continues functioning completely independently without requiring a user login or active database connection.
