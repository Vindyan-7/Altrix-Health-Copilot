import type { APIRoute } from 'astro';
import { MockExtractionProvider } from '../../lib/ai/mock-provider';
import { GeminiProvider } from '../../lib/ai/gemini-provider';

export const prerender = false;

export const GET: APIRoute = async () => {
  const mock = new MockExtractionProvider();
  const mockHealth = await mock.healthCheck();

  const gemini = new GeminiProvider();
  const geminiHealth = await gemini.healthCheck();

  // Inspect configuration presence strictly as booleans (NEVER expose values)
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const hasSupabaseUrl = Boolean(process.env.PUBLIC_SUPABASE_URL && process.env.PUBLIC_SUPABASE_URL.trim().length > 0);
  const hasSupabaseKey = Boolean(process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim().length > 0);

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
