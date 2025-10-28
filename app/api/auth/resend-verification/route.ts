import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/auth/resend-verification - Resend email verification
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        // Proxy to backend
        const result = await proxyToBackend('/auth/resend-verification', {
          method: 'POST',
        }, token);

        return createSuccessResponse(result);
      } catch (error: any) {
        console.error('Resend verification error:', error);
        return createErrorResponse('Failed to resend verification email', 500, 'RESEND_VERIFICATION_ERROR');
      }
    },
    {
      rateLimit: { maxRequests: 3, windowMs: 300000 }, // 3 requests per 5 minutes
    }
  );

  return handler(request);
}