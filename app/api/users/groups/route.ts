import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/users/groups - Get user's groups
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const groups = await proxyToBackend(`/users/groups?${queryParams}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(groups, 200, 'User groups retrieved successfully');
      } catch (error: any) {
        console.error('Get user groups error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        
        return createErrorResponse('Failed to retrieve user groups', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}