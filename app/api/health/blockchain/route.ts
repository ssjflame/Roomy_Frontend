import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/health/blockchain - Blockchain health check
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const blockchainHealth = await proxyToBackend('/health/blockchain', {
          method: 'GET',
        });

        return createSuccessResponse(blockchainHealth, 200, 'Blockchain health check completed successfully');
      } catch (error: any) {
        console.error('Blockchain health check error:', error);
        
        if (error.message.includes('503')) {
          return createErrorResponse('Blockchain service temporarily unavailable', 503, 'BLOCKCHAIN_UNAVAILABLE');
        }
        if (error.message.includes('502')) {
          return createErrorResponse('Blockchain connection error', 502, 'BLOCKCHAIN_CONNECTION_ERROR');
        }
        
        return createErrorResponse('Blockchain health check failed', 500, 'BLOCKCHAIN_HEALTH_CHECK_FAILED');
      }
    },
    {
      requireAuth: false,
      rateLimit: { maxRequests: 30, windowMs: 60000 },
    }
  );

  return handler(request);
}