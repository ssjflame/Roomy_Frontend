"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, Wallet, Settings, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import type { Group } from "@/lib/store"

export default function GroupsPage() {
  const router = useRouter()
  const { user, groups, groupMembers, currentGroup, setCurrentGroup } = useStore()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleGroupClick = (group: Group) => {
    setCurrentGroup(group)
    router.push("/dashboard")
  }

  const getGroupMemberCount = (groupId: string) => {
    return groupMembers.filter((m) => m.groupId === groupId && m.isActive).length
  }

  const getGroupInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Groups</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your expense sharing groups
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const memberCount = getGroupMemberCount(group.id)
            const isCurrentGroup = currentGroup?.id === group.id

            return (
              <Card
                key={group.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isCurrentGroup ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleGroupClick(group)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.imageUrl} alt={group.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getGroupInitials(group.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {isCurrentGroup && (
                          <Badge variant="secondary" className="mt-1">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open group settings
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  {group.description && (
                    <CardDescription className="mt-2">{group.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Smart Account Address */}
                    {group.smartAccountAddress && (
                      <div className="flex items-center gap-2 text-sm">
                        <Wallet className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {group.smartAccountAddress.slice(0, 6)}...
                          {group.smartAccountAddress.slice(-4)}
                        </span>
                      </div>
                    )}

                    {/* Members */}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>

                    {/* Voting Threshold */}
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {group.votingThreshold}% voting threshold
                      </span>
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created {format(new Date(group.createdAt), "MMM d, yyyy")}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant={group.isActive ? "default" : "outline"}>
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first group to start managing shared expenses
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

