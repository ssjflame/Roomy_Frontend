import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/bills - Get user bills
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
        const status = searchParams.get('status');
        const groupId = searchParams.get('groupId');

        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        if (status) queryParams.append('status', status);
        if (groupId) queryParams.append('groupId', groupId);

        const queryString = queryParams.toString();
        const endpoint = `/bills${queryString ? `?${queryString}` : ''}`;

        const bills = await proxyToBackend(endpoint, {
          method: 'GET',
        }, token);

        return createSuccessResponse(bills);
      } catch (error: any) {
        console.error('Get bills error:', error);
        return createErrorResponse('Failed to fetch bills', 500, 'FETCH_BILLS_ERROR');
      }
    }
  );

  return handler(request);
}

// POST /api/bills - Create bill
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const body = await request.json();
        const { groupId, title, totalAmount, payeeAddress } = body;

        // Validate required fields
        if (!groupId || !title || !totalAmount || !payeeAddress) {
          return createErrorResponse('Missing required fields: groupId, title, totalAmount, payeeAddress', 400, 'VALIDATION_ERROR');
        }

        const bill = await proxyToBackend('/bills', {
          method: 'POST',
          body: JSON.stringify(body),
        }, token);

        return createSuccessResponse(bill, 201, 'Bill created successfully');
      } catch (error: any) {
        console.error('Create bill error:', error);
        if (error.status === 400) {
          return createErrorResponse(error.message || 'Invalid bill data', 400, 'VALIDATION_ERROR');
        }
        if (error.status === 403) {
          return createErrorResponse('Insufficient permissions to create bill', 403, 'PERMISSION_DENIED');
        }
        return createErrorResponse('Failed to create bill', 500, 'CREATE_BILL_ERROR');
      }
    }
  );

  return handler(request);
}