"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "../components/ThemeToggle"
import {
  BookOpen,
  Heart,
  ArrowRight,
  School,
  Target,
  BarChart3,
  Shield,
  LogIn,
  UserPlus,
  Smartphone,
  TrendingUp,
  Award,
  Globe,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Star,
  Quote,
  ChevronRight,
} from "lucide-react"

const LandingPage = () => {
  const navigate = useNavigate()
  const { login, signup, restoreSession, isAuthenticated, loading } = useAuth()
  const [error, setError] = useState("")
  const [showContinueOption, setShowContinueOption] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    county: "",
  })
  const [activeSection, setActiveSection] = useState("home")

  const kenyanCounties = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Machakos",
    "Meru",
    "Nyeri",
    "Kericho",
    "Embu",
  ]

  // Check if user has previous session on component mount
  useEffect(() => {
    const hasStoredSession = localStorage.getItem("token") && localStorage.getItem("user")
    setShowContinueOption(hasStoredSession)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields")
      return
    }

    const result = await login(loginData.email, loginData.password)
    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.error || "Login failed. Please try again.")
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError("")

    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (
      !signupData.firstName ||
      !signupData.lastName ||
      !signupData.email ||
      !signupData.password ||
      !signupData.school
    ) {
      setError("Please fill in all required fields")
      return
    }

    const result = await signup(signupData)
    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.error || "Signup failed. Please try again.")
    }
  }

  const handleAdminLogin = async () => {
    setError("")
    const result = await login("admin@tabiazetu.co.ke", "admin123")
    if (result.success) {
      navigate("/dashboard")
    } else {
      setError("Admin login failed")
    }
  }

  const handleContinueSession = () => {
    const restored = restoreSession()
    if (restored) {
      navigate("/dashboard")
    } else {
      setShowContinueOption(false)
      setError("Session expired. Please sign in again.")
    }
  }

  const handleGoToDashboard = () => {
    navigate("/dashboard")
  }

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
      setActiveSection(sectionId)
    }
  }

  const handleJoinCommunity = () => {
    // Scroll to the signup section
    const authSection = document.getElementById("auth-section")
    if (authSection) {
      authSection.scrollIntoView({ behavior: "smooth" })
      // Switch to signup tab after scrolling
      setTimeout(() => {
        const signupTab = document.querySelector('[value="signup"]')
        if (signupTab) {
          signupTab.click()
        }
      }, 500)
    }
  }

  const testimonials = [
    {
      id: 1,
      name: "Mary Wanjiku",
      role: "Primary School Teacher, Nairobi",
      image: "/african-female-teacher.png",
      quote:
        "TabiaZetu has transformed how I understand my students. The insights help me create a more supportive classroom environment that honors our African values while preparing children for the future.",
      stars: 5,
    },
    {
      id: 2,
      name: "James Ochieng",
      role: "Secondary School Teacher, Kisumu",
      image: "/african-male-teacher.png",
      quote:
        "The behavior tracking tools have made classroom management so much easier. I can identify patterns and address issues before they become problems. My students are more engaged than ever!",
      stars: 5,
    },
    {
      id: 3,
      name: "Sarah Kimani",
      role: "School Principal, Nakuru",
      image: "/african-female-principal.png",
      quote:
        "As a school administrator, TabiaZetu gives me valuable insights into classroom dynamics across our entire school. The data helps us make informed decisions about resource allocation and teacher support.",
      stars: 4,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-teal-800 to-teal-900 text-white">
      {/* Hero Section with Background Image */}
      <section id="home" className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/african-teacher-smartphone.png"
            alt="African teacher using smartphone with engaged students"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/85 to-transparent"></div>
          {/* Additional overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-teal-900/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          {/* Header */}
          <header className="mb-16">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                  <School className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">TabiaZetu</h1>
                  <p className="text-sm text-teal-200 font-medium drop-shadow">Track. Understand. Improve</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-6">
                  <button
                    onClick={() => scrollToSection("home")}
                    className={`text-sm font-medium hover:text-teal-300 transition-colors ${
                      activeSection === "home" ? "text-teal-300 underline underline-offset-4" : "text-white"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => scrollToSection("features")}
                    className={`text-sm font-medium hover:text-teal-300 transition-colors ${
                      activeSection === "features" ? "text-teal-300 underline underline-offset-4" : "text-white"
                    }`}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("testimonials")}
                    className={`text-sm font-medium hover:text-teal-300 transition-colors ${
                      activeSection === "testimonials" ? "text-teal-300 underline underline-offset-4" : "text-white"
                    }`}
                  >
                    Testimonials
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className={`text-sm font-medium hover:text-teal-300 transition-colors ${
                      activeSection === "contact" ? "text-teal-300 underline underline-offset-4" : "text-white"
                    }`}
                  >
                    Contact
                  </button>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Show continue or go to dashboard button if user is authenticated */}
                {isAuthenticated && (
                  <Button onClick={handleGoToDashboard} className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </nav>
          </header>

          <div className="grid lg:grid-cols-2 gap-16 items-center" id="auth-section">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-8">
                <Badge className="bg-teal-500/30 text-teal-100 border-teal-400/50 backdrop-blur-sm text-base px-6 py-3 shadow-lg">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Digital Behavior Intelligence for Kenya
                </Badge>

                <div className="space-y-6">
                  <h2 className="text-5xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                    Transform
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-white">
                      {" "}
                      Education
                    </span>
                    <br />
                    <span className="text-4xl lg:text-5xl text-teal-200">Through Smart Insights</span>
                  </h2>

                  <p className="text-xl lg:text-2xl text-slate-200 leading-relaxed drop-shadow-lg max-w-2xl">
                    Empowering Kenyan teachers with mobile-first technology to understand, track, and improve student
                    behavior patterns in real-time.
                  </p>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Mobile-First Design</h3>
                    <p className="text-sm text-slate-300">Track behaviors on any device</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Real-Time Analytics</h3>
                    <p className="text-sm text-slate-300">Instant behavior insights</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Smart Suggestions</h3>
                    <p className="text-sm text-slate-300">AI-powered recommendations</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Culturally Aware</h3>
                    <p className="text-sm text-slate-300">Built for African classrooms</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/30">
                <div className="text-center">
                  <div className="text-4xl font-bold text-teal-300 drop-shadow-lg">500+</div>
                  <div className="text-sm text-slate-300 font-medium">Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-teal-300 drop-shadow-lg">15K+</div>
                  <div className="text-sm text-slate-300 font-medium">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-teal-300 drop-shadow-lg">98%</div>
                  <div className="text-sm text-slate-300 font-medium">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Forms */}
            <div className="relative">
              <Card className="bg-white/15 backdrop-blur-xl border-white/30 shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border-2 border-white/20">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-white drop-shadow-lg">Join TabiaZetu</CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Start transforming your classroom today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="mb-6 border-red-400/50 bg-red-500/20 backdrop-blur-sm">
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Continue Session Option */}
                  {showContinueOption && !isAuthenticated && (
                    <div className="mb-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/50">
                      <p className="text-blue-200 text-sm mb-3">Welcome back! Continue where you left off?</p>
                      <Button
                        onClick={handleContinueSession}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Continue Previous Session
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 backdrop-blur-sm h-14">
                      <TabsTrigger
                        value="login"
                        className="text-white data-[state=active]:bg-teal-500 data-[state=active]:text-white text-base py-3"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="text-white data-[state=active]:bg-teal-500 data-[state=active]:text-white text-base py-3"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="login-email" className="text-slate-200 text-base">
                            Email
                          </Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="teacher@school.co.ke"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            className="bg-white/10 border-white/30 text-white placeholder:text-teal-700 backdrop-blur-sm h-12 text-base"
                            required
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="login-password" className="text-slate-200 text-base">
                            Password
                          </Label>
                          <Input
                            id="login-password"
                            type="password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="bg-white/10 border-white/30 text-white placeholder:text-teal-400 backdrop-blur-sm h-12 text-base"
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 h-14 text-base font-semibold shadow-xl"
                          disabled={loading}
                        >
                          {loading ? "Signing in..." : "Sign In"}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </form>

                      <div className="mt-6 pt-6 border-t border-white/30">
                        <Button
                          onClick={handleAdminLogin}
                          variant="outline"
                          className="w-full border-teal-400/50 text-teal-200 hover:bg-teal-500/20 bg-transparent backdrop-blur-sm h-12 text-base"
                          disabled={loading}
                        >
                          <Shield className="w-5 h-5 mr-2" />
                          Admin Demo Login
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-firstname" className="text-slate-200">
                              First Name
                            </Label>
                            <Input
                              id="signup-firstname"
                              placeholder="John"
                              value={signupData.firstName}
                              onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder:text-teal-700 backdrop-blur-sm h-11"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-lastname" className="text-slate-200">
                              Last Name
                            </Label>
                            <Input
                              id="signup-lastname"
                              placeholder="Doe"
                              value={signupData.lastName}
                              onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder:text-teal-700 backdrop-blur-sm h-11"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-slate-200">
                            Email
                          </Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="teacher@school.co.ke"
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            className="bg-white/10 border-white/30 text-white placeholder:text-teal-700 backdrop-blur-sm h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-school" className="text-slate-200">
                            School Name
                          </Label>
                          <Input
                            id="signup-school"
                            placeholder="Nairobi Primary School"
                            value={signupData.school}
                            onChange={(e) => setSignupData({ ...signupData, school: e.target.value })}
                            className="bg-white/10 border-white/30 text-white placeholder:text-teal-700 backdrop-blur-sm h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-county" className="text-slate-200">
                            County
                          </Label>
                          <Select
                            value={signupData.county}
                            onValueChange={(value) => setSignupData({ ...signupData, county: value })}
                          >
                            <SelectTrigger className="bg-teal-800 text-white backdrop-blur-sm h-11">
                              <SelectValue placeholder="Select your county" />
                            </SelectTrigger>
                            <SelectContent className="bg-teal-700 border-teal-700">
                              {kenyanCounties.map((county) => (
                                <SelectItem key={county} value={county} className="text-white hover:bg-teal-700">
                                  {county}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-password" className="text-slate-200">
                              Password
                            </Label>
                            <Input
                              id="signup-password"
                              type="password"
                              value={signupData.password}
                              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder:text-teal-700 backdrop-blur-sm h-11"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm" className="text-slate-200">
                              Confirm
                            </Label>
                            <Input
                              id="signup-confirm"
                              type="password"
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                              className="bg-white/10 border-white/30 text-white placeholder:text-slate-400 backdrop-blur-sm h-11"
                              required
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 h-12 text-base font-semibold shadow-xl"
                          disabled={loading}
                        >
                          {loading ? "Creating account..." : "Create Account"}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-teal-900 to-teal-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-teal-500/30 text-teal-100 border-teal-400/50 mb-6 text-base px-6 py-3">
              ✨ Powerful Features for African Schools
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Everything you need to understand your students
            </h3>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Built specifically for Kenyan classrooms with culturally-aware tools and mobile-first design.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-teal-100 text-center leading-relaxed">
                  Log student behaviors instantly with our mobile-friendly interface designed for busy teachers on the
                  go.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Visual Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-teal-100 text-center leading-relaxed">
                  Beautiful charts and insights that help you understand behavior patterns and student progress over
                  time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Smart Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-teal-100 text-center leading-relaxed">
                  AI-powered recommendations that understand African classroom dynamics and cultural contexts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section with Multiple Cards */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-teal-800 to-teal-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-teal-500/30 text-teal-100 border-teal-400/50 mb-6 text-base px-6 py-3">
              <Quote className="w-5 h-5 mr-2" />
              What Educators Are Saying
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">Trusted by Teachers Across Kenya</h3>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Hear from educators who have transformed their classrooms with TabiaZetu.
            </p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="bg-white/10 border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-teal-400">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl text-white">{testimonial.name}</CardTitle>
                  <CardDescription className="text-teal-200">{testimonial.role}</CardDescription>
                  <div className="flex items-center justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.stars ? "text-yellow-400" : "text-gray-400"}`}
                        fill={i < testimonial.stars ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Quote className="w-8 h-8 text-teal-500/30 absolute -top-4 -left-2" />
                    <p className="text-teal-100 text-center leading-relaxed pt-2">{testimonial.quote}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Button
              onClick={handleJoinCommunity}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl"
            >
              Join Our Community
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* New Classroom Section with Translucent Image */}
      <section className="py-24 bg-gradient-to-b from-teal-900 to-teal-800 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-teal-500/30 text-teal-100 border-teal-400/50 text-base px-6 py-3">
                🎓 Real Classroom Impact
              </Badge>
              <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">Transforming Learning Experiences</h3>
              <p className="text-xl text-teal-100 leading-relaxed">
                See how TabiaZetu is making a real difference in Kenyan classrooms. Our platform helps teachers create
                more engaging, supportive, and effective learning environments for every student.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                  <span className="text-teal-100">Improved student engagement by 85%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                  <span className="text-teal-100">Reduced behavioral incidents by 60%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-teal-400" />
                  <span className="text-teal-100">Enhanced teacher-student relationships</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 relative">
                <img
                  src="/african-students-classroom.png"
                  alt="African students in classroom listening attentively to their teacher"
                  className="w-full h-auto object-cover opacity-85"
                />
                {/* Teal overlay to match theme */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-transparent to-teal-800/30 mix-blend-overlay"></div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Footer */}
      <footer id="contact" className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 text-white">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <School className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">TabiaZetu</h3>
                  <p className="text-teal-300 font-medium">Track. Understand. Improve</p>
                </div>
              </div>
              <p className="text-teal-100 text-lg leading-relaxed mb-6">
                Empowering Kenyan educators with intelligent classroom management tools. Built for
                teachers, with love for our students' success.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-teal-700 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-teal-700 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-teal-700 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-teal-700 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-teal-700 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-teal-300">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-teal-100 hover:text-teal-300 transition-colors flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-teal-100 hover:text-teal-300 transition-colors flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-teal-100 hover:text-teal-300 transition-colors flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-teal-100 hover:text-teal-300 transition-colors flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-teal-100 hover:text-teal-300 transition-colors flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Training
                  </a>
                </li>
                <li>
                  <a href="#" className="text-teal-100 hover:text-teal-300 transition-colors flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-teal-300">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-teal-100">Nairobi, Kenya</p>
                    <p className="text-sm text-teal-300">Serving schools nationwide</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <a
                    href="mailto:hello@tabiazetu.co.ke"
                    className="text-teal-100 hover:text-teal-300 transition-colors"
                  >
                    hello@tabiazetu.co.ke
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" />
                  <a href="tel:+254700000000" className="text-teal-100 hover:text-teal-300 transition-colors">
                    +254 792 156 702
                  </a>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8">
                <h5 className="font-semibold mb-3 text-teal-300">Stay Updated</h5>
                <div className="flex">
                  <Input
                    placeholder="Your email"
                    className="bg-teal-800/50 border-teal-700 text-white placeholder-teal-400 rounded-r-none"
                  />
                  <Button className="bg-teal-600 hover:bg-teal-500 rounded-l-none">
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm text-teal-300">
                <span>© 2025 TabiaZetu. All rights reserved.</span>
                <a href="#" className="hover:text-teal-100 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-teal-100 transition-colors">
                  Terms of Service
                </a>
              </div>

              <div className="flex items-center space-x-2 text-sm text-teal-300">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Made with love for Kenyan educators</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-4 right-4 opacity-10">
          <School className="w-32 h-32 text-teal-400" />
        </div>
      </footer>
    </div>
  )
}

export default LandingPage;
