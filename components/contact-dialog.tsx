"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { User, Mail, MessageSquare, Send, Phone, MapPin } from "lucide-react"

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      // Placeholder submission — integrate with your API later
      await new Promise((res) => setTimeout(res, 600))
      onOpenChange(false)
      setName("")
      setEmail("")
      setMessage("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] lg:max-w-[600px] my-4 max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/90 shadow-2xl">
        <DialogHeader className="space-y-2 pb-3">
          <DialogTitle className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Get in Touch
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Have a question or need support? We'd love to hear from you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <User className="w-3 h-3 text-primary" />
                Full Name
              </Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name" 
                className="h-9 text-sm rounded-lg border-2 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 bg-background/50"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-primary" />
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your.email@example.com" 
                className="h-9 text-sm rounded-lg border-2 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 bg-background/50"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="message" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-primary" />
                Your Message
              </Label>
              <Textarea 
                id="message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Tell us about your question, feedback, or how we can help you..." 
                rows={4} 
                className="text-sm rounded-lg border-2 border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200 bg-background/50 resize-none"
              />
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-secondary/30 rounded-xl p-3 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Other Ways to Reach Us</h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Mail className="w-3 h-3 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Email</p>
                    <p className="text-xs text-muted-foreground">support@roomy.app</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Phone className="w-3 h-3 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Phone</p>
                    <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Office</p>
                    <p className="text-xs text-muted-foreground">San Francisco, CA</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  We typically respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="pt-3 gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={submitting}
            className="h-9 px-4 text-sm rounded-lg border-2 hover:bg-secondary/50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
            className="h-9 px-6 text-sm rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {submitting ? (
              <>
                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}