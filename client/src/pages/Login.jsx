import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { School, LogIn, ArrowRight, Shield, Eye, EyeOff } from "lucide-react"

const Login = () => {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  
  // Admin login security
  const [adminLoginAttempts, setAdminLoginAttempts] = useState(0)
  const [adminLoginLocked, setAdminLoginLocked] = useState(false)
  const [adminLoginLockoutTime, setAdminLoginLockoutTime] = useState(0)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields")
      setIsLoading(false)
      return
    }

    const result = await login(loginData.email, loginData.password)
    if (!result.success) {
      // Extract clean error message from the result
      let errorMessage = "Login failed. Please try again."
      
      if (result.error) {
        // If it's a JSON string, try to parse it
        if (typeof result.error === 'string' && result.error.includes('{')) {
          try {
            const parsedError = JSON.parse(result.error)
            errorMessage = parsedError.error || parsedError.message || "Invalid email or password"
          } catch {
            // If parsing fails, use the raw error message
            errorMessage = result.error
          }
        } else {
          errorMessage = result.error
        }
      }
      
      // Clean up common error messages
      if (errorMessage.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password"
      } else if (errorMessage.includes("Something went wrong")) {
        errorMessage = "Invalid email or password"
      }
      
      // Only set the form error, no toast notification for login errors
      setError(errorMessage)
    } else {
      toast.success("Login successful! Welcome back!")
      setError(""); // Clear error on success
      // Optionally, redirect to dashboard here if not handled in AuthContext
    }
    setIsLoading(false)
  }

  const handleAdminLogin = async () => {
    // Check if admin login is locked due to too many attempts
    if (adminLoginLocked) {
      const remainingTime = Math.ceil((adminLoginLockoutTime + 300000 - Date.now()) / 1000 / 60)
      if (remainingTime > 0) {
        toast.error(`Admin login is temporarily locked. Try again in ${remainingTime} minutes.`)
        return
      } else {
        // Reset lockout after 5 minutes
        setAdminLoginLocked(false)
        setAdminLoginAttempts(0)
      }
    }

    // Check if maximum attempts reached
    if (adminLoginAttempts >= 3) {
      setAdminLoginLocked(true)
      setAdminLoginLockoutTime(Date.now())
      toast.error("Too many failed attempts. Admin login locked for 5 minutes.")
      return
    }

    // Show password prompt for admin access
    const adminPassword = prompt("🔐 ADMIN ACCESS REQUIRED\n\nPlease enter the admin password:")
    
    if (!adminPassword) {
      toast.info("Admin login cancelled")
      return
    }
    
    // Check admin password (you can change this password)
    if (adminPassword !== "admin2024") {
      toast.error("Invalid admin password")
      return
    }

    setIsLoading(true)
    setError("")
    toast.loading("Verifying admin credentials...")

    // Auto-login as admin
    const result = await login("admin@tabiazetu.co.ke", "admin123")
    if (!result.success) {
      toast.dismiss()
      
      // Increment failed attempts
      const newAttempts = adminLoginAttempts + 1
      setAdminLoginAttempts(newAttempts)
      
      // Extract clean error message from the result
      let errorMessage = "Admin login failed. Please check your credentials."
      
      if (result.error) {
        // If it's a JSON string, try to parse it
        if (typeof result.error === 'string' && result.error.includes('{')) {
          try {
            const parsedError = JSON.parse(result.error)
            errorMessage = parsedError.error || parsedError.message || "Admin login failed"
          } catch {
            // If parsing fails, use the raw error message
            errorMessage = result.error
          }
        } else {
          errorMessage = result.error
        }
      }
      
      // Show remaining attempts
      const remainingAttempts = 3 - newAttempts
      if (remainingAttempts > 0) {
        errorMessage += ` (${remainingAttempts} attempts remaining)`
      } else {
        errorMessage = "Maximum failed attempts reached. Admin login locked for 5 minutes."
      }
      
      toast.error(errorMessage)
      setError(errorMessage)
      
      // Log failed admin login attempt
      console.log(`🚨 [SECURITY] Failed admin login attempt ${newAttempts}/3 at ${new Date().toISOString()}`)
    } else {
      toast.dismiss()
      toast.success("Admin access granted! Welcome, Administrator.")
      
      // Log successful admin login
      console.log(`🔐 [SECURITY] Admin login successful at ${new Date().toISOString()}`)
      
      // Reset security counters
      setAdminLoginAttempts(0)
      setAdminLoginLocked(false)
      
      setError(""); // Clear error on success
      // Optionally, redirect to dashboard here if not handled in AuthContext
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TabiaZetu</h1>
              <p className="text-xs text-orange-600 font-medium">Track. Understand. Improve</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              🇰🇪 Made in Kenya
            </Badge>
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your TabiaZetu account</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="teacher@school.co.ke"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleAdminLogin}
                  variant="outline"
                  className={`w-full ${
                    adminLoginLocked 
                      ? "border-red-200 text-red-600 bg-red-50 cursor-not-allowed" 
                      : "border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                  }`}
                  disabled={isLoading || adminLoginLocked}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {adminLoginLocked ? "Admin Login Locked" : "Admin Login"}
                </Button>
                {adminLoginLocked && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    Locked due to too many failed attempts
                  </p>
                )}
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login
