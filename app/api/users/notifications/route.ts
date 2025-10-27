import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/users/notifications - Get user notifications
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const isRead = searchParams.get('isRead');

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(isRead && { isRead }),
        });

        const notifications = await proxyToBackend(`/users/notifications?${queryParams}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(notifications, 200, 'Notifications retrieved successfully');
      } catch (error: any) {
        console.error('Get notifications error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        
        return createErrorResponse('Failed to retrieve notifications', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// POST /api/users/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const notification = await proxyToBackend('/users/notifications', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(notification, 201, 'Notification created successfully');
      } catch (error: any) {
        console.error('Create notification error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to create notification', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.CreateNotification,
      rateLimit: { maxRequests: 10, windowMs: 60000 },
    }
  );

  return handler(request);
}