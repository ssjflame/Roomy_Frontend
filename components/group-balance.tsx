"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpRight, ArrowDownRight, Copy, Check } from "lucide-react"
import { useState } from "react"

export function GroupBalance() {
  const { currentGroup } = useStore()
  const [copied, setCopied] = useState(false)

  if (!currentGroup) return null

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(currentGroup.walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Group Wallet
        </CardTitle>
        <CardDescription>Shared balance and wallet address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="text-4xl font-bold">${currentGroup.balance.toFixed(2)}</p>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Wallet Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
              {formatAddress(currentGroup.walletAddress)}
            </code>
            <Button size="icon" variant="outline" onClick={handleCopyAddress}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" variant="default">
            <ArrowDownRight className="w-4 h-4" />
            Add Funds
          </Button>
          <Button className="flex-1 bg-transparent" variant="outline">
            <ArrowUpRight className="w-4 h-4" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
