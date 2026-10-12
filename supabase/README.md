# Supabase Database & Storage Foundation

> **CRITICAL ARCHITECTURAL POLICY:**
> This repository never connects to the hosted Supabase instance automatically and never requests live database credentials. All database migrations must be reviewed and executed manually by the Product Manager (**Vindyan**) via the Supabase Dashboard SQL Editor.

---

## Migration Architecture & Security Review

### 1. [`sql/01_initial_schema.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/01_initial_schema.sql)
- **Tables Created:** `profiles`, `health_documents`, `extraction_runs`, `extracted_fields`, `observations`, and `audit_events`.
- **Foreign Key Cascade:** `profiles.id` references `auth.users(id) on delete cascade` to ensure user account deletions clean up profile records.
- **Row Level Security (RLS):** Explicitly enabled across all tables, including `extraction_runs`.
- **Synthetic Data Separation:** `is_synthetic_demo` flag segregates demo documents.
- **Data Integrity:** Optical uncertainty (`is_uncertain`) is decoupled from human review status (`review_status`).

### 2. [`sql/02_rls_and_storage_policies.sql`](file:///c:/Projects/person/altrix-health-copilot/supabase/sql/02_rls_and_storage_policies.sql)
- **Auth Trigger (`handle_new_user`):**
  - Configured with `SECURITY DEFINER` and hardened with an explicit `SET search_path = public` to prevent search path hijacking.
  - Direct execution revoked from `public`, `anon`, and `authenticated` roles (callable only by the database trigger engine).
- **Table-Level RLS Policies:**
  - `profiles`: SELECT and UPDATE restricted strictly to `auth.uid() = id`.
  - `health_documents`: SELECT, INSERT, UPDATE, DELETE restricted strictly to `auth.uid() = profile_id`.
  - `extraction_runs`: Scoped through the parent document to ensure only the document owner can view or insert runs.
  - `extracted_fields`: Scoped through the parent document. UPDATE enforces review status checks and ensures `reviewed_by` matches `auth.uid()`.
  - `observations`: Full CRUD restricted strictly to `auth.uid() = profile_id`.
  - `audit_events`: Strictly append-only. SELECT and INSERT allowed only for `auth.uid() = actor_id`. UPDATE and DELETE policies are omitted to ensure tamper-proof audit trails.
- **Foreign Key & Query Indexes:**
  - `idx_health_documents_profile_status`: Composite index on `(profile_id, status)` for vault filtering.
  - `idx_observations_profile_code_date`: Composite index on `(profile_id, code_or_name, observed_at desc)` for timeline and longitudinal graphs.
  - `idx_extracted_fields_document_id`: Foreign key index on `(document_id)`.
  - `idx_extraction_runs_document_id`: Foreign key index on `(document_id)`.
  - `idx_audit_events_actor_created`: Audit query index on `(actor_id, created_at desc)`.
- **Storage Vault (`health_documents_vault`):**
  - Private bucket with a 10MB file size limit and MIME-type restrictions (`application/pdf`, `image/jpeg`, `image/png`).
  - Isolated folder policies: Users can only upload, read, update (for upserts), and delete files in their own folder: `<auth.uid()>/<filename>`.

---

## Execution Instructions for Product Manager (Vindyan)

1. Log into your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left navigation sidebar.
3. Open a new query tab and paste the contents of `01_initial_schema.sql`.
4. Click **Run** and verify that all 6 tables and RLS are created.
5. Open a second query tab and paste the contents of `02_rls_and_storage_policies.sql`.
6. Click **Run** and verify that triggers, RLS policies, indexes, and storage bucket configuration are established.
7. Confirm that the Guest Health Guide continues running independently in guest/demo mode without database dependency.
