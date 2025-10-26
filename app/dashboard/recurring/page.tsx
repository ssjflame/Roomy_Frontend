"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Calendar, DollarSign, Repeat, Clock, Play, Pause } from "lucide-react"
import { format, addDays, addWeeks, addMonths, addQuarters, addYears } from "date-fns"
import type { RecurringBill, RecurringFrequency } from "@/lib/store"

export default function RecurringBillsPage() {
  const router = useRouter()
  const { user, currentGroup, recurringBills, budgetCategories } = useStore()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user || !currentGroup) {
    return null
  }

  const groupRecurringBills = recurringBills.filter(
    (rb) => rb.groupId === currentGroup.id
  )

  const activeRecurringBills = groupRecurringBills.filter((rb) => rb.isActive)
  const inactiveRecurringBills = groupRecurringBills.filter((rb) => !rb.isActive)

  const getFrequencyLabel = (frequency: RecurringFrequency) => {
    return frequency.charAt(0) + frequency.slice(1).toLowerCase()
  }

  const getFrequencyIcon = (frequency: RecurringFrequency) => {
    return <Repeat className="w-4 h-4" />
  }

  const getCategoryById = (categoryId?: string) => {
    return budgetCategories.find((c) => c.id === categoryId)
  }

  const calculateNextOccurrence = (bill: RecurringBill) => {
    const nextDate = new Date(bill.nextDueDate)
    return format(nextDate, "MMM d, yyyy")
  }

  const calculateOccurrencesRemaining = (bill: RecurringBill) => {
    if (!bill.endDate) return "Ongoing"
    
    const now = new Date()
    const end = new Date(bill.endDate)
    const next = new Date(bill.nextDueDate)
    
    if (end < now) return "Ended"
    
    let count = 0
    let current = next
    
    while (current <= end) {
      count++
      
      switch (bill.frequency) {
        case "DAILY":
          current = addDays(current, 1)
          break
        case "WEEKLY":
          current = addWeeks(current, 1)
          break
        case "BIWEEKLY":
          current = addWeeks(current, 2)
          break
        case "MONTHLY":
          current = addMonths(current, 1)
          break
        case "QUARTERLY":
          current = addQuarters(current, 1)
          break
        case "YEARLY":
          current = addYears(current, 1)
          break
      }
    }
    
    return `${count} remaining`
  }

  const totalMonthlyRecurring = activeRecurringBills
    .filter((rb) => rb.frequency === "MONTHLY")
    .reduce((sum, rb) => sum + rb.amount, 0)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recurring Bills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage automated recurring expenses for {currentGroup.name}
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring Bill
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{activeRecurringBills.length}</div>
            <div className="text-xs text-muted-foreground">Active Bills</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">${totalMonthlyRecurring.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Monthly Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {activeRecurringBills.filter((rb) => rb.autoPropose).length}
            </div>
            <div className="text-xs text-muted-foreground">Auto-Proposed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{inactiveRecurringBills.length}</div>
            <div className="text-xs text-muted-foreground">Paused</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
        {/* Active Recurring Bills */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Active Recurring Bills</h2>
          
          {activeRecurringBills.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Repeat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recurring bills yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up recurring bills to automate regular payments
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Recurring Bill
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRecurringBills.map((bill) => {
                const category = getCategoryById(bill.categoryId)
                const nextOccurrence = calculateNextOccurrence(bill)
                const occurrencesRemaining = calculateOccurrencesRemaining(bill)

                return (
                  <Card key={bill.id} className="hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{bill.title}</CardTitle>
                          {bill.description && (
                            <CardDescription className="mt-1">
                              {bill.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Amount */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Amount</span>
                          </div>
                          <span className="text-lg font-bold">
                            ${bill.amount.toFixed(2)}
                          </span>
                        </div>

                        {/* Frequency */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFrequencyIcon(bill.frequency)}
                            <span className="text-sm text-muted-foreground">Frequency</span>
                          </div>
                          <Badge variant="outline">
                            {getFrequencyLabel(bill.frequency)}
                          </Badge>
                        </div>

                        {/* Next Due Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Next Due</span>
                          </div>
                          <span className="text-sm font-medium">{nextOccurrence}</span>
                        </div>

                        {/* Category */}
                        {category && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Category</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                          </div>
                        )}

                        {/* Occurrences Remaining */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Status</span>
                          </div>
                          <span className="text-sm">{occurrencesRemaining}</span>
                        </div>

                        {/* Auto Propose */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-sm text-muted-foreground">
                            Auto-propose
                          </span>
                          <Switch checked={bill.autoPropose} disabled />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Inactive/Paused Bills */}
        {inactiveRecurringBills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Paused Bills</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveRecurringBills.map((bill) => {
                const category = getCategoryById(bill.categoryId)

                return (
                  <Card key={bill.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{bill.title}</CardTitle>
                          {bill.description && (
                            <CardDescription className="mt-1">
                              {bill.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant="outline">Paused</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <span className="text-lg font-bold">
                            ${bill.amount.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Frequency</span>
                          <Badge variant="outline">
                            {getFrequencyLabel(bill.frequency)}
                          </Badge>
                        </div>

                        {category && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Category</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon}</span>
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                          <Button variant="ghost" size="sm">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-xs">i</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">How Recurring Bills Work</h4>
                <p className="text-sm text-muted-foreground">
                  Recurring bills automatically create proposals on their due dates. 
                  When auto-propose is enabled, group members will be notified to vote on 
                  the payment. Once approved, the payment will be processed from the group wallet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

