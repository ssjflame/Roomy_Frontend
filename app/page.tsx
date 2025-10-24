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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-balance">Roomy</h1>

        <p className="text-xl text-muted-foreground text-balance">
          Create an account to spend smarter, together. Manage shared expenses with your roommates using smart wallets
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
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2 text-card-foreground">Smart Wallets</h3>
            <p className="text-sm text-muted-foreground">
              Create group wallets with smart technology to manage shared expenses effortlessly
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2 text-card-foreground">Fair Decisions</h3>
            <p className="text-sm text-muted-foreground">
              Vote on expenses and bills together with transparent, democratic decision-making
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2 text-card-foreground">Easy Management</h3>
            <p className="text-sm text-muted-foreground">
              Track bills, proposals, and payments all in one beautiful, homey dashboard
            </p>
          </div>
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  )
}
