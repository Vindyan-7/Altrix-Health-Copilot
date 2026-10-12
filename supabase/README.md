# Supabase Database & Storage Foundation

> **CRITICAL ARCHITECTURAL POLICY:**
> This repository never connects to the hosted Supabase instance automatically and never requests live database credentials. All database migrations must be reviewed and executed manually by the Product Manager (**Vindyan**) via the Supabase Dashboard SQL Editor.

---

## Migration Files

1. [`sql/01_initial_schema.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/01_initial_schema.sql):
   - Creates the core schema: `profiles`, `health_documents`, `extraction_runs`, `extracted_fields`, `observations`, and `audit_events`.
   - Enables Row Level Security (RLS) on all tables.
   - Enforces synthetic vs real data flag (`is_synthetic_demo`).
   - Restricts optical uncertainty and review status independence.

2. [`sql/02_rls_and_storage_policies.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/02_rls_and_storage_policies.sql):
   - **Auth Integration:** Automatic user profile generation trigger on `auth.users` signup (`handle_new_user`).
   - **RLS Access Policies:** Restricts user access strictly to records matching `auth.uid() = profile_id`.
   - **Performance Indexes:** Optimized composite indexes for timeline rendering (`observations`), document filtering, and field lookup.
   - **Storage Vault:** Configures the private storage bucket `health_documents_vault` (10MB limit, PDF/PNG/JPEG) with isolated folder ownership policies (`(storage.foldername(name))[1] = auth.uid()::text`).

---

## Execution Instructions for Product Manager (Vindyan)

1. Log into your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left navigation sidebar.
3. Open a new query tab and paste the contents of `01_initial_schema.sql`.
4. Click **Run** and verify all tables are created.
5. Open a second query tab and paste the contents of `02_rls_and_storage_policies.sql`.
6. Click **Run** and verify triggers, RLS policies, indexes, and storage bucket configuration are created.
7. Confirm that guest/demo mode continues running locally without requiring database connectivity.
