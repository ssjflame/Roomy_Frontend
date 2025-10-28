import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

// POST /api/users/wallet/provision - Provision user wallet
export async function POST(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        // Proxy to backend
        const result = await proxyToBackend('/users/wallet/provision', {
          method: 'POST',
        }, token);

        return createSuccessResponse(result, 201);
      } catch (error: any) {
        console.error('Wallet provision error:', error);
        if (error.message?.includes('Wallet already provisioned')) {
          return createErrorResponse('Wallet already provisioned', 409, 'WALLET_EXISTS');
        }
        return createErrorResponse('Failed to provision wallet', 500, 'WALLET_PROVISION_ERROR');
      }
    }
  );

  return handler(request);
}