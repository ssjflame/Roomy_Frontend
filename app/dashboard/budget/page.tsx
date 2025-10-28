"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, TrendingUp, AlertCircle, PieChart } from "lucide-react"
import type { BudgetCategory } from "@/lib/store"

export default function BudgetPage() {
  const router = useRouter()
  const { user, currentGroup, budgetCategories, bills } = useStore()

  useEffect(() => {
    // Only redirect if no user and no auth token
    const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!user && !authToken) {
      router.push("/")
    }
  }, [user, router])

  if (!user || !currentGroup) {
    return null
  }

  const groupCategories = budgetCategories.filter((c) => c.groupId === currentGroup.id && c.isActive)

  // Calculate spending for each category
  const getCategorySpending = (categoryId: string) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return bills
      .filter((b) => {
        const billDate = new Date(b.createdAt)
        return (
          b.categoryId === categoryId &&
          b.groupId === currentGroup.id &&
          (b.status === "PAID" || b.status === "APPROVED") &&
          billDate.getMonth() === currentMonth &&
          billDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, b) => sum + b.totalAmount, 0)
  }

  // Calculate total budget and spending
  const totalBudget = groupCategories
    .filter((c) => c.monthlyLimit)
    .reduce((sum, c) => sum + (c.monthlyLimit || 0), 0)

  const totalSpending = groupCategories
    .reduce((sum, c) => sum + getCategorySpending(c.id), 0)

  const budgetUtilization = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budget & Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage spending categories for {currentGroup.name}
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
            <div className="text-3xl font-bold">${totalBudget.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Spending</div>
            <div className="text-3xl font-bold">${totalSpending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Budget Utilization</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold">
                {budgetUtilization.toFixed(1)}%
              </div>
              {budgetUtilization > 85 && (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <Progress value={budgetUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {groupCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create budget categories to organize and track expenses
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Category
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {groupCategories.map((category) => {
              const spending = getCategorySpending(category.id)
              const limit = category.monthlyLimit || 0
              const percentage = limit > 0 ? (spending / limit) * 100 : 0
              const isOverBudget = percentage > 100
              const isNearLimit = percentage > 85 && percentage <= 100

              return (
                <Card
                  key={category.id}
                  className={`transition-all hover:shadow-md ${
                    isOverBudget ? "border-red-500" : isNearLimit ? "border-orange-500" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          {category.monthlyLimit && (
                            <CardDescription>
                              ${limit.toFixed(2)} monthly limit
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      {isOverBudget && (
                        <Badge variant="destructive">Over Budget</Badge>
                      )}
                      {isNearLimit && (
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          Near Limit
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Spending vs Budget */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            This Month
                          </span>
                          <span className="text-sm font-medium">
                            ${spending.toFixed(2)} {category.monthlyLimit && `/ $${limit.toFixed(2)}`}
                          </span>
                        </div>
                        {category.monthlyLimit && (
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-2 ${
                              isOverBudget 
                                ? "[&>div]:bg-red-500" 
                                : isNearLimit 
                                  ? "[&>div]:bg-orange-500" 
                                  : ""
                            }`}
                          />
                        )}
                        {category.monthlyLimit && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {percentage.toFixed(1)}% of budget used
                          </div>
                        )}
                      </div>

                      {/* Category Details */}
                      <div className="pt-4 border-t space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={`font-medium ${
                            isOverBudget ? "text-red-600" : ""
                          }`}>
                            ${Math.max(0, limit - spending).toFixed(2)}
                          </span>
                        </div>
                        {isOverBudget && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Over by</span>
                            <span className="font-medium text-red-600">
                              ${(spending - limit).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Bills
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Add New Category Card */}
            <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
              <CardContent className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Add Category</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new budget category
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Insights */}
        {groupCategories.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Budget Insights</CardTitle>
              <CardDescription>Monthly spending analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groupCategories
                  .filter((c) => c.monthlyLimit)
                  .sort((a, b) => {
                    const spendingA = getCategorySpending(a.id)
                    const spendingB = getCategorySpending(b.id)
                    const percentA = (spendingA / (a.monthlyLimit || 1)) * 100
                    const percentB = (spendingB / (b.monthlyLimit || 1)) * 100
                    return percentB - percentA
                  })
                  .slice(0, 5)
                  .map((category) => {
                    const spending = getCategorySpending(category.id)
                    const limit = category.monthlyLimit || 0
                    const percentage = (spending / limit) * 100

                    return (
                      <div key={category.id} className="flex items-center gap-4">
                        <div className="text-2xl">{category.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                        </div>
                        <div className="text-right min-w-[100px]">
                          <div className="text-sm font-medium">
                            ${spending.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            of ${limit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

