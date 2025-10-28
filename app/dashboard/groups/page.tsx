"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, Wallet, Settings, TrendingUp, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import type { Group } from "@/lib/store"
import { CreateGroupDialog } from "@/components/create-group-dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { groupsApi } from "@/lib/api"

export default function GroupsPage() {
  const router = useRouter()
  const { user, groups, groupMembers, currentGroup, setCurrentGroup, setGroups } = useStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editImageUrl, setEditImageUrl] = useState("")
  const [editVotingThreshold, setEditVotingThreshold] = useState<number>(51)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [openMenuGroupId, setOpenMenuGroupId] = useState<string | null>(null)

  useEffect(() => {
    // Only redirect if no user and no auth token
    const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!user && !authToken) {
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

  const openEdit = (group: Group) => {
    setEditingGroup(group)
    setEditName(group.name)
    setEditDescription(group.description || "")
    setEditImageUrl(group.imageUrl || "")
    setEditVotingThreshold(group.votingThreshold ?? 51)
    setEditIsActive(group.isActive)
    setIsEditOpen(true)
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return
    if (!editName.trim()) {
      toast.error("Group name is required")
      return
    }
    if (!Number.isFinite(editVotingThreshold) || editVotingThreshold < 1 || editVotingThreshold > 100) {
      toast.error("Voting threshold must be between 1 and 100")
      return
    }
    setEditSubmitting(true)
    try {
      const payload: any = {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        imageUrl: editImageUrl.trim() || undefined,
        votingThreshold: Math.round(editVotingThreshold),
        isActive: editIsActive,
      }
      const updated = await groupsApi.update(editingGroup.id, payload as any)
      // Update local store
      setGroups(
        groups.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: updated.name ?? editName.trim(),
                description: (updated.description ?? editDescription.trim()) || undefined,
                imageUrl: editImageUrl.trim() || g.imageUrl,
                votingThreshold: (updated as any).votingThreshold ?? Math.round(editVotingThreshold),
                isActive: (updated as any).isActive ?? editIsActive,
                updatedAt: (updated as any).updatedAt || new Date().toISOString(),
              }
            : g,
        ),
      )
      if (currentGroup?.id === editingGroup.id) {
        setCurrentGroup({
          ...currentGroup,
          name: updated.name ?? editName.trim(),
          description: (updated.description ?? editDescription.trim()) || undefined,
          imageUrl: editImageUrl.trim() || currentGroup.imageUrl,
          votingThreshold: (updated as any).votingThreshold ?? Math.round(editVotingThreshold),
          isActive: (updated as any).isActive ?? editIsActive,
          updatedAt: (updated as any).updatedAt || new Date().toISOString(),
        })
      }
      toast.success("Group updated")
      setIsEditOpen(false)
      setEditingGroup(null)
    } catch (error) {
      console.error("Update group error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update group")
    } finally {
      setEditSubmitting(false)
    }
  }

  const confirmDelete = (group: Group) => {
    setDeletingGroup(group)
    setIsDeleteOpen(true)
  }

  const submitDelete = async () => {
    if (!deletingGroup) return
    setDeleteSubmitting(true)
    try {
      await groupsApi.delete(deletingGroup.id)
      const filtered = groups.filter((g) => g.id !== deletingGroup.id)
      setGroups(filtered)
      if (currentGroup?.id === deletingGroup.id) {
        setCurrentGroup(null)
      }
      toast.success("Group deleted")
      setIsDeleteOpen(false)
      setDeletingGroup(null)
    } catch (error) {
      console.error("Delete group error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete group")
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your expense sharing groups
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    <DropdownMenu open={openMenuGroupId === group.id} onOpenChange={(open) => setOpenMenuGroupId(open ? group.id : null)}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            openEdit(group)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(group)
                            setOpenMenuGroupId(null)
                          }}
                        >
                          <Edit className="w-4 h-4" /> Edit Group
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => {
                            e.preventDefault()
                            confirmDelete(group)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmDelete(group)
                            setOpenMenuGroupId(null)
                          }}
                        >
                          <Trash2 className="w-4 h-4" /> Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Create Group Dialog */}
      <CreateGroupDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* Edit Group Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>Update group details, threshold, and visibility.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Image URL</Label>
              <Input id="edit-image" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-threshold">Voting threshold (1–100%)</Label>
              <Input
                id="edit-threshold"
                type="number"
                min={1}
                max={100}
                value={editVotingThreshold}
                onChange={(e) => setEditVotingThreshold(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive groups are hidden from active operations.</p>
              </div>
              <Switch checked={editIsActive} onCheckedChange={(checked) => setEditIsActive(checked)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirm */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete group</DialogTitle>
            <DialogDescription>
              This will perform a soft delete (mark inactive) to preserve history. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDelete} disabled={deleteSubmitting}>
              {deleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

