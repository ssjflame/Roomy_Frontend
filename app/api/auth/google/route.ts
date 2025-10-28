import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse } from '@/lib/middleware';
import { NextResponse } from 'next/server';

// GET /api/auth/google - Google OAuth login
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        // Redirect to backend Google OAuth endpoint
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const googleAuthUrl = `${backendUrl}/api/auth/google`;
        
        return NextResponse.redirect(googleAuthUrl);
      } catch (error: any) {
        console.error('Google OAuth error:', error);
        return createErrorResponse('Google OAuth initialization failed', 500, 'OAUTH_ERROR');
      }
    }
  );

  return handler(request);
}