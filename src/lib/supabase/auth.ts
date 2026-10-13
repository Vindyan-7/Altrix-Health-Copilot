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
  preferredLanguage: 'en' | 'te' = 'en',
  fullName?: string
): Promise<AuthResult> {
  const trimmedName = fullName?.trim();
  if (fullName !== undefined && (!trimmedName || trimmedName.length < 2)) {
    return {
      user: null,
      session: null,
      error: { message: 'Please enter your full name (at least 2 characters).', code: 'MISSING_FULL_NAME' },
    };
  }

  const trimmedEmail = email?.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return {
      user: null,
      session: null,
      error: { message: 'Please provide a valid email address (e.g. name@example.com).', code: 'INVALID_EMAIL' },
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
    const emailRedirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth?confirmed=true`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          preferred_language: preferredLanguage,
          ...(trimmedName ? { full_name: trimmedName } : {}),
        },
      },
    });

    if (error) {
      const errMsg = error.message || '';
      const errCode = (error as any).code || '';
      const errStatus = (error as any).status;

      if (errMsg.toLowerCase().includes('rate limit') || errCode === 'over_email_send_rate_limit' || errStatus === 429) {
        return {
          user: null,
          session: null,
          error: {
            message: 'Supabase email rate limit reached for this project (free-tier default allows 3-4 emails/hour). Please wait a few minutes before trying again, or configure custom SMTP in Supabase.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        };
      }

      if (errMsg.toLowerCase().includes('already registered') || errCode === 'user_already_exists') {
        return {
          user: null,
          session: null,
          error: {
            message: 'An account with this email address already exists. Please sign in instead.',
            code: 'USER_ALREADY_EXISTS',
          },
        };
      }

      return {
        user: null,
        session: null,
        error: { message: error.message, code: errCode || 'SIGNUP_FAILED' },
      };
    }

    // Supabase anti-enumeration: existing user signup with email confirmation returns user with empty identities
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        user: null,
        session: null,
        error: {
          message: 'An account with this email address already exists. Please sign in instead.',
          code: 'USER_ALREADY_EXISTS',
        },
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
      const errMsg = error.message || '';
      const errCode = (error as any).code || '';

      if (errMsg.toLowerCase().includes('invalid login credentials')) {
        return {
          user: null,
          session: null,
          error: {
            message: 'Invalid email or password. Please verify your credentials and try again.',
            code: 'INVALID_CREDENTIALS',
          },
        };
      }

      if (errMsg.toLowerCase().includes('email not confirmed')) {
        return {
          user: null,
          session: null,
          error: {
            message: 'Your email address has not been confirmed yet. Please check your inbox for the confirmation email.',
            code: 'EMAIL_NOT_CONFIRMED',
          },
        };
      }

      return {
        user: null,
        session: null,
        error: { message: error.message, code: errCode || 'SIGNIN_FAILED' },
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

/**
 * Update authenticated user profile details (full name and preferred language).
 * Persists to auth user metadata and attempts updating public.profiles.
 */
export async function updateUserProfile(params: {
  fullName?: string;
  preferredLanguage?: 'en' | 'te';
}): Promise<{ error: { message: string } | null }> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured) {
    return { error: { message: 'Supabase authentication is not configured.' } };
  }

  const trimmedName = params.fullName?.trim();
  if (params.fullName !== undefined && (!trimmedName || trimmedName.length < 2)) {
    return { error: { message: 'Full name must be at least 2 characters.' } };
  }

  try {
    const updateData: Record<string, any> = {};
    if (trimmedName !== undefined) updateData.full_name = trimmedName;
    if (params.preferredLanguage !== undefined) updateData.preferred_language = params.preferredLanguage;

    // 1. Update Auth user_metadata
    const { data: userData, error: authError } = await supabase.auth.updateUser({
      data: updateData,
    });

    if (authError) {
      return { error: { message: authError.message } };
    }

    // 2. Best-effort update to public.profiles if user exists
    if (userData.user) {
      try {
        const profileUpdate: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (params.preferredLanguage !== undefined) profileUpdate.preferred_language = params.preferredLanguage;
        if (trimmedName !== undefined) profileUpdate.full_name = trimmedName;

        await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', userData.user.id);
      } catch {
        // Ignored if column or table not migrated yet; metadata is the source of truth
      }
    }

    return { error: null };
  } catch (err: any) {
    return { error: { message: err?.message || 'Failed to update profile.' } };
  }
}
