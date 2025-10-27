import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/health/basic - Basic health check
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const healthData = await proxyToBackend('/health/basic', {
          method: 'GET',
        });

        return createSuccessResponse(healthData, 200, 'Health check completed successfully');
      } catch (error: any) {
        console.error('Basic health check error:', error);
        
        if (error.message.includes('503')) {
          return createErrorResponse('Service temporarily unavailable', 503, 'SERVICE_UNAVAILABLE');
        }
        
        return createErrorResponse('Health check failed', 500, 'HEALTH_CHECK_FAILED');
      }
    },
    {
      requireAuth: false,
      rateLimit: { maxRequests: 60, windowMs: 60000 },
    }
  );

  return handler(request);
}