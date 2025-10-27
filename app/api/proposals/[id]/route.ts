import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/proposals/[id] - Get proposal by ID
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
          return createErrorResponse('Invalid proposal ID format', 400, 'INVALID_ID');
        }

        const proposal = await proxyToBackend(`/proposals/${id}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(proposal, 200, 'Proposal retrieved successfully');
      } catch (error: any) {
        console.error('Get proposal by ID error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Proposal not found', 404, 'PROPOSAL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve proposal', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// PUT /api/proposals/[id] - Update proposal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
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

        const updatedProposal = await proxyToBackend(`/proposals/${id}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(updatedProposal, 200, 'Proposal updated successfully');
      } catch (error: any) {
        console.error('Update proposal error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Proposal not found', 404, 'PROPOSAL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Proposal cannot be updated in current status', 409, 'INVALID_STATUS');
        }
        
        return createErrorResponse('Failed to update proposal', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateProposal,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/proposals/[id] - Delete proposal
export async function DELETE(
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

        await proxyToBackend(`/proposals/${id}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Proposal deleted successfully' }, 
          200, 
          'Proposal deleted successfully'
        );
      } catch (error: any) {
        console.error('Delete proposal error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Proposal not found', 404, 'PROPOSAL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Proposal cannot be deleted in current status', 409, 'INVALID_STATUS');
        }
        
        return createErrorResponse('Failed to delete proposal', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}