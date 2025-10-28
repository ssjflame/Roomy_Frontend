import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// GET /api/recurring - Get user recurring bills
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
        const isActive = searchParams.get('isActive');

        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (groupId) queryParams.append('groupId', groupId);
        if (isActive) queryParams.append('isActive', isActive);

        const queryString = queryParams.toString();
        const endpoint = `/recurring${queryString ? `?${queryString}` : ''}`;

        const recurringBills = await proxyToBackend(endpoint, {
          method: 'GET',
        }, token);

        return createSuccessResponse(recurringBills);
      } catch (error: any) {
        console.error('Get recurring bills error:', error);
        return createErrorResponse('Failed to fetch recurring bills', 500, 'FETCH_RECURRING_ERROR');
      }
    }
  );

  return handler(request);
}

// POST /api/recurring - Create recurring bill
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const body = await request.json();
        const { groupId, title, amount, payeeAddress, frequency, startDate } = body;

        // Validate required fields
        if (!groupId || !title || !amount || !payeeAddress || !frequency || !startDate) {
          return createErrorResponse('Missing required fields: groupId, title, amount, payeeAddress, frequency, startDate', 400, 'VALIDATION_ERROR');
        }

        const recurringBill = await proxyToBackend('/recurring', {
          method: 'POST',
          body: JSON.stringify(body),
        }, token);

        return createSuccessResponse(recurringBill, 201, 'Recurring bill created successfully');
      } catch (error: any) {
        console.error('Create recurring bill error:', error);
        if (error.status === 400) {
          return createErrorResponse(error.message || 'Invalid recurring bill data', 400, 'VALIDATION_ERROR');
        }
        if (error.status === 403) {
          return createErrorResponse('Insufficient permissions to create recurring bill', 403, 'PERMISSION_DENIED');
        }
        return createErrorResponse('Failed to create recurring bill', 500, 'CREATE_RECURRING_ERROR');
      }
    }
  );

  return handler(request);
}