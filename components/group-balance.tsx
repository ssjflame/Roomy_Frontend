"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpRight, ArrowDownRight, Copy, Check, RefreshCw } from "lucide-react"
import { useState } from "react"
import AddFundsDialog from "./add-funds-dialog"
import SendFundsDialog from "./send-funds-dialog"

export function GroupBalance() {
  const { currentGroup, wallet } = useStore()
  const [copied, setCopied] = useState(false)
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const [sendFundsOpen, setSendFundsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!currentGroup) return null

  // Use smart account address from group
  const walletAddress = currentGroup.smartAccountAddress || "No address"
  
  // Use new balance format if available, fallback to legacy
  const ethBalance = currentGroup.balances?.eth ?? currentGroup.balance ?? 0
  const usdcBalance = currentGroup.balances?.usdc ?? 0

  const handleCopyAddress = async () => {
    if (currentGroup.smartAccountAddress) {
      await navigator.clipboard.writeText(currentGroup.smartAccountAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    if (address === "No address") return address
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const handleRefreshBalance = async () => {
    if (!currentGroup?.id) return
    
    setIsRefreshing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/groups/${currentGroup.id}/refresh-balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        console.error('Failed to refresh balance:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Group Wallet
        </CardTitle>
        <CardDescription>Shared balance and smart account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Group Balances</p>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ETH</p>
              <p className="text-2xl font-bold">{ethBalance.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">USDC</p>
              <p className="text-2xl font-bold">{usdcBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Smart Account Address</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
              {formatAddress(walletAddress)}
            </code>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={handleCopyAddress}
              disabled={!currentGroup.smartAccountAddress}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1" variant="default">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
          <Button className="flex-1 bg-transparent" variant="outline">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setAddFundsOpen(true)}>
          Add Funds
        </Button>
        <Button onClick={() => setSendFundsOpen(true)}>Send</Button>
      </CardFooter>
      <AddFundsDialog open={addFundsOpen} onOpenChange={setAddFundsOpen} />
      <SendFundsDialog open={sendFundsOpen} onOpenChange={setSendFundsOpen} />
    </Card>
  )
}
