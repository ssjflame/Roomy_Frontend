"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import type { Proposal, ProposalStatus } from "@/lib/store"
import { CreateProposalDialog } from "./create-proposal-dialog"
import { ProposalDetailDialog } from "./proposal-detail-dialog"

export function ProposalsList() {
  const { proposals, voteOnProposal, user } = useStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case "PENDING":
        return "default"
      case "APPROVED":
        return "secondary"
      case "REJECTED":
        return "destructive"
      case "EXECUTED":
        return "outline"
      case "EXPIRED":
        return "destructive"
      case "CANCELLED":
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: ProposalStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  const handleVote = (proposalId: string, vote: "FOR" | "AGAINST") => {
    if (user) {
      voteOnProposal(proposalId, vote, user.id)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Proposals & Bills</CardTitle>
          <CardDescription>Vote on shared expenses and track payments</CardDescription>
          <CardAction>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4" />
              New Proposal
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No proposals yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create your first proposal to get started</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedProposal(proposal)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="font-semibold leading-none">{proposal.title}</h4>
                        <p className="text-sm text-muted-foreground">{proposal.description}</p>
                      </div>
                      <Badge variant={getStatusColor(proposal.status)}>{getStatusLabel(proposal.status)}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {proposal.bill && (
                        <>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">${proposal.bill.totalAmount.toFixed(2)}</span>
                          </div>
                          {proposal.bill.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Due {format(new Date(proposal.bill.dueDate), "MMM d, yyyy")}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {proposal.status === "PENDING" && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Votes: {proposal.votesFor} for, {proposal.votesAgainst} against
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CreateProposalDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      <ProposalDetailDialog
        proposal={selectedProposal}
        open={!!selectedProposal}
        onOpenChange={(open) => !open && setSelectedProposal(null)}
        onVote={handleVote}
      />
    </>
  )
}
