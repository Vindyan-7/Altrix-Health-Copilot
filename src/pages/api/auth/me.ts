import type { APIRoute } from 'astro';
import { verifyAccessToken } from '../../../lib/supabase/auth';

export const prerender = false;

/**
 * GET /api/auth/me
 * Returns authenticated user info verified server-side via Supabase JWT.
 * Returns 401 if unauthenticated.
 */
export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  const { user, error } = await verifyAccessToken(token);

  if (!user || error) {
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: error || 'Unauthenticated',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        preferredLanguage: user.user_metadata?.preferred_language || 'en',
        createdAt: user.created_at,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
};
