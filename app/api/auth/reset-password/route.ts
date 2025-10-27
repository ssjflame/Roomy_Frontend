import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const response = await proxyToBackend('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        });

        return createSuccessResponse(response, 200, 'Password reset successfully');
      } catch (error: any) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('400')) {
          return createErrorResponse('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Reset token not found', 404, 'TOKEN_NOT_FOUND');
        }
        
        return createErrorResponse('Failed to reset password', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: false,
      validation: ValidationSchemas.ResetPassword,
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    }
  );

  return handler(request);
}