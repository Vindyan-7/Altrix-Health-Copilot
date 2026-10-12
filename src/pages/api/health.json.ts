import type { APIRoute } from 'astro';
import { MockExtractionProvider } from '../../lib/ai/mock-provider';
import { GeminiProviderPlaceholder } from '../../lib/ai/gemini-placeholder';

export const GET: APIRoute = async () => {
  const mock = new MockExtractionProvider();
  const mockHealth = await mock.healthCheck();

  const gemini = new GeminiProviderPlaceholder();
  const geminiHealth = await gemini.healthCheck();

  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'demo-synthetic',
      providers: {
        offlineMock: mockHealth,
        geminiPlaceholder: geminiHealth,
      },
      safetyPolicies: {
        emergencyDeterministicRouting: true,
        individualizedDosingBlocked: true,
        syntheticDataSeparation: true,
        phiStorageDisabled: true,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
