import { NextRequest } from 'next/server';
import { createAPIHandler, proxyToBackend, getAuthToken, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { ValidationSchemas } from '@/lib/validation';

// GET /api/users/profile - Get user profile
export async function GET(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const userProfile = await proxyToBackend('/users/profile', {
          method: 'GET',
        }, token);

        return createSuccessResponse(userProfile, 200, 'User profile retrieved successfully');
      } catch (error: any) {
        console.error('Get user profile error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('User profile not found', 404, 'USER_NOT_FOUND');
        }
        
        return createErrorResponse('Failed to retrieve user profile', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 100, windowMs: 60000 },
    }
  );

  return handler(request);
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest, validatedData: any) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        const updatedProfile = await proxyToBackend('/users/profile', {
          method: 'PUT',
          body: JSON.stringify(validatedData),
        }, token);

        return createSuccessResponse(updatedProfile, 200, 'User profile updated successfully');
      } catch (error: any) {
        console.error('Update user profile error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('User profile not found', 404, 'USER_NOT_FOUND');
        }
        if (error.message.includes('409')) {
          return createErrorResponse('Username or email already exists', 409, 'CONFLICT');
        }
        
        return createErrorResponse('Failed to update user profile', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      validation: ValidationSchemas.UpdateUserProfile,
      rateLimit: { maxRequests: 20, windowMs: 60000 },
    }
  );

  return handler(request);
}

// DELETE /api/users/profile - Delete user account
export async function DELETE(request: NextRequest) {
  const handler = createAPIHandler(
    async (request: NextRequest) => {
      try {
        const token = getAuthToken(request);
        if (!token) {
          return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
        }

        await proxyToBackend('/users/profile', {
          method: 'DELETE',
        }, token);

        return createSuccessResponse(
          { message: 'Account deleted successfully' }, 
          200, 
          'User account deleted successfully'
        );
      } catch (error: any) {
        console.error('Delete user account error:', error);
        
        if (error.message.includes('401')) {
          return createErrorResponse('Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (error.message.includes('404')) {
          return createErrorResponse('User account not found', 404, 'USER_NOT_FOUND');
        }
        
        return createErrorResponse('Failed to delete user account', 500, 'INTERNAL_ERROR');
      }
    },
    {
      requireAuth: true,
      rateLimit: { maxRequests: 5, windowMs: 60000 },
    }
  );

  return handler(request);
}