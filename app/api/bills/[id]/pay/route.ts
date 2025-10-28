import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/bills/[id]/pay - Pay bill
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
          return createErrorResponse('Invalid bill ID format', 400, 'INVALID_ID');
        }

        const body = await request.json();

        const result = await proxyToBackend(`/bills/${id}/pay`, {
          method: 'POST',
          body: JSON.stringify(body),
        }, token);

        return createSuccessResponse(result, 200, 'Bill payment initiated successfully');
      } catch (error: any) {
        console.error('Pay bill error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Bill not found', 404, 'BILL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('400')) {
          return createErrorResponse('Invalid payment data', 400, 'INVALID_PAYMENT_DATA');
        }
        
        return createErrorResponse('Failed to initiate bill payment', 500, 'PAYMENT_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 10, windowMs: 60000 },
    }
  );

  return handler(request);
}