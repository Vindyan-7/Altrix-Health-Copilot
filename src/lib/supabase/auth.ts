import type { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured, getAuthenticatedClient } from './client';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: { message: string; code?: string } | null;
}

export interface UserProfileInfo {
  id: string;
  email: string | undefined;
  preferredLanguage: 'en' | 'te';
  createdAt: string;
}

/**
 * Register a new user with email, password and optional language preference.
 * Profile creation trigger automatically runs in Supabase on auth.users insertion.
 */
export async function signUpUser(
  email: string,
  password: string,
  preferredLanguage: 'en' | 'te' = 'en'
): Promise<AuthResult> {
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return {
      user: null,
      session: null,
      error: { message: 'Please provide a valid email address.', code: 'INVALID_EMAIL' },
    };
  }

  if (!password || password.length < 6) {
    return {
      user: null,
      session: null,
      error: { message: 'Password must be at least 6 characters long.', code: 'WEAK_PASSWORD' },
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      error: {
        message: 'Supabase authentication is not configured in this environment. Guest mode remains available.',
        code: 'NOT_CONFIGURED',
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          preferred_language: preferredLanguage,
        },
      },
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: { message: error.message, code: error.code || 'SIGNUP_FAILED' },
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (err: any) {
    return {
      user: null,
      session: null,
      error: { message: err?.message || 'An unexpected error occurred during signup.', code: 'UNEXPECTED_ERROR' },
    };
  }
}

/**
 * Authenticate existing user with email and password.
 */
export async function signInUser(
  email: string,
  password: string
): Promise<AuthResult> {
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return {
      user: null,
      session: null,
      error: { message: 'Email and password are required.', code: 'MISSING_CREDENTIALS' },
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      error: {
        message: 'Supabase authentication is not configured in this environment. Guest mode remains available.',
        code: 'NOT_CONFIGURED',
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: { message: error.message, code: error.code || 'SIGNIN_FAILED' },
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (err: any) {
    return {
      user: null,
      session: null,
      error: { message: err?.message || 'An unexpected error occurred during sign-in.', code: 'UNEXPECTED_ERROR' },
    };
  }
}

/**
 * Sign out current active session.
 */
export async function signOutUser(): Promise<{ error: { message: string } | null }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
    return { error: null };
  } catch (err: any) {
    return { error: { message: err?.message || 'Failed to sign out.' } };
  }
}

/**
 * Retrieve current authenticated user from browser session.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Server-side Bearer token verification helper.
 * Validates JWT cryptographically via Supabase Auth without trusting client claims.
 */
export async function verifyAccessToken(token: string | null | undefined): Promise<{
  user: User | null;
  error: string | null;
}> {
  if (!token || token.trim().length === 0) {
    return { user: null, error: 'Authorization token is missing.' };
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return { user: null, error: 'Authentication service is not configured.' };
  }

  try {
    const { data, error } = await supabase.auth.getUser(token.trim());
    if (error || !data.user) {
      return { user: null, error: error?.message || 'Invalid or expired authentication token.' };
    }
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Failed to verify authentication token.' };
  }
}
