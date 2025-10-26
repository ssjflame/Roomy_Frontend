"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { proposalsApi } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, CheckCircle2 } from "lucide-react"

interface CreateProposalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Preselect a bill when opening from bills page
  initialBillId?: string
}

export function CreateProposalDialog({ open, onOpenChange, initialBillId }: CreateProposalDialogProps) {
  const { user, bills, currentGroup, addProposal } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [billId, setBillId] = useState<string>("")
  const [votingDeadline, setVotingDeadline] = useState("")

  // Filter bills for current group that are in DRAFT status (can be proposed)
  const availableBills = Array.isArray(bills) 
    ? bills.filter(bill => 
        bill.groupId === currentGroup?.id && 
        (bill.status === "DRAFT" || bill.status === "PROPOSED")
      )
    : []

  // Set default voting deadline to 7 days from now
  useEffect(() => {
    if (open && !votingDeadline) {
      const defaultDeadline = new Date()
      defaultDeadline.setDate(defaultDeadline.getDate() + 7)
      setVotingDeadline(defaultDeadline.toISOString().split('T')[0])
    }
  }, [open, votingDeadline])

  // Preselect bill on open when provided
  useEffect(() => {
    if (open && initialBillId) {
      setBillId(initialBillId)
    }
  }, [open, initialBillId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      // Validate inputs
      if (!title || !billId || !votingDeadline) {
        throw new Error("Title, bill selection, and voting deadline are required")
      }

      // Convert voting deadline to ISO string
      const deadlineDate = new Date(votingDeadline)
      if (deadlineDate <= new Date()) {
        throw new Error("Voting deadline must be in the future")
      }

      // Create proposal via API
      const proposalData = {
        billId,
        title,
        description: description || undefined,
        votingDeadline: deadlineDate.toISOString(),
        groupId: currentGroup?.id || "",
      }

      const createdProposal = await proposalsApi.create(proposalData)
      
      // Add to local store
      addProposal(createdProposal)

      // Show success message
      setSuccess(`Proposal "${title}" created successfully!`)
      
      // Reset form after a short delay
      setTimeout(() => {
        setTitle("")
        setDescription("")
        setBillId("")
        setVotingDeadline("")
        setSuccess(null)
        onOpenChange(false)
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>Submit a bill for group voting and approval</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Approve December Internet Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billId">Select Bill</Label>
            <select
              id="billId"
              value={billId}
              onChange={(e) => setBillId(e.target.value)}
              required
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Choose a bill to propose...</option>
              {availableBills.map((bill) => (
                <option key={bill.id} value={bill.id}>
                  {bill.title} - ${Number(bill.totalAmount).toFixed(2)} ({bill.currency})
                </option>
              ))}
            </select>
            {availableBills.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No bills available for proposal. Create a bill first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add context or details about this proposal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="votingDeadline">Voting Deadline</Label>
            <Input
              id="votingDeadline"
              type="date"
              value={votingDeadline}
              onChange={(e) => setVotingDeadline(e.target.value)}
              required
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || availableBills.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Proposal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
