"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ThumbsUp, Users } from "lucide-react"

export function VotingStats() {
  const { proposals, user } = useStore()

  // Calculate voting statistics
  const pendingProposals = proposals.filter((p) => p.status === "pending")
  const userVotedCount = proposals.filter((p) => p.votes.voters.includes(user?.id || "")).length
  const totalVotes = proposals.reduce((sum, p) => sum + p.votes.voters.length, 0)
  const approvalRate = totalVotes > 0 ? (proposals.reduce((sum, p) => sum + p.votes.approve, 0) / totalVotes) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Voting Activity
        </CardTitle>
        <CardDescription>Your participation and group voting statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Participation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your Votes</span>
            <span className="font-semibold">
              {userVotedCount} / {proposals.length}
            </span>
          </div>
          <Progress value={(userVotedCount / Math.max(proposals.length, 1)) * 100} className="h-2" />
        </div>

        {/* Pending Votes */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Pending Votes</span>
          </div>
          <span className="text-lg font-bold">{pendingProposals.length}</span>
        </div>

        {/* Approval Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Group Approval Rate</span>
            <span className="font-semibold">{approvalRate.toFixed(0)}%</span>
          </div>
          <Progress value={approvalRate} className="h-2" />
        </div>

        {/* Total Votes Cast */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Votes Cast</span>
          <span className="font-semibold">{totalVotes}</span>
        </div>
      </CardContent>
    </Card>
  )
}
