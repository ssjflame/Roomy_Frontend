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
  Settings,
  Eye,
  EyeOff
} from "lucide-react"
import { format } from "date-fns"
import { getChainConfig } from "@/lib/chain"

export default function ProfilePage() {
  const chain = getChainConfig()
  const router = useRouter()
  const { user, wallet, groupMembers } = useStore()
  
  console.log('🔍 Profile page - user:', user)
  console.log('🔍 Profile page - wallet:', wallet)
  console.log('🔍 Profile page - wallet balances:', wallet?.balances)
  console.log('🔍 Profile page - wallet balance:', wallet?.balance)
  
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Only redirect if no user and no auth token
    const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    
    if (!authToken && !user) {
      console.log('🔍 Profile page - No auth token and no user, redirecting to login')
      router.push("/auth/login")
      return
    }

    if (user) {
      // Add detailed logging when profile page loads
      console.log('🔍 Profile page useEffect - user exists:', !!user)
      console.log('🔍 Profile page useEffect - wallet exists:', !!wallet)
      console.log('🔍 Profile page useEffect - wallet data:', JSON.stringify(wallet, null, 2))
      
      // If no wallet data, try to refresh it
      if (!wallet) {
        console.log('🔍 Profile page - No wallet found, attempting to refresh profile data')
        const refreshWalletData = async () => {
          try {
            const { authApi } = await import('@/lib/api')
            const { setWallet } = await import('@/lib/store').then(m => m.useStore.getState())
            const profile = await authApi.getProfile()
            console.log('🔍 Profile page - Refreshed profile data:', profile)
            if (profile.wallet) {
              console.log('🔍 Profile page - Setting wallet from refresh:', profile.wallet)
              setWallet(profile.wallet)
            }
          } catch (error) {
            console.error('🔍 Profile page - Failed to refresh wallet data:', error)
          }
        }
        refreshWalletData()
      }
    }
  }, [user, router, wallet])

  // Show loading while checking authentication
  if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
    return null
  }

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
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile & Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and wallet settings
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Main Content */}
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
                    Member since {(() => {
                      try {
                        const date = new Date(user.createdAt)
                        if (isNaN(date.getTime())) {
                          return "Unknown"
                        }
                        return format(date, "MMMM yyyy")
                      } catch (error) {
                        console.warn('Invalid date format for user.createdAt:', user.createdAt)
                        return "Unknown"
                      }
                    })()}
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
                        <div className="p-6 rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
                          <div className="text-sm opacity-90 mb-2">Wallet Balances</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-2xl font-bold mb-1">
                                {(wallet?.balances?.eth ?? wallet?.balance ?? 0).toFixed(4)}
                              </div>
                              <div className="text-sm opacity-75">ETH</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold mb-1">
                                {(wallet?.balances?.usdc ?? 0).toFixed(2)}
                              </div>
                              <div className="text-sm opacity-75">USDC</div>
                            </div>
                          </div>
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
                                href={`${chain.explorerUrl}/address/${wallet.address}`}
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
                              value={wallet?.openfortPlayerId || "Not available"}
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

                        {/* Openfort Account ID */}
                        {wallet?.openfortAccountId && (
                          <div className="space-y-2">
                            <Label>Openfort Account ID</Label>
                            <div className="flex gap-2">
                              <Input
                                value={wallet.openfortAccountId}
                                readOnly
                                className="font-mono text-sm"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopyAddress(wallet.openfortAccountId!)}
                              >
                                {copied ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Chain Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Chain ID</Label>
                            <div className="text-sm font-medium">{chain.id}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Network</Label>
                            <div className="text-sm font-medium">{chain.name}</div>
                          </div>
                        </div>

                        {/* Provisioning Status */}
                        {wallet?.provisioningStatus && (
                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Provisioning Status</span>
                              <Badge variant={wallet.provisioningStatus === "provisioned" ? "secondary" : "outline"}>
                                {wallet.provisioningStatus.charAt(0).toUpperCase() + wallet.provisioningStatus.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        )}

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
                          Unable to load wallet data. This may be due to a network connection issue.
                        </p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
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
                        <div className="relative">
                          <Input 
                            id="currentPassword" 
                            type={showCurrentPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input 
                            id="newPassword" 
                            type={showNewPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input 
                            id="confirmPassword" 
                            type={showConfirmPassword ? "text" : "password"}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
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
    </div>
  )
}

