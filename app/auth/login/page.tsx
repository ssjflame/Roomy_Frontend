"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleGoogle = () => {
    // TODO: integrate real Google OAuth
    console.log("Login with Google clicked")
  }

  const handleLogin = () => {
    // TODO: submit credentials to backend/login flow
    console.log("Login with:", { email, password })
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
          <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Log in to continue managing shared expenses.</p>

          <Button variant="outline" className="w-full mb-3 flex items-center justify-center gap-2" onClick={handleGoogle}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#4285F4" />
              <path d="M12 6c2.76 0 5 2.24 5 5h-5v2h7c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" fill="#fff" />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-border" />
            <span className="mx-3 text-xs text-muted-foreground">Or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2 mt-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button className="w-full mt-4" onClick={handleLogin}>Log in</Button>

          <p className="text-xs text-muted-foreground mt-3">
            New to Roomy? {" "}
            <Link href="/auth/signup" className="underline">Sign up</Link>
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