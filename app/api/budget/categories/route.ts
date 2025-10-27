import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/budget/categories - Get budget categories
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
        const groupId = searchParams.get('groupId');
        const type = searchParams.get('type');

        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (groupId) queryParams.append('groupId', groupId);
        if (type) queryParams.append('type', type);

        const queryString = queryParams.toString();
        const endpoint = `/budget/categories${queryString ? `?${queryString}` : ''}`;

        const categories = await proxyToBackend(endpoint, {
          method: 'GET',
        }, token);

        return createSuccessResponse(categories, 200, 'Budget categories retrieved successfully');
      } catch (error: any) {
        console.error('Get budget categories error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve budget categories', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// POST /api/budget/categories - Create budget category
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const newCategory = await proxyToBackend('/budget/categories', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(newCategory, 201, 'Budget category created successfully');
      } catch (error: any) {
        console.error('Create budget category error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Budget category name already exists', 409, 'CATEGORY_NAME_EXISTS');
        }
        
        return createErrorResponse('Failed to create budget category', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.CreateBudgetCategory,
      rateLimit: { maxRequests: 30, windowMs: 60000 },
    }
  );

  return handler(request);
}