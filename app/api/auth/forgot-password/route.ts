import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const response = await proxyToBackend('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        });

        return createSuccessResponse(response, 200, 'Password reset email sent successfully');
      } catch (error: any) {
        console.error('Forgot password error:', error);
        
        if (error.message.includes('404')) {
          return createErrorResponse('Email address not found', 404, 'EMAIL_NOT_FOUND');
        }
        if (error.message.includes('429')) {
          return createErrorResponse('Too many password reset requests. Please try again later.', 429, 'TOO_MANY_REQUESTS');
        }
        
        return createErrorResponse('Failed to send password reset email', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: false,
      validation: ValidationSchemas.ForgotPassword,
      rateLimit: { maxRequests: 3, windowMs: 300000 }, // 3 requests per 5 minutes
    }
  );

  return handler(request);
}