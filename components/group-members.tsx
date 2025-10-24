"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function GroupMembers() {
  const { currentGroup, user } = useStore()

  if (!currentGroup) return null

  // Mock member data - in production, fetch from API
  const members = [
    { id: "user-1", name: "You", email: user?.email || "", isCurrentUser: true },
    { id: "user-2", name: "Alice Johnson", email: "alice@example.com", isCurrentUser: false },
    { id: "user-3", name: "Bob Smith", email: "bob@example.com", isCurrentUser: false },
    { id: "user-4", name: "Carol Davis", email: "carol@example.com", isCurrentUser: false },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Members
        </CardTitle>
        <CardDescription>{currentGroup.members.length} members in this group</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4" />
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  {member.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
