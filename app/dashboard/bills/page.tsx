"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Calendar, DollarSign, User, FileText, Filter, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { Bill, BillStatus } from "@/lib/store"
import { CreateBillDialog } from "@/components/create-bill-dialog"
import { BillDetailDialog } from "@/components/bill-detail-dialog"
import { billsApi } from "@/lib/api"
import { toast } from "sonner"

export default function BillsPage() {
  const router = useRouter()
  const { user, bills, setBills, currentGroup, budgetCategories } = useStore()
  const [filterStatus, setFilterStatus] = useState<BillStatus | "ALL">("ALL")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch bills for the current group
  const fetchBills = async () => {
    if (!currentGroup) return

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Starting to fetch bills for group:', currentGroup.id)
      const groupBills = await billsApi.getByGroup(currentGroup.id)
      
      // Debug logging to understand the response structure
      console.log('🔍 Raw groupBills response:', groupBills, 'Type:', typeof groupBills, 'Is Array:', Array.isArray(groupBills))
      
      // Ensure groupBills is an array before calling .map()
      const billsArray = Array.isArray(groupBills) ? groupBills : []
      
      if (!Array.isArray(groupBills)) {
        console.warn('⚠️ API response is not an array, using empty array as fallback')
      }
      
      // Map API response to store format
      const mappedBills = billsArray.map(bill => ({
        ...bill,
        category: bill.category ? {
          id: bill.category.id,
          groupId: currentGroup.id,
          name: bill.category.name,
          color: bill.category.color,
          isActive: true,
          createdAt: new Date().toISOString()
        } : undefined
      }))
      
      setBills(mappedBills)
      console.log('✅ Successfully fetched bills:', mappedBills.length)
      console.log('📋 Mapped bills data:', mappedBills)
    } catch (err: any) {
      console.error('❌ Error fetching bills:', err)
      
      let errorMessage = "Failed to fetch bills"
      
      // Check for specific error types
      if (err?.isNetworkError) {
        errorMessage = "Network connection failed. Please check your internet connection."
      } else if (err?.message?.includes('501')) {
        errorMessage = "Bills feature is not yet implemented on the server. Please contact support."
      } else if (err?.message?.includes('404')) {
        errorMessage = "Bills endpoint not found. The server may be outdated."
      } else if (err?.message?.includes('401')) {
        errorMessage = "Authentication failed. Please log in again."
      } else if (err?.message?.includes('403')) {
        errorMessage = "You don't have permission to view bills for this group."
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      toast.error("Failed to load bills", { 
        description: errorMessage,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch bills when component loads or currentGroup changes
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (currentGroup) {
      fetchBills()
    }
  }, [user, currentGroup, router])

  if (!user || !currentGroup) {
    return null
  }

  // Since we're fetching bills for a specific group, we don't need to filter by groupId again
  // This was causing the double filtering issue
  const groupBills = Array.isArray(bills) ? bills : []
  
  console.log('🔍 Debug - Current bills state:', bills)
  console.log('🔍 Debug - Group bills after processing:', groupBills)
  console.log('🔍 Debug - Current filter status:', filterStatus)

  const filteredBills = filterStatus === "ALL" 
    ? groupBills 
    : groupBills.filter((b) => b.status === filterStatus)
    
  console.log('🔍 Debug - Filtered bills for rendering:', filteredBills)
  console.log('🔍 Debug - Filtered bills length:', filteredBills.length)

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

  const renderBillsList = (list: Bill[]) => {
    console.log('🎨 Rendering bills list with:', list.length, 'bills')
    console.log('🎨 Bills to render:', list)
    
    return list.length === 0 ? (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bills found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first bill to get started
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Bill
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : (
      list.map((bill) => {
        const category = getCategoryById(bill.categoryId)
        return (
          <Card key={bill.id} className="cursor-pointer transition-all hover:shadow-md">
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
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">
                      {Number(bill.totalAmount).toFixed(2)} {bill.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                  </div>
                </div>

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

                {category && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">Category</div>
                    </div>
                  </div>
                )}

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

              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Payee: {bill.payeeAddress.slice(0, 10)}...{bill.payeeAddress.slice(-8)}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelectedBill(bill); setIsDetailOpen(true) }}>View Details</Button>
                {bill.status === "DRAFT" && (
                  <>
                    <Button size="sm">Propose</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
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
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bills & Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage bills for {currentGroup.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchBills} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Bill
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <div className="text-destructive text-sm">
              Error loading bills: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading bills...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your bills
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview - only show when not loading */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold">{billsByStatus.all}</div>
            <div className="text-xs text-muted-foreground">Total Bills</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold">{billsByStatus.draft}</div>
            <div className="text-xs text-muted-foreground">Drafts</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold">{billsByStatus.proposed}</div>
            <div className="text-xs text-muted-foreground">Proposed</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold">{billsByStatus.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl font-bold">{billsByStatus.paid}</div>
            <div className="text-xs text-muted-foreground">Paid</div>
          </div>
        </div>
      )}

      {/* Main Content - only show when not loading */}
      {!isLoading && (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            {renderBillsList(filteredBills)}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            {renderBillsList(filteredBills)}
          </TabsContent>

          <TabsContent value="proposed" className="space-y-4">
            {renderBillsList(filteredBills)}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {renderBillsList(filteredBills)}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {renderBillsList(filteredBills)}
          </TabsContent>
        </Tabs>
      )}
      
      <CreateBillDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onBillCreated={fetchBills}
      />
      <BillDetailDialog 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        bill={selectedBill} 
        categories={budgetCategories} 
      />
    </div>
  )
}

