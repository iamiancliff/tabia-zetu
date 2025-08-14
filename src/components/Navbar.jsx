import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { School, Home, BarChart3, Settings, LogOut, ChevronDown, Bell, Menu, X, ArrowLeft } from "lucide-react"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavigation = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  const handleBack = () => {
    // Always go back to landing page when clicking back
    navigate("/")
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U"
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/reports":
        return "Reports & Analytics"
      case "/settings":
        return "Settings"
      default:
        return "TabiaZetu"
    }
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Back button - always visible on protected routes */}
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-slate-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <School className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900">TabiaZetu</h1>
                <p className="text-xs text-teal-600 font-medium">Track. Understand. Improve</p>
              </div>
            </div>
          </div>

          {/* Center - Page title on mobile */}
          <div className="md:hidden">
            <h2 className="font-semibold text-slate-900">{getPageTitle()}</h2>
          </div>

          {/* Right side - School badge and user menu */}
          <div className="flex items-center space-x-4">
            {/* School Badge - hidden on mobile */}
            <div className="hidden md:block">
              <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200">
                🏫 {user?.school || "Lenana School"}
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation("/dashboard")}
                className={isActive("/dashboard") ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={isActive("/reports") ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation("/reports")}
                className={isActive("/reports") ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button
                variant={isActive("/settings") ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation("/settings")}
                className={isActive("/settings") ? "bg-teal-500 hover:bg-teal-600" : ""}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-100">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-sm font-semibold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                    <Badge variant="outline" className="text-xs w-fit">
                      {user?.role === "admin" ? "Administrator" : "Teacher"}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation("/dashboard")}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/reports")}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={`w-full justify-start ${isActive("/dashboard") ? "bg-teal-500 hover:bg-teal-600" : ""}`}
                onClick={() => handleNavigation("/dashboard")}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={isActive("/reports") ? "default" : "ghost"}
                className={`w-full justify-start ${isActive("/reports") ? "bg-teal-500 hover:bg-teal-600" : ""}`}
                onClick={() => handleNavigation("/reports")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button
                variant={isActive("/settings") ? "default" : "ghost"}
                className={`w-full justify-start ${isActive("/settings") ? "bg-teal-500 hover:bg-teal-600" : ""}`}
                onClick={() => handleNavigation("/settings")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <div className="border-t border-slate-200 pt-2 mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar;
