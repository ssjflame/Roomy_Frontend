import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Types for API responses
export interface APIError {
  success: false;
  error: string;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface APISuccess<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export type APIResponse<T> = APISuccess<T> | APIError;

// Authentication utilities
export function getAuthToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie as fallback
  const cookieToken = request.cookies.get('auth-token')?.value;
  return cookieToken || null;
}

export function createErrorResponse(
  error: string,
  status: number = 400,
  code?: string,
  errors?: Record<string, string[]>
): NextResponse {
  const response: APIError = {
    success: false,
    error,
    code,
    errors,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse {
  const response: APISuccess<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(response, { status });
}

// Backend proxy utility
export async function proxyToBackend<T>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string
): Promise<T> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  console.log('🌐 ProxyToBackend - Making request to:', fullUrl);
  console.log('🔑 ProxyToBackend - Auth token:', authToken ? 'Present' : 'Missing');
  console.log('⚙️ ProxyToBackend - Options:', options);
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    });

    console.log('📡 ProxyToBackend - Response status:', response.status);
    console.log('📡 ProxyToBackend - Response ok:', response.ok);

    const data = await response.json();
    console.log('📦 ProxyToBackend - Response data:', data);
    
    if (!response.ok) {
      console.error('❌ ProxyToBackend - Response not ok:', data);
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error('❌ ProxyToBackend - Error details:', {
      message: error.message,
      code: error.code,
      cause: error.cause,
      stack: error.stack
    });
    
    // Check for specific network errors
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 ProxyToBackend - Connection refused - backend not running on', API_BASE_URL);
    } else if (error.code === 'ENOTFOUND') {
      console.error('🚫 ProxyToBackend - Host not found:', API_BASE_URL);
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('🚫 ProxyToBackend - Network error - cannot reach backend');
    }
    
    throw error;
  }
}

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Validate token with backend
    const user = await proxyToBackend('/auth/me', {
      method: 'GET',
    }, token);

    return await handler(request, user);
  } catch (error) {
    console.error('Authentication error:', error);
    return createErrorResponse('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}

// Validation middleware
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return await handler(request, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
        return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', errors);
      }
      console.error('Validation error:', error);
      return createErrorResponse('Invalid request data', 400, 'INVALID_DATA');
    }
  };
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      const ip = (request as any).ip || request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.resetTime < windowStart) {
          rateLimitMap.delete(key);
        }
      }

      const current = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
      
      if (current.count >= maxRequests && current.resetTime > now) {
        return createErrorResponse(
          'Too many requests',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      if (current.resetTime <= now) {
        current.count = 1;
        current.resetTime = now + windowMs;
      } else {
        current.count++;
      }

      rateLimitMap.set(ip, current);
      return await handler(request);
    };
  };
}

// CORS middleware
export function withCORS(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(request);
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  };
}

// Combined middleware helper
export function createAPIHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimit?: { maxRequests: number; windowMs: number };
    validation?: z.ZodSchema<any>;
  } = {}
) {
  let wrappedHandler = handler;

  // Apply CORS
  wrappedHandler = withCORS(wrappedHandler);

  // Apply rate limiting
  if (options.rateLimit) {
    wrappedHandler = withRateLimit(
      options.rateLimit.maxRequests,
      options.rateLimit.windowMs
    )(wrappedHandler);
  }

  // Apply validation
  if (options.validation) {
    wrappedHandler = withValidation(options.validation, wrappedHandler);
  }

  // Apply authentication
  if (options.requireAuth) {
    const authHandler = wrappedHandler;
    wrappedHandler = (request: NextRequest) => 
      withAuth(request, (req, user) => authHandler(req, user));
  }

  return wrappedHandler;
}