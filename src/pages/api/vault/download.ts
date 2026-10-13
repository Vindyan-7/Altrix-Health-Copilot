import type { APIRoute } from 'astro';
import { z } from 'zod';
import { verifyAccessToken } from '../../../lib/supabase/auth';
import { getAuthenticatedClient, isSupabaseConfigured } from '../../../lib/supabase/client';

export const prerender = false;

const DownloadQuerySchema = z.object({
  storage_path: z.string().min(1).max(255),
});

/**
 * GET /api/vault/download?storage_path=<path>
 * Protected server endpoint: Generates a short-lived signed URL (60 seconds)
 * for private storage documents strictly owned by the authenticated user.
 */
export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  // 1. Enforce Server-Side Authorization Gate
  const { user, error } = await verifyAccessToken(token);
  if (!user || error) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized: A valid authenticated session is required to download documents.',
        code: 'UNAUTHORIZED',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!isSupabaseConfigured) {
    return new Response(
      JSON.stringify({
        error: 'Supabase storage is not configured in this environment.',
        code: 'NOT_CONFIGURED',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const storagePath = url.searchParams.get('storage_path');

  const parseResult = DownloadQuerySchema.safeParse({ storage_path: storagePath });
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid storage_path parameter', code: 'INVALID_QUERY' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Strict Tenant Isolation: User can only access files in their own folder
  const expectedPrefix = `${user.id}/`;
  if (!parseResult.data.storage_path.startsWith(expectedPrefix)) {
    return new Response(
      JSON.stringify({
        error: 'Access denied: You cannot download documents belonging to another user.',
        code: 'FORBIDDEN',
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = getAuthenticatedClient(token!);
  if (!client) {
    return new Response(
      JSON.stringify({ error: 'Failed to initialize authenticated client', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Generate a temporary signed URL valid for 60 seconds only
    const { data, error: signError } = await client.storage
      .from('health_documents_vault')
      .createSignedUrl(parseResult.data.storage_path, 60);

    if (signError || !data?.signedUrl) {
      return new Response(
        JSON.stringify({
          error: signError?.message || 'Failed to create secure download link. Storage bucket may not be initialized.',
          code: 'STORAGE_ERROR',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: data.signedUrl }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
