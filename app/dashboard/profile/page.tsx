"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Wallet, 
  Mail, 
  Phone, 
  Copy, 
  ExternalLink, 
  Shield,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react"
import { format } from "date-fns"

export default function ProfilePage() {
  const router = useRouter()
  const { user, wallet, groupMembers } = useStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const userGroups = groupMembers.filter((m) => m.userId === user.id && m.isActive)
  const isAdmin = userGroups.some((m) => m.role === "ADMIN")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Profile & Wallet</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account and wallet settings
              </p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className="text-2xl">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                  <div className="flex gap-2 mt-3">
                    {user.isEmailVerified && (
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {isAdmin && (
                      <Badge variant="default">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Last login {format(new Date(user.lastLoginAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Member since {format(new Date(user.createdAt), "MMMM yyyy")}
                  </div>
                </div>

                <Button className="w-full">Edit Profile</Button>
              </CardContent>
            </Card>

            {/* Group Memberships */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Group Memberships</CardTitle>
                <CardDescription>
                  You're a member of {userGroups.length} {userGroups.length === 1 ? "group" : "groups"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userGroups.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Group Member</span>
                      </div>
                      <Badge variant={membership.role === "ADMIN" ? "default" : "outline"}>
                        {membership.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="wallet" className="space-y-6">
              <TabsList>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Wallet Tab */}
              <TabsContent value="wallet" className="space-y-6">
                {wallet ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Wallet Overview</CardTitle>
                        <CardDescription>
                          Your blockchain wallet powered by Openfort
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Balance */}
                        <div className="p-6 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                          <div className="text-sm opacity-90 mb-2">Total Balance</div>
                          <div className="text-4xl font-bold mb-1">
                            ${wallet.balance.toFixed(2)}
                          </div>
                          <div className="text-sm opacity-75">USDC</div>
                        </div>

                        {/* Wallet Address */}
                        <div className="space-y-2">
                          <Label>Wallet Address</Label>
                          <div className="flex gap-2">
                            <Input
                              value={wallet.address}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyAddress(wallet.address)}
                            >
                              {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a
                                href={`https://sepolia.arbiscan.io/address/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>

                        {/* Openfort Player ID */}
                        <div className="space-y-2">
                          <Label>Openfort Player ID</Label>
                          <div className="flex gap-2">
                            <Input
                              value={wallet.openfortPlayerId}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyAddress(wallet.openfortPlayerId)}
                            >
                              {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Chain Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Chain ID</Label>
                            <div className="text-sm font-medium">{wallet.chainId}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Network</Label>
                            <div className="text-sm font-medium">Arbitrum Sepolia</div>
                          </div>
                        </div>

                        {/* Wallet Status */}
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant={wallet.isActive ? "secondary" : "outline"}>
                              {wallet.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Wallet Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Wallet Actions</CardTitle>
                        <CardDescription>
                          Manage your wallet funds
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button className="w-full">
                            <Wallet className="w-4 h-4 mr-2" />
                            Deposit
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Wallet className="w-4 h-4 mr-2" />
                            Withdraw
                          </Button>
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View History
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <div className="text-center">
                        <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No wallet found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create a wallet to start making payments
                        </p>
                        <Button>Create Wallet</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue={user.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue={user.lastName} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user.username} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue={user.phoneNumber} />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button>Save Changes</Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Change Password */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Change Password</h3>
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button>Update Password</Button>
                    </div>

                    {/* Email Verification */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">Email Verification</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your email is {user.isEmailVerified ? "verified" : "not verified"}
                          </p>
                        </div>
                        <Badge variant={user.isEmailVerified ? "secondary" : "outline"}>
                          {user.isEmailVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                      {!user.isEmailVerified && (
                        <Button variant="outline" className="mt-4">
                          Send Verification Email
                        </Button>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

