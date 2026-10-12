-- =============================================================================
-- Altrix Labs Health Copilot — Initial Schema Migration
-- FOR MANUAL REVIEW AND EXECUTION ONLY BY PRODUCT MANAGER (Vindyan)
-- DO NOT RUN AUTOMATICALLY
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    preferred_language text not null default 'en' check (preferred_language in ('en', 'te')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Health Documents
create table if not exists public.health_documents (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references public.profiles(id) on delete cascade,
    document_type text not null check (document_type in ('lab_report', 'prescription', 'diagnostic_report', 'discharge_summary', 'wellness_log', 'other')),
    storage_path text not null,
    original_filename_sanitized text not null,
    mime_type text not null,
    file_size_bytes bigint not null,
    document_date date,
    source_facility text,
    status text not null default 'pending_review' check (status in ('uploaded', 'extracted', 'pending_review', 'confirmed', 'archived')),
    is_synthetic_demo boolean not null default false,
    consent_version text not null default '1.0',
    created_at timestamptz not null default now(),
    deleted_at timestamptz
);

-- 3. Extraction Runs
create table if not exists public.extraction_runs (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references public.health_documents(id) on delete cascade,
    provider text not null,
    model_id text,
    schema_version text not null default '1.0',
    status text not null check (status in ('running', 'succeeded', 'failed', 'fallback_mock')),
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    error_code text,
    latency_ms integer
);

-- 4. Extracted Fields
create table if not exists public.extracted_fields (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid not null references public.health_documents(id) on delete cascade,
    field_name text not null,
    category text not null default 'general',
    value_json jsonb not null,
    normalized_value_json jsonb,
    unit text,
    reference_range_json jsonb,
    source_page integer not null default 1,
    source_region_json jsonb,
    confidence numeric(4,3) check (confidence >= 0 and confidence <= 1),
    is_uncertain boolean not null default false,
    uncertainty_reason text,
    review_status text not null default 'unreviewed' check (review_status in ('unreviewed', 'confirmed', 'corrected')),
    reviewed_at timestamptz,
    reviewed_by uuid references public.profiles(id)
);

-- 5. Observations (Normalized for Timeline and Trends)
create table if not exists public.observations (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references public.profiles(id) on delete cascade,
    document_id uuid references public.health_documents(id) on delete cascade,
    code_or_name text not null,
    value_numeric numeric,
    value_text text,
    unit text,
    reference_low numeric,
    reference_high numeric,
    interpretation text check (interpretation in ('normal', 'low', 'high', 'critical', 'unspecified')),
    observed_at date,
    review_status text not null default 'unreviewed',
    source_field_id uuid references public.extracted_fields(id) on delete set null
);

-- 6. Audit Events (No PHI in metadata)
create table if not exists public.audit_events (
    id uuid primary key default uuid_generate_v4(),
    actor_id uuid references public.profiles(id),
    event_type text not null,
    entity_type text not null,
    entity_id uuid,
    minimal_metadata_json jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.health_documents enable row level security;
alter table public.extracted_fields enable row level security;
alter table public.observations enable row level security;
alter table public.audit_events enable row level security;

-- Demo notice:
comment on table public.health_documents is 'Health documents table. For demo runs, is_synthetic_demo = true.';
