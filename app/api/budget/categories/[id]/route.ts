import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/budget/categories/[id] - Get budget category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid category ID format', 400, 'INVALID_ID');
        }

        const category = await proxyToBackend(`/budget/categories/${id}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(category, 200, 'Budget category retrieved successfully');
      } catch (error: any) {
        console.error('Get budget category by ID error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Budget category not found', 404, 'CATEGORY_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve budget category', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// PUT /api/budget/categories/[id] - Update budget category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid category ID format', 400, 'INVALID_ID');
        }

        const updatedCategory = await proxyToBackend(`/budget/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(updatedCategory, 200, 'Budget category updated successfully');
      } catch (error: any) {
        console.error('Update budget category error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Budget category not found', 404, 'CATEGORY_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Budget category name already exists', 409, 'CATEGORY_NAME_EXISTS');
        }
        
        return createErrorResponse('Failed to update budget category', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateBudgetCategory,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/budget/categories/[id] - Delete budget category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          return createErrorResponse('Invalid category ID format', 400, 'INVALID_ID');
        }

        await proxyToBackend(`/budget/categories/${id}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Budget category deleted successfully' }, 
          200, 
          'Budget category deleted successfully'
        );
      } catch (error: any) {
        console.error('Delete budget category error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Budget category not found', 404, 'CATEGORY_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Cannot delete category with associated bills', 409, 'CATEGORY_HAS_BILLS');
        }
        
        return createErrorResponse('Failed to delete budget category', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}