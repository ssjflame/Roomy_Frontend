import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/proposals - Get user proposals
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const status = searchParams.get('status');
        const groupId = searchParams.get('groupId');

        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (status) queryParams.append('status', status);
        if (groupId) queryParams.append('groupId', groupId);

        const queryString = queryParams.toString();
        const endpoint = `/proposals${queryString ? `?${queryString}` : ''}`;

        const proposals = await proxyToBackend(endpoint, {
          method: 'GET',
        }, token);

        return createSuccessResponse(proposals);
      } catch (error: any) {
        console.error('Get proposals error:', error);
        return createErrorResponse('Failed to fetch proposals', 500, 'FETCH_PROPOSALS_ERROR');
      }
    }
  );

  return handler(request);
}

// POST /api/proposals - Create proposal
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const body = await request.json();
        const { billId, title, votingDeadline } = body;

        // Validate required fields
        if (!billId || !title || !votingDeadline) {
          return createErrorResponse('Missing required fields: billId, title, votingDeadline', 400, 'VALIDATION_ERROR');
        }

        const proposal = await proxyToBackend('/proposals', {
          method: 'POST',
          body: JSON.stringify(body),
        }, token);

        return createSuccessResponse(proposal, 201, 'Proposal created successfully');
      } catch (error: any) {
        console.error('Create proposal error:', error);
        if (error.status === 400) {
          return createErrorResponse(error.message || 'Invalid proposal data', 400, 'VALIDATION_ERROR');
        }
        if (error.status === 403) {
          return createErrorResponse('Insufficient permissions to create proposal', 403, 'PERMISSION_DENIED');
        }
        return createErrorResponse('Failed to create proposal', 500, 'CREATE_PROPOSAL_ERROR');
      }
    }
  );

  return handler(request);
}
