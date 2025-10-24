"use client"

import { useStore } from "@/lib/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, DollarSign, User, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import type { Proposal, ProposalStatus } from "@/lib/store"

interface ProposalDetailDialogProps {
  proposal: Proposal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onVote?: (proposalId: string, vote: "approve" | "reject") => void
}

export function ProposalDetailDialog({ proposal, open, onOpenChange, onVote }: ProposalDetailDialogProps) {
  const { user, currentGroup, updateProposal } = useStore()

  if (!proposal) return null

  const hasVoted = proposal.votes.voters.includes(user?.id || "")
  const totalVotes = proposal.votes.approve + proposal.votes.reject
  const approvalPercentage = totalVotes > 0 ? (proposal.votes.approve / totalVotes) * 100 : 0
  const requiredVotes = currentGroup?.members.length || 4
  const votesNeeded = Math.ceil(requiredVotes / 2)

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case "pending":
        return "default"
      case "approved":
        return "secondary"
      case "rejected":
        return "destructive"
      case "paid":
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: ProposalStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const handleVote = (vote: "approve" | "reject") => {
    if (onVote && !hasVoted) {
      onVote(proposal.id, vote)
    }
  }

  const handleMarkAsPaid = async () => {
    try {
      // In production, call API to process payment
      // await fetch(`/api/proposals/${proposal.id}/pay`, { method: "POST" })

      updateProposal(proposal.id, { status: "paid" })
    } catch (error) {
      console.error("Failed to mark as paid:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{proposal.title}</DialogTitle>
              <DialogDescription>{proposal.description}</DialogDescription>
            </div>
            <Badge variant={getStatusColor(proposal.status)}>{getStatusLabel(proposal.status)}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Proposal Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">${proposal.amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Due:</span>
              <span className="font-semibold">{format(new Date(proposal.dueDate), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-semibold">{format(new Date(proposal.createdAt), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Voters:</span>
              <span className="font-semibold">
                {proposal.votes.voters.length} / {requiredVotes}
              </span>
            </div>
          </div>

          {/* Voting Section */}
          {proposal.status === "pending" && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Voting Progress</span>
                  <span className="text-muted-foreground">
                    {proposal.votes.approve} / {votesNeeded} approvals needed
                  </span>
                </div>
                <Progress value={approvalPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span>
                    <span className="font-semibold">{proposal.votes.approve}</span> Approve
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <span>
                    <span className="font-semibold">{proposal.votes.reject}</span> Reject
                  </span>
                </div>
              </div>

              {!hasVoted ? (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Cast your vote to help the group decide on this expense. {votesNeeded - proposal.votes.approve}{" "}
                      more approval{votesNeeded - proposal.votes.approve !== 1 ? "s" : ""} needed to pass.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => handleVote("approve")}>
                      <ThumbsUp className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button className="flex-1" variant="destructive" onClick={() => handleVote("reject")}>
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </>
              ) : (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>You have already voted on this proposal</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Approved Status */}
          {proposal.status === "approved" && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                This proposal has been approved by the group and is ready for payment
              </AlertDescription>
            </Alert>
          )}

          {proposal.status === "approved" && (
            <Button className="w-full" onClick={handleMarkAsPaid}>
              <CheckCircle2 className="w-4 h-4" />
              Mark as Paid
            </Button>
          )}

          {/* Paid Status */}
          {proposal.status === "paid" && (
            <Alert className="border-blue-500/20 bg-blue-500/10">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                This proposal has been paid on {format(new Date(), "MMM d, yyyy")}
              </AlertDescription>
            </Alert>
          )}

          {/* Rejected Status */}
          {proposal.status === "rejected" && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-400">
                This proposal has been rejected by the group
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
