import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/auth/refresh - Refresh authentication token
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const body = await request.json();
        
        // Validate refresh token
        if (!body.refreshToken || typeof body.refreshToken !== 'string') {
          return createErrorResponse('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
        }

        const authResponse = await proxyToBackend('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        return createSuccessResponse(authResponse, 200, 'Token refreshed successfully');
      } catch (error: any) {
        console.error('Refresh token error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Refresh token has been revoked', 403, 'TOKEN_REVOKED');
        }
        
        return createErrorResponse('Failed to refresh token', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: false,
      rateLimit: { maxRequests: 10, windowMs: 60000 },
    }
  );

  return handler(request);
}