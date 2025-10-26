"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"
import type { Bill, BudgetCategory } from "@/lib/store"

interface BillDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill | null
  categories?: BudgetCategory[]
}

export function BillDetailDialog({ open, onOpenChange, bill, categories = [] }: BillDetailDialogProps) {
  const categoryName = useMemo(() => {
    const cat = categories.find((c) => c.id === bill?.categoryId)
    return cat?.name || bill?.category?.name || "—"
  }, [bill, categories])

  if (!bill) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bill details</DialogTitle>
            <DialogDescription>No bill selected.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const amountStr = `${Number(bill.totalAmount).toFixed(2)} ${bill.currency}`
  const dueStr = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "—"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
          <DialogDescription>Details for this bill</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-sm font-medium">{amountStr}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-sm font-medium">{bill.status}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Due date</div>
            <div className="text-sm font-medium">{dueStr}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Payee address</div>
            <div className="text-sm font-medium break-all">{bill.payeeAddress}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Category</div>
            <div className="text-sm font-medium">{categoryName}</div>
          </div>
          {bill.description && (
            <div>
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="text-sm">{bill.description}</div>
            </div>
          )}

          {bill.items && bill.items.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-2">Items</div>
              <div className="space-y-1">
                {bill.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-sm">
                    <div className="mr-2">{it.description}</div>
                    <div className="text-muted-foreground">x{it.quantity}</div>
                    <div className="font-medium">{Number(it.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}