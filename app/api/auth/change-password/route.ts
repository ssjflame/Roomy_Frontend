import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// POST /api/auth/change-password - Change user password
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const response = await proxyToBackend('/auth/change-password', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(response, 200, 'Password changed successfully');
      } catch (error: any) {
        console.error('Change password error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Invalid current password', 401, 'INVALID_CURRENT_PASSWORD');
        }
        if (error.message.includes('400')) {
          return createErrorResponse('Invalid password format', 400, 'INVALID_PASSWORD_FORMAT');
        }
        
        return createErrorResponse('Failed to change password', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.ChangePassword,
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    }
  );

  return handler(request);
}