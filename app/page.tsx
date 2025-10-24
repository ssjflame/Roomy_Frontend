"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth-dialog"

export default function HomePage() {
  const router = useRouter()
  const { user } = useStore()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      setShowAuthDialog(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-balance">RoomDAO</h1>

        <p className="text-xl text-muted-foreground text-balance">
          Manage shared expenses with your roommates using DAO-style governance and embedded wallets
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
            Learn More
          </Button>
        </div>

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2 text-card-foreground">Shared Wallets</h3>
            <p className="text-sm text-muted-foreground">
              Create group wallets with embedded Web3 technology powered by Openfort
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2 text-card-foreground">Democratic Voting</h3>
            <p className="text-sm text-muted-foreground">
              Vote on expenses and bills with transparent DAO-style governance
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2 text-card-foreground">Easy Management</h3>
            <p className="text-sm text-muted-foreground">
              Track bills, proposals, and payments all in one beautiful dashboard
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  )
}
