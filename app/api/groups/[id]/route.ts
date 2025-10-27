import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/groups/[id] - Get group by ID
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

        const group = await proxyToBackend(`/groups/${id}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(group, 200, 'Group retrieved successfully');
      } catch (error: any) {
        console.error('Get group by ID error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found', 404, 'GROUP_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - not a group member', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// PUT /api/groups/[id] - Update group
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
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_ID');
        }

        const updatedGroup = await proxyToBackend(`/groups/${id}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(updatedGroup, 200, 'Group updated successfully');
      } catch (error: any) {
        console.error('Update group error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found', 404, 'GROUP_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Group name already exists', 409, 'GROUP_NAME_EXISTS');
        }
        
        return createErrorResponse('Failed to update group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateGroup,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/groups/[id] - Delete group
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
          return createErrorResponse('Invalid group ID format', 400, 'INVALID_ID');
        }

        await proxyToBackend(`/groups/${id}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Group deleted successfully' }, 
          200, 
          'Group deleted successfully'
        );
      } catch (error: any) {
        console.error('Delete group error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Group not found', 404, 'GROUP_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - only group owner can delete', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Cannot delete group with active bills or members', 409, 'GROUP_HAS_DEPENDENCIES');
        }
        
        return createErrorResponse('Failed to delete group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}