import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/groups/[id]/join - Join group with invitation code
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
        const body = await request.json();
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_ID');
        }

        // Validate invitation code if provided
        if (body.invitationCode && typeof body.invitationCode !== 'string') {
          return createErrorResponse('Invalid invitation code format', 400, 'INVALID_INVITATION_CODE');
        }

        const membership = await proxyToBackend(`/groups/${id}/join`, {
          method: 'POST',
          body: JSON.stringify(body),
        }, token);

        return createSuccessResponse(membership, 201, 'Successfully joined group');
      } catch (error: any) {
        console.error('Join group error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found or invitation expired', 404, 'GROUP_OR_INVITATION_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Invalid invitation code or access denied', 403, 'INVALID_INVITATION');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('User is already a member of this group', 409, 'ALREADY_MEMBER');
        }
        
        return createErrorResponse('Failed to join group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 30, windowMs: 60000 },
    }
  );

  return handler(request);
}