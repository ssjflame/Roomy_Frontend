import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/auth/logout-all - Logout from all devices
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const result = await proxyToBackend('/auth/logout-all', {
          method: 'POST',
        }, token);

        return createSuccessResponse(result, 200, 'Logged out from all devices successfully');
      } catch (error: any) {
        console.error('Logout all devices error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('User session not found', 404, 'SESSION_NOT_FOUND');
        }
        
        return createErrorResponse('Failed to logout from all devices', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
    }
  );

  return handler(request);
}