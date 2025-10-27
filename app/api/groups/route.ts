import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/groups - Get user's groups
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');

        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);

        const queryString = queryParams.toString();
        const endpoint = `/groups${queryString ? `?${queryString}` : ''}`;

        const groups = await proxyToBackend(endpoint, {
          method: 'GET',
        }, token);

        return createSuccessResponse(groups, 200, 'Groups retrieved successfully');
      } catch (error: any) {
        console.error('Get groups error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        
        return createErrorResponse('Failed to retrieve groups', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// POST /api/groups - Create group
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const group = await proxyToBackend('/groups', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(group, 201, 'Group created successfully');
      } catch (error: any) {
        console.error('Create group error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Group name already exists', 409, 'GROUP_NAME_EXISTS');
        }
        if (error.message.includes('400')) {
          return createErrorResponse('Invalid group data', 400, 'INVALID_DATA');
        }
        
        return createErrorResponse('Failed to create group', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.CreateGroup,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}