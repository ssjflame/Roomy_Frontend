import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/recurring/process - Process due recurring bills
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const result = await proxyToBackend('/recurring/process', {
          method: 'POST',
        }, token);

        return createSuccessResponse(result, 200, 'Recurring bills processed successfully');
      } catch (error: any) {
        console.error('Process recurring bills error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to process recurring bills', 500, 'PROCESS_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    }
  );

  return handler(request);
}