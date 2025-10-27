import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/groups/[id]/members - Get group members
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
        const { searchParams } = new URL(request.url);
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_ID');
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const role = searchParams.get('role');

        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (role) queryParams.append('role', role);

        const queryString = queryParams.toString();
        const endpoint = `/groups/${id}/members${queryString ? `?${queryString}` : ''}`;

        const members = await proxyToBackend(endpoint, {
          method: 'GET',
        }, token);

        return createSuccessResponse(members, 200, 'Group members retrieved successfully');
      } catch (error: any) {
        console.error('Get group members error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found', 404, 'GROUP_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - not a group member', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve group members', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// POST /api/groups/[id]/members - Add member to group
export async function POST(
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
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_ID');
        }

        const newMember = await proxyToBackend(`/groups/${id}/members`, {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(newMember, 201, 'Member added to group successfully');
      } catch (error: any) {
        console.error('Add group member error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group or user not found', 404, 'NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('User is already a member of this group', 409, 'ALREADY_MEMBER');
        }
        
        return createErrorResponse('Failed to add member to group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.InviteMember,
      rateLimit: { maxRequests: 30, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/groups/[id]/members - Remove member from group
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
          return createErrorResponse('User ID is required', 400, 'MISSING_USER_ID');
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id) || !uuidRegex.test(userId)) {
          return createErrorResponse('Invalid ID format', 400, 'INVALID_ID');
        }

        await proxyToBackend(`/groups/${id}/members/${userId}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Member removed from group successfully' }, 
          200, 
          'Member removed from group successfully'
        );
      } catch (error: any) {
        console.error('Remove group member error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group or user not found', 404, 'NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to remove member from group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 30, windowMs: 60000 },
    }
  );

  return handler(request);
}