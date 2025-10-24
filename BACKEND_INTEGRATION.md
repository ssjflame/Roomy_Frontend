# Backend Integration Guide

This document explains how to connect the Roomy frontend to the backend API.

## Current Status

The frontend is currently using **mock data** and is ready to be connected to the backend. All API calls are centralized in `lib/api.ts` with TODO comments indicating where to uncomment the real backend calls.

## Backend Repository

Backend: https://github.com/NickFotsing/Roomy

## Environment Variables

Add the following environment variable to connect to your backend:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Development
# or
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api  # Production
\`\`\`

## API Endpoints

The frontend is prepared to connect to these backend endpoints:

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Bills
- `POST /api/bills` - Create bill
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get bill by ID
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

## Integration Steps

### 1. Set Environment Variable

Add `NEXT_PUBLIC_API_URL` to your `.env.local` file or Vercel environment variables.

### 2. Update API Service Layer

Open `lib/api.ts` and uncomment the real API calls. Each function has a TODO comment like:

\`\`\`typescript
// TODO: Uncomment when backend is ready
// return fetchWithAuth("/users/login", {
//   method: "POST",
//   body: JSON.stringify(data),
// })
\`\`\`

Simply uncomment these lines and remove the mock response below them.

### 3. Test Authentication Flow

1. Start your backend server
2. Try registering a new user
3. Try logging in
4. Check that the JWT token is stored in localStorage
5. Verify that authenticated requests include the token

### 4. Update Mock Data

Once the backend is connected, you can remove:
- `lib/mock-data.ts` (if not needed)
- Mock responses in `lib/api.ts`

### 5. Handle Errors

The API service layer includes basic error handling. You may want to add:
- Toast notifications for errors
- Retry logic for failed requests
- Better error messages

## Authentication Flow

1. User submits login/register form
2. Frontend calls `authApi.login()` or `authApi.register()`
3. Backend returns user data + JWT token
4. Frontend stores token in localStorage
5. Frontend stores user in Zustand store
6. All subsequent requests include token in Authorization header

## Type Safety

All API types are defined in `lib/types.ts` and match the backend Prisma schema. Update these types if the backend schema changes.

## Testing

Before connecting to the real backend:
1. The app works with mock data
2. All UI flows are functional
3. State management is working

After connecting to the backend:
1. Test all CRUD operations
2. Verify authentication persists on refresh
3. Test error scenarios
4. Verify wallet integration works

## Notes

- The frontend uses localStorage for token storage (consider httpOnly cookies for production)
- All API calls go through the centralized `lib/api.ts` service layer
- The Zustand store (`lib/store.ts`) manages client-side state
- Mock data is used until backend is connected
