import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// PUT /api/users/notifications/[id] - Mark notification as read
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
          return createErrorResponse('Invalid notification ID format', 400, 'INVALID_ID');
        }

        const notification = await proxyToBackend(`/users/notifications/${id}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(notification, 200, 'Notification updated successfully');
      } catch (error: any) {
        console.error('Update notification error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to update notification', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateNotification,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/users/notifications/[id] - Delete notification
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
          return createErrorResponse('Invalid notification ID format', 400, 'INVALID_ID');
        }

        await proxyToBackend(`/users/notifications/${id}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Notification deleted successfully' }, 
          200, 
          'Notification deleted successfully'
        );
      } catch (error: any) {
        console.error('Delete notification error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to delete notification', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }
  );

  return handler(request);
}