"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Calendar, DollarSign, User, FileText, Filter } from "lucide-react"
import { format } from "date-fns"
import type { Bill, BillStatus } from "@/lib/store"

export default function BillsPage() {
  const router = useRouter()
  const { user, bills, currentGroup, budgetCategories } = useStore()
  const [filterStatus, setFilterStatus] = useState<BillStatus | "ALL">("ALL")

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user || !currentGroup) {
    return null
  }

  const groupBills = bills.filter((b) => b.groupId === currentGroup.id)

  const filteredBills = filterStatus === "ALL" 
    ? groupBills 
    : groupBills.filter((b) => b.status === filterStatus)

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case "DRAFT":
        return "outline"
      case "PROPOSED":
        return "default"
      case "APPROVED":
        return "secondary"
      case "REJECTED":
        return "destructive"
      case "PAID":
        return "outline"
      case "CANCELLED":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: BillStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  const getCategoryById = (categoryId?: string) => {
    return budgetCategories.find((c) => c.id === categoryId)
  }

  const billsByStatus = {
    all: groupBills.length,
    draft: groupBills.filter((b) => b.status === "DRAFT").length,
    proposed: groupBills.filter((b) => b.status === "PROPOSED").length,
    approved: groupBills.filter((b) => b.status === "APPROVED").length,
    paid: groupBills.filter((b) => b.status === "PAID").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bills & Expenses</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage bills for {currentGroup.name}
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{billsByStatus.all}</div>
              <div className="text-xs text-muted-foreground">Total Bills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{billsByStatus.draft}</div>
              <div className="text-xs text-muted-foreground">Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{billsByStatus.proposed}</div>
              <div className="text-xs text-muted-foreground">Proposed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{billsByStatus.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{billsByStatus.paid}</div>
              <div className="text-xs text-muted-foreground">Paid</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilterStatus("ALL")}>
              All Bills
            </TabsTrigger>
            <TabsTrigger value="draft" onClick={() => setFilterStatus("DRAFT")}>
              Drafts
            </TabsTrigger>
            <TabsTrigger value="proposed" onClick={() => setFilterStatus("PROPOSED")}>
              Proposed
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => setFilterStatus("APPROVED")}>
              Approved
            </TabsTrigger>
            <TabsTrigger value="paid" onClick={() => setFilterStatus("PAID")}>
              Paid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredBills.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No bills found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first bill to get started
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Bill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredBills.map((bill) => {
                const category = getCategoryById(bill.categoryId)

                return (
                  <Card
                    key={bill.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{bill.title}</CardTitle>
                            <Badge variant={getStatusColor(bill.status)}>
                              {getStatusLabel(bill.status)}
                            </Badge>
                          </div>
                          {bill.description && (
                            <CardDescription>{bill.description}</CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Amount */}
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {bill.totalAmount.toFixed(2)} {bill.currency}
                            </div>
                            <div className="text-xs text-muted-foreground">Amount</div>
                          </div>
                        </div>

                        {/* Due Date */}
                        {bill.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm font-medium">
                                {format(new Date(bill.dueDate), "MMM d, yyyy")}
                              </div>
                              <div className="text-xs text-muted-foreground">Due Date</div>
                            </div>
                          </div>
                        )}

                        {/* Category */}
                        {category && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category.icon}</span>
                            <div>
                              <div className="text-sm font-medium">{category.name}</div>
                              <div className="text-xs text-muted-foreground">Category</div>
                            </div>
                          </div>
                        )}

                        {/* Creator */}
                        {bill.creator && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={bill.creator.avatarUrl} />
                              <AvatarFallback>
                                {bill.creator.firstName?.[0]}
                                {bill.creator.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {bill.creator.firstName} {bill.creator.lastName}
                              </div>
                              <div className="text-xs text-muted-foreground">Created by</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payee Address */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                          Payee: {bill.payeeAddress.slice(0, 10)}...
                          {bill.payeeAddress.slice(-8)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {bill.status === "DRAFT" && (
                          <>
                            <Button size="sm">Propose</Button>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </>
                        )}
                        {bill.status === "APPROVED" && (
                          <Button size="sm">Pay Now</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="draft">
            <div className="space-y-4">
              {filteredBills.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No draft bills</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="proposed">
            <div className="space-y-4">
              {filteredBills.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No proposed bills</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="space-y-4">
              {filteredBills.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No approved bills</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paid">
            <div className="space-y-4">
              {filteredBills.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No paid bills</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

