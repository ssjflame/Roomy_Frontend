"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  RefreshCw, 
  ExternalLink,
  Download,
  Filter
} from "lucide-react"
import { format } from "date-fns"
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/store"
import { getChainConfig } from "@/lib/chain"

export default function TransactionsPage() {
  const chain = getChainConfig()
  const router = useRouter()
  const { user, transactions, currentGroup } = useStore()
  const [filterType, setFilterType] = useState<TransactionType | "ALL">("ALL")

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user || !currentGroup) {
    return null
  }

  const groupTransactions = transactions.filter((t) => t.groupId === currentGroup.id)

  const filteredTransactions = filterType === "ALL" 
    ? groupTransactions 
    : groupTransactions.filter((t) => t.type === filterType)

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "PENDING":
        return "outline"
      case "PROCESSING":
        return "default"
      case "COMPLETED":
        return "secondary"
      case "FAILED":
        return "destructive"
      case "CANCELLED":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: TransactionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case "BILL_PAYMENT":
        return <Receipt className="w-4 h-4" />
      case "DEPOSIT":
        return <ArrowDownLeft className="w-4 h-4" />
      case "WITHDRAWAL":
        return <ArrowUpRight className="w-4 h-4" />
      case "REFUND":
        return <RefreshCw className="w-4 h-4" />
      case "TRANSFER":
        return <ArrowUpRight className="w-4 h-4" />
      default:
        return <Receipt className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: TransactionType) => {
    return type.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ")
  }

  const transactionsByType = {
    all: groupTransactions.length,
    billPayment: groupTransactions.filter((t) => t.type === "BILL_PAYMENT").length,
    deposit: groupTransactions.filter((t) => t.type === "DEPOSIT").length,
    withdrawal: groupTransactions.filter((t) => t.type === "WITHDRAWAL").length,
    refund: groupTransactions.filter((t) => t.type === "REFUND").length,
  }

  const totalVolume = groupTransactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + Number(t?.amount ?? 0), 0)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all transactions for {currentGroup.name}
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{transactionsByType.all}</div>
            <div className="text-xs text-muted-foreground">Total Transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">${totalVolume.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{transactionsByType.billPayment}</div>
            <div className="text-xs text-muted-foreground">Bill Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{transactionsByType.deposit}</div>
            <div className="text-xs text-muted-foreground">Deposits</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{transactionsByType.withdrawal}</div>
            <div className="text-xs text-muted-foreground">Withdrawals</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" onClick={() => setFilterType("ALL")}>
            All
          </TabsTrigger>
          <TabsTrigger value="bill_payment" onClick={() => setFilterType("BILL_PAYMENT")}>
            Bills
          </TabsTrigger>
          <TabsTrigger value="deposit" onClick={() => setFilterType("DEPOSIT")}>
            Deposits
          </TabsTrigger>
          <TabsTrigger value="withdrawal" onClick={() => setFilterType("WITHDRAWAL")}>
            Withdrawals
          </TabsTrigger>
          <TabsTrigger value="other" onClick={() => setFilterType("REFUND")}>
            Other
          </TabsTrigger>
        </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                    <p className="text-sm text-muted-foreground">
                      Transactions will appear here once bills are paid
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className="transition-all hover:shadow-md"
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {getTypeIcon(transaction.type)}
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{getTypeLabel(transaction.type)}</h3>
                              <Badge variant={getStatusColor(transaction.status)}>
                                {getStatusLabel(transaction.status)}
                              </Badge>
                            </div>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                {format(new Date(transaction.createdAt), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                              {transaction.sender && (
                                <div className="flex items-center gap-1">
                                  <Avatar className="w-4 h-4">
                                    <AvatarImage src={transaction.sender.avatarUrl} />
                                    <AvatarFallback className="text-[8px]">
                                      {transaction.sender.firstName?.[0]}
                                      {transaction.sender.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
                                    {transaction.sender.firstName} {transaction.sender.lastName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              transaction.type === "DEPOSIT" 
                                ? "text-green-600" 
                                : transaction.type === "WITHDRAWAL" 
                                  ? "text-red-600" 
                                  : ""
                            }`}>
                              {transaction.type === "DEPOSIT" && "+"}
                              {transaction.type === "WITHDRAWAL" && "-"}
                              ${Number(transaction?.amount ?? 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.currency}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      {transaction.txHash && (
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="font-mono text-xs text-muted-foreground">
                            Tx: {transaction.txHash.slice(0, 10)}...
                            {transaction.txHash.slice(-8)}
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a 
                              href={`${chain.explorerUrl}/tx/${transaction.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View on Explorer
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bill_payment">
            <div className="space-y-4">
              {filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No bill payment transactions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deposit">
            <div className="space-y-4">
              {filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No deposit transactions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="withdrawal">
            <div className="space-y-4">
              {filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No withdrawal transactions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="space-y-4">
              {filteredTransactions.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No other transactions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
    </div>
  )
}

