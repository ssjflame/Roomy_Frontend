"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { fetchWithAuth } from "@/lib/api"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Mail, Plus, X, CheckCircle2, AlertCircle } from "lucide-react"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface InviteLink {
  email: string
  link: string
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const { currentGroup } = useStore()
  const [emails, setEmails] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])

  const addEmailField = () => {
    setEmails([...emails, ''])
  }

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index))
    }
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const validateEmails = () => {
    const validEmails = emails.filter(email => email.trim() !== '')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    for (const email of validEmails) {
      if (!emailRegex.test(email.trim())) {
        return { valid: false, message: `Invalid email format: ${email}` }
      }
    }
    
    if (validEmails.length === 0) {
      return { valid: false, message: 'Please enter at least one email address' }
    }
    
    return { valid: true, emails: validEmails.map(email => email.trim()) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentGroup) return

    setError(null)
    setSuccess(null)
    setInviteLinks([])

    const validation = validateEmails()
    if (!validation.valid) {
      setError(validation.message!)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetchWithAuth(`/groups/${currentGroup.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({
          emails: validation.emails
        }),
      })

      if (response.success && response.data) {
        // Handle case where links might not be present in the response
        const links = (response.data as { links?: InviteLink[] }).links || []
        setInviteLinks(links)
        setSuccess(`Successfully created ${links.length} invite link${links.length > 1 ? 's' : ''}!`)
        setEmails(['']) // Reset form
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invites')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleClose = () => {
    setEmails([''])
    setError(null)
    setSuccess(null)
    setInviteLinks([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invite Members
          </DialogTitle>
          <DialogDescription>
            Send invitations to join {currentGroup?.name || 'this group'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Email Addresses</Label>
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1"
                />
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeEmailField(index)}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailField}
              disabled={isSubmitting || emails.length >= 10}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Email
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {inviteLinks.length > 0 && (
            <div className="space-y-3">
              <Label>Invite Links</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {inviteLinks.map((invite, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {invite.email}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={invite.link}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(invite.link)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {inviteLinks.length > 0 ? 'Done' : 'Cancel'}
            </Button>
            {inviteLinks.length === 0 && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating Invites...' : 'Create Invites'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}