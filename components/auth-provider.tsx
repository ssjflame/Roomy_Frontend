"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { authApi } from "@/lib/api"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setWallet } = useStore()
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      
      if (!authToken) {
        console.log("AuthProvider: No auth token found")
        return
      }

      if (!user) {
        console.log("AuthProvider: Auth token exists but no user in store, fetching profile")
        try {
          const profile = await authApi.getProfile()
          console.log("AuthProvider: Profile retrieved", profile)
          
          if (profile.user) {
            setUser({
              ...profile.user,
              isEmailVerified: profile.user.isEmailVerified ?? true,
              avatarUrl: profile.user.avatarUrl ?? undefined,
              lastLoginAt: profile.user.lastLoginAt ?? new Date().toISOString()
            })
          }
          
          if (profile.wallet) {
            console.log("AuthProvider: Setting wallet", profile.wallet)
            setWallet(profile.wallet)
          }
        } catch (error) {
          console.error("AuthProvider: Failed to fetch profile", error)
          // Clear invalid tokens
          localStorage.removeItem("auth_token")
          localStorage.removeItem("refresh_token")
        }
      }
    }

    initializeAuth()
  }, [user, setUser, setWallet])

  return <>{children}</>
}