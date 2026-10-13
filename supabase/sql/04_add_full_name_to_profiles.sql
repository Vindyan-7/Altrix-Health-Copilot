-- 04_add_full_name_to_profiles.sql
-- Migration to support storing full_name on public.profiles table
-- For manual review and execution in Supabase SQL Editor if desired.

-- 1. Add full_name column to public.profiles if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- 2. Update the handle_new_user trigger function to propagate full_name from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, preferred_language, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', NULL),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        preferred_language = EXCLUDED.preferred_language,
        updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
