import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/groups/[id]/bills - Get group bills
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
        
        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
          return createErrorResponse('Invalid pagination parameters', 400, 'INVALID_PAGINATION');
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        console.log('🚀 Making request to backend:', `/groups/${id}/bills?${queryParams.toString()}`);
        console.log('🔑 Using token:', token ? 'Present' : 'Missing');
        console.log('📊 Request params:', { groupId: id, page, limit });

        const backendResponse = await proxyToBackend(`/groups/${id}/bills?${queryParams.toString()}`, {
          method: 'GET',
        }, token);

        console.log('🔍 Backend response for group bills:', backendResponse);
        console.log('📡 Response type:', typeof backendResponse);
        console.log('📡 Response is array:', Array.isArray(backendResponse));
        
        // According to API docs, /api/groups/:groupId/bills should return direct array of bills
        // Extract bills array from backend response if it's paginated
        let bills: any[] = [];
        
        if (backendResponse && typeof backendResponse === 'object' && 'bills' in backendResponse) {
          const extractedBills = (backendResponse as any).bills;
          bills = Array.isArray(extractedBills) ? extractedBills : [];
          console.log('📋 Extracted bills array from paginated response:', bills.length, 'bills');
        } else if (Array.isArray(backendResponse)) {
          bills = backendResponse;
          console.log('📋 Direct bills array received:', bills.length, 'bills');
        } else {
          console.warn('⚠️ Unexpected backend response structure:', backendResponse);
          bills = [];
        }

        return createSuccessResponse(bills, 200, 'Group bills retrieved successfully');
      } catch (error: any) {
        console.error('❌ Get group bills error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error code:', error.code);
        
        // Check for network connectivity issues
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.error('🚫 Network connectivity issue - backend may not be running');
          return createErrorResponse('Backend service unavailable', 503, 'SERVICE_UNAVAILABLE');
        }
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found', 404, 'GROUP_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - not a group member', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve group bills', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}