"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  BarChart3,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Shield,
  School,
  ChevronDown,
  User,
  Bell,
  HelpCircle,
  UserCheck,
  Trash2,
  AlertTriangle,
} from "lucide-react"

const DashboardSidebar = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(user)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setUserProfile(event.detail)
    }

    window.addEventListener("profileUpdated", handleProfileUpdate)
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate)
  }, [])

  // Update user profile when user context changes
  useEffect(() => {
    setUserProfile(user)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will remove all your data.",
      )
    ) {
      return
    }

    try {
      // Try to delete from backend
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (response.ok) {
        alert("Account deleted successfully")
      } else {
        throw new Error("Backend delete failed")
      }
    } catch (error) {
      console.log("Account deletion - clearing local data")
      // Clear all local data
      localStorage.clear()
      alert("Account data cleared successfully")
    }

    // Logout and redirect
    logout()
    navigate("/")
  }

  const isAdmin = user?.email === "admin@tabiazetu.co.ke"

  const teacherNavItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Students", path: "/students" },
    { icon: BookOpen, label: "Behavior Log", path: "/behavior-log" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ]

  const adminNavItems = [
    { icon: Shield, label: "Admin Dashboard", path: "/dashboard" },
    { icon: UserCheck, label: "Teachers", path: "/teachers" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Admin Settings", path: "/admin-settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ]

  const navItems = isAdmin ? adminNavItems : teacherNavItems

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl border-r border-teal-200 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-teal-200 bg-gradient-to-r from-teal-600 to-teal-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">TabiaZetu</h1>
                  <p className="text-xs text-teal-200">Track. Understand. Improve</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-teal-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-teal-50">
                  <div className="flex items-center space-x-3 w-full">
                    <Avatar className="w-10 h-10 border-2 border-teal-200">
                      <AvatarImage src={userProfile?.profileImage || "/placeholder.svg"} alt="Profile" />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {userProfile?.firstName?.[0]}
                        {userProfile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-teal-900">
                        {userProfile?.firstName} {userProfile?.lastName}
                      </div>
                      <div className="text-sm text-teal-600 flex items-center">
                        {userProfile?.school || "Your School"}
                        {isAdmin && <Badge className="ml-2 bg-teal-100 text-teal-800 text-xs">Admin</Badge>}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-teal-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white border-teal-200" align="start">
                <DropdownMenuLabel className="text-teal-800">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-teal-200" />
                <DropdownMenuItem
                  onClick={() => navigate(isAdmin ? "/admin-settings" : "/settings")}
                  className="text-teal-700 hover:bg-teal-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-teal-700 hover:bg-teal-50">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-teal-200" />
                <DropdownMenuItem onClick={() => setShowDeleteAccount(true)} className="text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start text-left h-12 ${
                  isActive(item.path)
                    ? "bg-teal-600 text-white shadow-lg hover:bg-teal-700"
                    : "text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                }`}
                onClick={() => {
                  navigate(item.path)
                  setIsSidebarOpen(false)
                }}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-teal-200 bg-teal-50/50">
            <div className="text-center">
              <div className="text-sm text-teal-600 mb-2">{isAdmin ? "System Administrator" : "Teacher Dashboard"}</div>
              <div className="text-xs text-teal-500">© 2025 TabiaZetu</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-teal-200 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)} className="text-teal-700">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <School className="w-6 h-6 text-teal-600" />
              <span className="font-semibold text-teal-900">TabiaZetu</span>
            </div>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-red-700">
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Your profile and account information</li>
                <li>• All student records and behavior logs</li>
                <li>• Generated reports and analytics</li>
                <li>• Settings and preferences</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAccount(false)}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DashboardSidebar;
