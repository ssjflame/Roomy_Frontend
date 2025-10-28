import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/proposals/[id]/execute - Execute proposal
export async function POST(
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
          return createErrorResponse('Invalid proposal ID format', 400, 'INVALID_ID');
        }

        const result = await proxyToBackend(`/proposals/${id}/execute`, {
          method: 'POST',
        }, token);

        return createSuccessResponse(result, 200, 'Proposal executed successfully');
      } catch (error: any) {
        console.error('Execute proposal error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Proposal not found', 404, 'PROPOSAL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('400')) {
          return createErrorResponse('Proposal cannot be executed', 400, 'EXECUTION_ERROR');
        }
        
        return createErrorResponse('Failed to execute proposal', 500, 'EXECUTION_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    }
  );

  return handler(request);
}