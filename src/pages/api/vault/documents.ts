import type { APIRoute } from 'astro';
import { z } from 'zod';
import { verifyAccessToken } from '../../../lib/supabase/auth';
import { getAuthenticatedClient, isSupabaseConfigured } from '../../../lib/supabase/client';

export const prerender = false;

const CreateDocumentSchema = z.object({
  document_type: z.enum(['lab_report', 'prescription', 'diagnostic_report', 'discharge_summary', 'wellness_log', 'other']),
  storage_path: z.string().min(1).max(255),
  original_filename_sanitized: z.string().min(1).max(255),
  mime_type: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  file_size_bytes: z.number().int().positive().max(10485760), // 10 MB max
  document_date: z.string().optional(),
  source_facility: z.string().max(100).optional(),
  is_synthetic_demo: z.boolean().default(false),
});

/**
 * GET /api/vault/documents
 * Protected server endpoint: strictly requires a valid Bearer token.
 * All queries are scoped to auth.uid() by Row Level Security in Supabase.
 */
export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  // 1. Enforce Server-Side Authorization Gate
  const { user, error } = await verifyAccessToken(token);
  if (!user || error) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized: A valid authenticated session is required to access private health records.',
        code: 'UNAUTHORIZED',
        details: error,
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 2. Query scoped data via authenticated client
  if (!isSupabaseConfigured) {
    return new Response(
      JSON.stringify({
        error: 'Supabase storage is not configured in this environment.',
        code: 'NOT_CONFIGURED',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = getAuthenticatedClient(token!);
  if (!client) {
    return new Response(
      JSON.stringify({ error: 'Failed to initialize authenticated database client', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { data, error: dbError } = await client
    .from('health_documents')
    .select('id, profile_id, document_type, document_date, source_facility, status, is_synthetic_demo, created_at')
    .order('created_at', { ascending: false });

  if (dbError) {
    return new Response(
      JSON.stringify({ error: dbError.message, code: 'DATABASE_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      documents: data || [],
      userId: user.id,
      count: data?.length || 0,
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

/**
 * POST /api/vault/documents
 * Protected server endpoint: strictly requires a valid Bearer token.
 * Automatically pins profile_id to verified user.id so cross-user injection is impossible.
 */
export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  // 1. Enforce Server-Side Authorization Gate
  const { user, error } = await verifyAccessToken(token);
  if (!user || error) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized: A valid authenticated session is required to save health documents.',
        code: 'UNAUTHORIZED',
        details: error,
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
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

  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request body', code: 'BAD_REQUEST' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = CreateDocumentSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: parseResult.error.format(),
          code: 'INVALID_PAYLOAD',
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = getAuthenticatedClient(token!);
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Failed to initialize authenticated database client', code: 'INTERNAL_ERROR' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Always enforce profile_id = user.id from the cryptographically verified JWT
    const newDoc = {
      ...parseResult.data,
      profile_id: user.id,
      status: 'pending_review',
    };

    const { data, error: insertError } = await client
      .from('health_documents')
      .insert(newDoc)
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message, code: 'DATABASE_ERROR' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ document: data, success: true }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
