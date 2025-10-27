import { type NextRequest, NextResponse } from "next/server"

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies or headers
    const authToken = request.cookies.get("auth_token")?.value || 
                     request.headers.get("authorization")?.replace("Bearer ", "")

    if (!authToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }

    // Call the actual backend API to get user profile
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Backend API error:', response.status, response.statusText)
        return NextResponse.json({ 
          success: false, 
          error: `Backend API error: ${response.statusText}` 
        }, { status: response.status })
      }

      const backendResult = await response.json()
      
      if (!backendResult.success) {
        console.error('Backend returned error:', backendResult.error)
        return NextResponse.json({ 
          success: false, 
          error: backendResult.error || 'Failed to get profile from backend' 
        }, { status: 400 })
      }

      // Return the backend response data
      return NextResponse.json({
        success: true,
        data: backendResult.data
      })

    } catch (fetchError) {
      console.error('Failed to call backend API:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to connect to backend API' 
      }, { status: 503 })
    }

  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to get profile" 
    }, { status: 500 })
  }
}