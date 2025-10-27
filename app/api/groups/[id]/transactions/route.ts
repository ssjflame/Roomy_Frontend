import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/groups/[id]/transactions - Get group transactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_ID');
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        
        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
          return createErrorResponse('Invalid pagination parameters', 400, 'INVALID_PAGINATION');
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) {
          queryParams.append('status', status);
        }
        if (type) {
          queryParams.append('type', type);
        }

        const transactions = await proxyToBackend(`/groups/${id}/transactions?${queryParams.toString()}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(transactions, 200, 'Group transactions retrieved successfully');
      } catch (error: any) {
        console.error('Get group transactions error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found', 404, 'GROUP_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - not a group member', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve group transactions', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}