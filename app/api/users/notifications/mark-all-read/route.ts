import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// PUT /api/users/notifications/mark-all-read - Mark all notifications as read
export async function PUT(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const result = await proxyToBackend('/users/notifications/mark-all-read', {
          method: 'PUT',
        }, token);

        return createSuccessResponse(result, 200, 'All notifications marked as read');
      } catch (error: any) {
        console.error('Mark all notifications as read error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        
        return createErrorResponse('Failed to mark all notifications as read', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 10, windowMs: 60000 },
    }
  );

  return handler(request);
}