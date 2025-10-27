import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/transactions/intent/[intentId]/status - Get transaction intent status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ intentId: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { intentId } = await params;
        
        // Validate intent ID format (assuming it's a UUID or similar)
        if (!intentId || intentId.trim().length === 0) {
          return createErrorResponse('Invalid intent ID', 400, 'INVALID_INTENT_ID');
        }

        const status = await proxyToBackend(`/transactions/intent/${intentId}/status`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(status, 200, 'Transaction intent status retrieved successfully');
      } catch (error: any) {
        console.error('Get transaction intent status error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Transaction intent not found', 404, 'INTENT_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied to transaction intent', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve transaction intent status', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 200, windowMs: 60000 }, // Higher limit for status checks
    }
  );

  return handler(request);
}