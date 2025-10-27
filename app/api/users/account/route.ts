import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// DELETE /api/users/account - Delete user account
export async function DELETE(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const body = await request.json().catch(() => ({}));
        const { password } = body;

        // Validate required fields
        if (!password) {
          return createErrorResponse('Password is required for account deletion', 400, 'MISSING_PASSWORD');
        }

        const result = await proxyToBackend('/users/account', {
          method: 'DELETE',
          body: JSON.stringify({ password }),
        }, token);

        return createSuccessResponse(result, 200, 'Account deleted successfully');
      } catch (error: any) {
        console.error('Delete account error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('400')) {
          return createErrorResponse('Invalid password', 400, 'INVALID_PASSWORD');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Account deletion not allowed', 403, 'DELETION_NOT_ALLOWED');
        }
        
        return createErrorResponse('Failed to delete account', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 5, windowMs: 300000 }, // 5 requests per 5 minutes for security
    }
  );

  return handler(request);
}