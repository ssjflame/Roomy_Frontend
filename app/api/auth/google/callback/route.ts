import { NextRequest } from 'next/server';
import { createAPIHandler, createErrorResponse } from '@/lib/middleware';
import { NextResponse } from 'next/server';

// GET /api/auth/google/callback - Google OAuth callback
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          // Redirect to frontend with error
          const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
          return NextResponse.redirect(`${frontendUrl}/auth/login?error=oauth_error`);
        }

        if (!code) {
          return createErrorResponse('Authorization code not provided', 400, 'OAUTH_ERROR');
        }

        // Forward to backend callback
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const callbackUrl = `${backendUrl}/api/auth/google/callback?code=${code}&state=${state || ''}`;
        
        return NextResponse.redirect(callbackUrl);
      } catch (error: any) {
        console.error('Google OAuth callback error:', error);
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
        return NextResponse.redirect(`${frontendUrl}/auth/login?error=oauth_callback_error`);
      }
    }
  );

  return handler(request);
}