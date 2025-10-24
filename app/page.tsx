"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Home, Wallet, Vote, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth-dialog"

export default function HomePage() {
  const router = useRouter()
  const { user } = useStore()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    console.log("[v0] HomePage mounted")
    console.log("[v0] User state:", user)
  }, [user])

  const handleGetStarted = () => {
    console.log("[v0] Get Started clicked, user:", user)
    if (user) {
      router.push("/dashboard")
    } else {
      setShowAuthDialog(true)
    }
  }

  console.log("[v0] HomePage rendering")

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 opacity-40">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="0"
            cy="0"
            r="100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/30"
          />
          <circle
            cx="0"
            cy="0"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/20"
          />
          <circle
            cx="0"
            cy="0"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/15"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-40">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/30"
          />
          <circle
            cx="200"
            cy="200"
            r="70"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/20"
          />
          <circle
            cx="200"
            cy="200"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-primary/15"
          />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 py-16">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Home className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold tracking-tight text-balance text-foreground">Roomy</h1>

          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Create your account to make shared living simple and fair
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 bg-transparent hover:bg-primary/5 shadow-sm hover:shadow-md transition-all"
            >
              Learn More
            </Button>
          </div>

          <div className="pt-16">
            <h2 className="text-3xl font-semibold mb-3 text-foreground">Why roommates love Roomy</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-12 rounded-full shadow-sm shadow-primary/30" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-8 rounded-2xl bg-card border border-border shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shadow-sm shadow-primary/10">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-card-foreground">Shared Wallets</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create group wallets with embedded Web3 technology powered by Openfort
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-card border border-border shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shadow-sm shadow-primary/10">
                  <Vote className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-card-foreground">Democratic Voting</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vote on expenses and bills with transparent DAO-style governance
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-card border border-border shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shadow-sm shadow-primary/10">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-card-foreground">Easy Management</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Track bills, proposals, and payments all in one beautiful dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  )
}
