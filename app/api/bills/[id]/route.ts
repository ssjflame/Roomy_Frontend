import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/bills/[id] - Get bill by ID
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
          return createErrorResponse('Invalid bill ID format', 400, 'INVALID_ID');
        }

        const bill = await proxyToBackend(`/bills/${id}`, {
          method: 'GET',
        }, token);

        return createSuccessResponse(bill, 200, 'Bill retrieved successfully');
      } catch (error: any) {
        console.error('Get bill by ID error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Bill not found', 404, 'BILL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied', 403, 'ACCESS_DENIED');
        }
        
        return createErrorResponse('Failed to retrieve bill', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// PUT /api/bills/[id] - Update bill
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
          return createErrorResponse('Invalid bill ID format', 400, 'INVALID_ID');
        }

        const updatedBill = await proxyToBackend(`/bills/${id}`, {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(updatedBill, 200, 'Bill updated successfully');
      } catch (error: any) {
        console.error('Update bill error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Bill not found', 404, 'BILL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Bill cannot be updated in current status', 409, 'INVALID_STATUS');
        }
        
        return createErrorResponse('Failed to update bill', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateBill,
      rateLimit: { maxRequests: 50, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/bills/[id] - Delete bill
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
          return createErrorResponse('Invalid bill ID format', 400, 'INVALID_ID');
        }

        await proxyToBackend(`/bills/${id}`, {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Bill deleted successfully' }, 
          200, 
          'Bill deleted successfully'
        );
      } catch (error: any) {
        console.error('Delete bill error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Bill not found', 404, 'BILL_NOT_FOUND');
        }
        if (error.message.includes('403')) {
          return createErrorResponse('Access denied - insufficient permissions', 403, 'ACCESS_DENIED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Bill cannot be deleted in current status', 409, 'INVALID_STATUS');
        }
        
        return createErrorResponse('Failed to delete bill', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}