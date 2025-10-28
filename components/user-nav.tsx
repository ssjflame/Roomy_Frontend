"use client"

import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

export function UserNav() {
  const router = useRouter()
  const { user, wallet, setUser, setWallet, setCurrentGroup, setProposals } = useStore()

  if (!user) return null

  const handleLogout = async () => {
    try {
      // Clear authentication tokens
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      
      // Clear cookies for middleware
      try {
        document.cookie = "auth_token=; Max-Age=0; Path=/; SameSite=Lax"
        document.cookie = "refresh_token=; Max-Age=0; Path=/; SameSite=Lax"
      } catch {}
      
      // Clear store state
      setUser(null)
      setWallet(null)
      setCurrentGroup(null)
      setProposals([])
      
      // Force a hard redirect to ensure clean state
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback to router push if window.location fails
      router.push("/")
    }
  }

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const truncateAddress = (address?: string) => {
    if (!address) return "No wallet"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>

          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
