import type { APIRoute } from 'astro';
import { MockExtractionProvider } from '../../lib/ai/mock-provider';
import { GeminiProvider } from '../../lib/ai/gemini-provider';

export const prerender = false;

export const GET: APIRoute = async () => {
  const mock = new MockExtractionProvider();
  const mockHealth = await mock.healthCheck();

  const gemini = new GeminiProvider();
  const geminiHealth = await gemini.healthCheck();

  // Inspect configuration presence safely across SSR & Node environments
  const env = ((import.meta as unknown as { env?: Record<string, string> }).env) ||
    (typeof process !== 'undefined' ? process.env : {}) || {};
  const geminiKey = (env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '')) as string;
  const geminiModel = (env.GEMINI_MODEL || (typeof process !== 'undefined' ? process.env.GEMINI_MODEL : '')) || 'gemini-3.8-flash';
  const supabaseUrl = (env.PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : '')) as string;
  const supabaseKey = (env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY : '')) as string;

  const hasGeminiKey = Boolean(geminiKey && geminiKey.trim().length > 0 && !geminiKey.includes('your-'));
  const hasSupabaseUrl = Boolean(supabaseUrl && supabaseUrl.trim().length > 0 && !supabaseUrl.includes('your-'));
  const hasSupabaseKey = Boolean(supabaseKey && supabaseKey.trim().length > 0 && !supabaseKey.includes('your-'));

  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'demo-synthetic',
      runtime: 'vercel-serverless',
      configuration: {
        geminiConfigured: hasGeminiKey,
        geminiModel: geminiModel,
        supabaseConfigured: hasSupabaseUrl && hasSupabaseKey,
      },
      providers: {
        offlineMock: mockHealth,
        geminiPlaceholder: {
          ...geminiHealth,
          isConfigured: hasGeminiKey,
        },
      },
      safetyPolicies: {
        emergencyDeterministicRouting: true,
        individualizedDosingBlocked: true,
        syntheticDataSeparation: true,
        phiStorageDisabled: true,
        secretsExposedToClient: false,
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
