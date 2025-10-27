import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// PUT /api/groups/[id]/members/[memberId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { id, memberId } = await params;
        
        // Validate UUID formats
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_GROUP_ID');
        }
        if (!uuidRegex.test(memberId)) {
          return createErrorResponse('Invalid member ID format', 400, 'INVALID_MEMBER_ID');
        }

        const updatedMember = await proxyToBackend(`/groups/${id}/members/${memberId}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(updatedMember, 200, 'Member role updated successfully');
      } catch (error: any) {
        console.error('Update member role error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group or member not found', 404, 'NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Cannot modify owner role or invalid role change', 409, 'INVALID_ROLE_CHANGE');
        }
        
        return createErrorResponse('Failed to update member role', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateMemberRole,
      rateLimit: { maxRequests: 30, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/groups/[id]/members/[memberId] - Remove member from group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { id, memberId } = await params;
        
        // Validate UUID formats
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_GROUP_ID');
        }
        if (!uuidRegex.test(memberId)) {
          return createErrorResponse('Invalid member ID format', 400, 'INVALID_MEMBER_ID');
        }

        await proxyToBackend(`/groups/${id}/members/${memberId}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Member removed from group successfully' }, 
          200, 
          'Member removed from group successfully'
        );
      } catch (error: any) {
        console.error('Remove member error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group or member not found', 404, 'NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Cannot remove group owner or member has pending bills', 409, 'CANNOT_REMOVE_MEMBER');
        }
        
        return createErrorResponse('Failed to remove member from group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}