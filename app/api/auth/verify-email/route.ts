import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/auth/verify-email - Verify email token
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
          return createErrorResponse('Verification token is required', 400, 'VALIDATION_ERROR');
        }

        // Proxy to backend
        const result = await proxyToBackend('/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        return createSuccessResponse(result);
      } catch (error: any) {
        console.error('Verify email error:', error);
        if (error.message?.includes('Invalid token') || error.message?.includes('Token expired')) {
          return createErrorResponse('Invalid or expired verification token', 400, 'INVALID_TOKEN');
        }
        return createErrorResponse('Email verification failed', 500, 'VERIFICATION_ERROR');
      }
    }
  );

  return handler(request);
}