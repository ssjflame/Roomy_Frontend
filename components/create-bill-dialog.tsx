"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { billsApi } from "@/lib/api"
import { toast } from "sonner"
import type { Bill as StoreBill, BillItem as StoreBillItem } from "@/lib/store"

interface CreateBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Optional edit mode with existing bill
  mode?: "create" | "edit"
  bill?: import("@/lib/store").Bill
  // Callback to refresh bills after creation/update
  onBillCreated?: () => void
}

export function CreateBillDialog({ open, onOpenChange, mode = "create", bill, onBillCreated }: CreateBillDialogProps) {
  const { currentGroup, addBill, updateBill, budgetCategories } = useStore()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<"USDC" | "ETH" | "MATIC">("USDC")
  const [dueDate, setDueDate] = useState("")
  const [payeeAddress, setPayeeAddress] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = useMemo(() => budgetCategories || [], [budgetCategories])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTotalAmount(0)
    setCurrency("USDC")
    setDueDate("")
    setPayeeAddress("")
    setCategoryId("")
  }

  // Pre-fill form when editing
  useEffect(() => {
    if (open && mode === "edit" && bill) {
      setTitle(bill.title || "")
      setDescription(bill.description || "")
      setTotalAmount(Number(bill.totalAmount ?? 0))
      setCurrency((bill.currency as any) || "USDC")
      setDueDate(bill.dueDate ? bill.dueDate.substring(0, 10) : "")
      setPayeeAddress(bill.payeeAddress || "")
      setCategoryId(bill.categoryId || "")
    }
  }, [open, mode, bill])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!currentGroup) {
        throw new Error("No group selected. Please select a group")
      }

      const payload = {
        groupId: currentGroup.id,
        title: title.trim(),
        description: description?.trim() || undefined,
        totalAmount: Number(totalAmount),
        currency: currency as any,
        dueDate: dueDate || undefined,
        payeeAddress: payeeAddress.trim(),
        categoryId: categoryId || undefined,
      }

      // Basic validation
      if (!payload.title) throw new Error("Title is required")
      if (!payload.totalAmount || isNaN(payload.totalAmount)) throw new Error("Amount must be a valid number")
      if (!payload.payeeAddress) throw new Error("Payee address is required")

      if (mode === "edit" && bill) {
        const result = await billsApi.update(bill.id, payload)

        if (!result || !result.id) {
          throw new Error("Invalid server response while updating bill")
        }

        const updatedItems: import("@/lib/store").BillItem[] | undefined = result.items?.map((it) => ({
          id: it.id,
          billId: result.id,
          description: it.description,
          amount: Number(it.amount),
          quantity: Number(it.quantity ?? 1),
        }))

        updateBill(result.id, {
          title: result.title,
          description: result.description,
          totalAmount: Number(result.totalAmount),
          currency: result.currency,
          dueDate: result.dueDate,
          payeeAddress: result.payeeAddress,
          categoryId: result.categoryId,
          status: result.status as any,
          updatedAt: result.updatedAt,
          items: updatedItems,
          creator: undefined,
          category: undefined,
        })

        toast.success("Bill updated", { description: "Your changes have been saved." })
      } else {
        const result = await billsApi.create(payload)

        if (!result || !result.id) {
          throw new Error("Invalid server response while creating bill")
        }

        const mappedItems: import("@/lib/store").BillItem[] | undefined = result.items?.map((it) => ({
          id: it.id,
          billId: result.id,
          description: it.description,
          amount: Number(it.amount),
          quantity: Number(it.quantity ?? 1),
        }))

        const newBill: import("@/lib/store").Bill = {
          id: result.id,
          groupId: result.groupId,
          createdBy: result.createdBy,
          title: result.title,
          description: result.description,
          totalAmount: Number(result.totalAmount),
          currency: result.currency,
          dueDate: result.dueDate,
          payeeAddress: result.payeeAddress,
          categoryId: result.categoryId,
          attachmentUrl: result.attachmentUrl,
          status: result.status as any,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          items: mappedItems,
        }

        addBill(newBill)
        toast.success("Bill created", { description: "The bill was created successfully." })
      }

      // Call the refresh callback to update the bills list
      if (onBillCreated) {
        onBillCreated()
      }

      onOpenChange(false)
      // Reset only in create mode to preserve edit values if reopened
      if (mode === "create") {
        setTitle("")
        setDescription("")
        setTotalAmount(0)
        setCurrency("USDC")
        setDueDate("")
        setPayeeAddress("")
        setCategoryId("")
      }
     } catch (err: any) {
       const message =
         typeof err?.message === "string"
           ? err.message
           : typeof err === "string"
           ? err
           : "Failed to submit the bill. Please try again."
 
      toast.error(message)
     } finally {
       setIsSubmitting(false)
     }
   }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit bill" : "Create a new bill"}</DialogTitle>
          <DialogDescription>Record a shared expense for your group.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bill-title">Title</Label>
            <Input
              id="bill-title"
              placeholder="e.g., Electric bill March"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-description">Description (optional)</Label>
            <Textarea
              id="bill-description"
              placeholder="Add context or a note"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Total amount</Label>
              <Input
                id="bill-amount"
                type="number"
                min={0}
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-currency">Currency</Label>
              <select
                id="bill-currency"
                className="border rounded-md h-10 px-3 text-sm bg-background"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
              >
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
                <option value="MATIC">MATIC</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-due">Due date (optional)</Label>
              <Input
                id="bill-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-payee">Payee address</Label>
            <Input
              id="bill-payee"
              placeholder="0x..."
              value={payeeAddress}
              onChange={(e) => setPayeeAddress(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-category">Category (optional)</Label>
            <select
              id="bill-category"
              className="border rounded-md h-10 px-3 text-sm bg-background"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : mode === "edit" ? "Save Changes" : "Create Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}