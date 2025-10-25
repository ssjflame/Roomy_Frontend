"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { useStore } from "@/lib/store"
import { transactionsApi } from "@/lib/api"

interface SendFundsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SendFundsDialog({ open, onOpenChange }: SendFundsDialogProps) {
  const { currentGroup, wallet, addTransaction } = useStore()
  const [amount, setAmount] = useState<string>("")
  const [recipient, setRecipient] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const disabled = submitting || !currentGroup

  async function handleSubmit() {
    if (!currentGroup) return
    const numeric = Number(amount)
    if (!numeric || numeric <= 0) return

    setSubmitting(true)
    try {
      const payload = {
        groupId: currentGroup.id,
        amount: numeric,
        currency: "USDC",
        description: description || "Send funds",
        type: "TRANSFER",
        metadata: {
          source: "frontend",
          fromWallet: wallet?.address || null,
          receiverAddress: recipient || null,
        },
      }
      const result = await transactionsApi.create(payload)
      if (result?.transaction) {
        addTransaction(result.transaction)
      }
      onOpenChange(false)
      setAmount("")
      setRecipient("")
      setDescription("")
    } catch (e) {
      console.error("Send funds failed", e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient address (EVM)</Label>
            <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={disabled}>{submitting ? "Submitting..." : "Send"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}