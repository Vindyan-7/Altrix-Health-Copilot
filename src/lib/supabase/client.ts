import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase Client Initialization
 * Uses strictly the publishable key (never a service-role key).
 * Enforces that user actions are restricted by Row Level Security (RLS).
 */

// Safely read environment variables across Astro SSR, client, and Vitest environments
const env = ((import.meta as unknown as { env?: Record<string, string> }).env) ||
  (typeof process !== 'undefined' ? process.env : {}) || {};

const supabaseUrl = (env.PUBLIC_SUPABASE_URL || '') as string;
const supabasePublishableKey = (env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || '') as string;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim().length > 0 &&
  !supabaseUrl.includes('your-project') &&
  supabasePublishableKey &&
  supabasePublishableKey.trim().length > 0 &&
  !supabasePublishableKey.includes('your-supabase-publishable-key')
);

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return clientInstance;
}

/**
 * Creates a scoped Supabase client authenticated as the specific user.
 * Used by serverless endpoints so all queries run under the user's RLS policies (auth.uid()).
 */
export function getAuthenticatedClient(accessToken: string): SupabaseClient | null {
  if (!isSupabaseConfigured || !accessToken) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Authentication State Helpers
 */
export async function getAuthUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signOut();
  return { error };
}
