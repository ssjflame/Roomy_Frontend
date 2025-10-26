"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"
import { groupsApi, authApi } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const router = useRouter()
  const { wallet, addGroup, setCurrentGroup, setWallet } = useStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [useClientAddress, setUseClientAddress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [provisioning, setProvisioning] = useState(false)
  const [votingThreshold, setVotingThreshold] = useState<number>(51)

  const clientAddress = useMemo(() => wallet?.address || "", [wallet])
  const canUseClientAddress = !!clientAddress

  const handleProvisionWallet = async () => {
    setProvisioning(true)
    try {
      const { wallet } = await authApi.session()
      if (wallet) {
        setWallet(wallet)
        toast.success("Wallet provisioned. You can now use your address.")
      } else {
        toast.error("Wallet not returned. Try logging out and signing in again.")
      }
    } catch (e) {
      console.error("Wallet provisioning error:", e)
      toast.error("Provisioning failed. Please log in again to provision it.")
    } finally {
      setProvisioning(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Group name is required")
      return
    }

    if (!Number.isFinite(votingThreshold) || votingThreshold < 1 || votingThreshold > 100) {
      toast.error("Voting threshold must be between 1 and 100")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        votingThreshold: Math.round(votingThreshold),
      }
      if (useClientAddress && canUseClientAddress) {
        payload.smartAccountAddress = clientAddress
      }

      const result = await groupsApi.create(payload)

      const assignedAddress = (result as any).smartAccountAddress || (result as any).walletAddress || undefined

      // Map backend group shape to store shape
      const newGroup = {
        id: result.id,
        name: result.name,
        description: result.description,
        imageUrl: "/placeholder.svg",
        smartAccountAddress: assignedAddress || clientAddress || undefined,
        isActive: true,
        votingThreshold: (result as any).votingThreshold ?? Math.round(votingThreshold),
        createdAt: (result as any).createdAt || new Date().toISOString(),
        updatedAt: (result as any).updatedAt || new Date().toISOString(),
      }

      addGroup(newGroup)
      setCurrentGroup(newGroup)

      // UX: inform user of final address and any override behavior
      if (useClientAddress && canUseClientAddress && assignedAddress && assignedAddress.toLowerCase() !== clientAddress.toLowerCase()) {
        toast.info("Backend assigned a unique address for this group (overrode client address).")
      }
      if (assignedAddress) {
        const short = `${assignedAddress.slice(0, 6)}...${assignedAddress.slice(-4)}`
        toast.success(`Group created. Address: ${short}`)
      } else {
        toast.success("Group created successfully")
      }

      onOpenChange(false)
      router.push("/dashboard")
    } catch (error) {
      console.error("Create group error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create group")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
          <DialogDescription>Set up your shared smart account and start managing expenses.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Apartment 4B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Description (optional)</Label>
            <Input
              id="group-description"
              placeholder="What is this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-threshold">Voting threshold (1–100%)</Label>
            <Input
              id="group-threshold"
              type="number"
              min={1}
              max={100}
              value={votingThreshold}
              onChange={(e) => setVotingThreshold(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">Defaults to 51% if not specified.</p>
          </div>

          {!canUseClientAddress && (
            <Alert>
              <AlertDescription>
                No wallet detected. Log out and sign in to provision your wallet, or try provisioning now.
              </AlertDescription>
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={handleProvisionWallet}
                disabled={provisioning}
              >
                {provisioning ? "Provisioning..." : "Provision Wallet"}
              </Button>
            </Alert>
          )}

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">Use my embedded wallet address</p>
              <p className="text-xs text-muted-foreground">
                {canUseClientAddress
                  ? `Address: ${clientAddress.slice(0, 6)}...${clientAddress.slice(-4)}`
                  : "No wallet detected. You can still create a group; backend will assign a unique address."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: leave off for best reliability. Backend enforces uniqueness and provisions the address.
              </p>
            </div>
            <Switch
              checked={useClientAddress && canUseClientAddress}
              onCheckedChange={(checked) => setUseClientAddress(checked)}
              disabled={!canUseClientAddress}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}