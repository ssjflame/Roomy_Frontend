"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function GroupMembers() {
  const { currentGroup, user, groupMembers } = useStore()

  if (!currentGroup) return null

  // Get members for current group
  const currentGroupMembers = groupMembers.filter(
    (m) => m.groupId === currentGroup.id && m.isActive
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getMemberName = (member: typeof currentGroupMembers[0]) => {
    if (!member.user) return "Unknown"
    if (member.user.firstName && member.user.lastName) {
      return `${member.user.firstName} ${member.user.lastName}`
    }
    return member.user.username
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Members
        </CardTitle>
        <CardDescription>
          {currentGroupMembers.length} {currentGroupMembers.length === 1 ? "member" : "members"} in this group
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            <UserPlus className="w-4 h-4" />
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentGroupMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.user?.avatarUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(getMemberName(member))}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{getMemberName(member)}</p>
                  {member.userId === user?.id && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                  {member.role === "ADMIN" && (
                    <Badge variant="default" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
