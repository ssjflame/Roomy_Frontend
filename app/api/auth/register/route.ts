import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const body = await request.json();
        
        // Validate required fields
        const { email, username, password, firstName, lastName } = body;
        if (!email || !username || !password) {
          return createErrorResponse('Missing required fields: email, username, password', 400, 'VALIDATION_ERROR');
        }

        // Proxy to backend
        const result = await proxyToBackend('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        return createSuccessResponse(result, 201);
      } catch (error: any) {
        console.error('Register error:', error);
        if (error.message?.includes('User already exists')) {
          return createErrorResponse('User already exists', 409, 'USER_EXISTS');
        }
        return createErrorResponse('Registration failed', 500, 'REGISTRATION_ERROR');
      }
    },
    {
      rateLimit: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute
    }
  );

  return handler(request);
}