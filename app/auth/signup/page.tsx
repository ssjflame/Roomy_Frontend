"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/api"
import { useStore } from "@/lib/store"
import { toast } from "sonner"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser, setWallet } = useStore()

  const handleGoogle = () => {
    // TODO: integrate real Google OAuth
    console.log("Continue with Google clicked")
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      const payload = {
        email,
        username,
        password,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
      }

      const response = await authApi.register(payload)

      // Store tokens
      localStorage.setItem("auth_token", response.accessToken)
      localStorage.setItem("refresh_token", response.refreshToken)

      // Update store with user data
      setUser({
        ...response.user,
        isEmailVerified: response.user.isEmailVerified ?? true,
        avatarUrl: response.user.avatarUrl ?? undefined,
        lastLoginAt: response.user.lastLoginAt ?? new Date().toISOString(),
      })

      // Provision wallet via session if missing
      if (response.wallet) {
        setWallet(response.wallet)
      } else {
        try {
          const { wallet } = await authApi.session()
          if (wallet) setWallet(wallet)
        } catch (e) {
          console.warn("Wallet session provisioning failed:", e)
        }
      }

      toast.success("Registration successful!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration error:", error)
      const message = error?.errors?.message?.[0] || error?.message || "Registration failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen grid md:grid-cols-2 bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="absolute top-4 left-4"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Left - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold mb-2">Welcome to Roomy</h1>
          <p className="text-sm text-muted-foreground mb-6">Get started – it’s free. No credit card needed.</p>

          <Button variant="outline" className="w-full mb-3 flex items-center justify-center gap-2" onClick={handleGoogle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.158 7.936 3.048l5.657-5.657C35.159 7.119 29.842 5 24 5 12.955 5 4 13.955 4 25s8.955 20 20 20c10.683 0 19.52-8.308 19.82-18.82 0 0-.209-5.895-.209-5.895z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.564 4.81C14.206 16.287 18.74 13.5 24 13.5c3.059 0 5.842 1.158 7.936 3.048l5.657-5.657C35.159 7.119 29.842 5 24 5 16.473 5 9.925 8.797 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 45c5.149 0 9.841-1.953 13.391-5.145l-6.164-5.059C29.838 36.421 27.035 37.5 24 37.5c-5.205 0-9.631-3.312-11.253-7.877l-6.497 5.02C9.889 41.036 16.44 45 24 45z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.136 3.206-3.719 5.696-6.622 7.016l6.164 5.059C39.966 36.664 44 31.431 44 24c0-1.305-.16-2.627-.389-3.917z" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-border" />
            <span className="mx-3 text-xs text-muted-foreground">Or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2 mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleContinue} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Continue"}
          </Button>

          <p className="text-xs text-muted-foreground mt-3">
            Already have an account? {" "}
            <Link href="/auth/login" className="underline">Log in</Link>
          </p>
        </div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden md:block relative">
        <Image
          src="/images/Team work-rafiki.png"
          alt="Team working illustration"
          fill
          priority
          className="object-cover"
        />
      </div>
    </div>
  )
}