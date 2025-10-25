"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleGoogle = () => {
    // TODO: integrate real Google OAuth
    console.log("Continue with Google clicked")
  }

  const handleContinue = () => {
    // TODO: submit email to backend/signup flow
    console.log("Continue with email:", email)
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

          <Button className="w-full" onClick={handleContinue}>Continue</Button>

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