import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/users/wallet - Get user wallet information
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const wallet = await proxyToBackend('/users/wallet', {
          method: 'GET',
        }, token);

        return createSuccessResponse(wallet, 200, 'Wallet information retrieved successfully');
      } catch (error: any) {
        console.error('Get wallet error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('Wallet not found', 404, 'WALLET_NOT_FOUND');
        }
        
        return createErrorResponse('Failed to retrieve wallet information', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// POST /api/users/wallet - Provision user wallet
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const wallet = await proxyToBackend('/users/wallet', {
          method: 'POST',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(wallet, 201, 'Wallet provisioned successfully');
      } catch (error: any) {
        console.error('Provision wallet error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Wallet already exists', 409, 'WALLET_EXISTS');
        }
        
        return createErrorResponse('Failed to provision wallet', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.ProvisionWallet,
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    }
  );

  return handler(request);
}