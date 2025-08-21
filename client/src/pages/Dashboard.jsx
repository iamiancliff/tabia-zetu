import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ReportChart from "../components/ReportChart"
import BehaviorForm from "../components/BehaviorForm"
import SuggestionCard from "../components/SuggestionCard"
import { useAuth } from "../context/AuthContext"
import { BookOpen, Users, TrendingUp, AlertTriangle, Plus, Calendar, Clock, Target, Award, User, School } from "lucide-react"
import { API_BASE_URL } from "../utils/api"
import { toast } from "sonner"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Navigation function
  const handleNavigation = (path) => {
    try {
      navigate(path)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location if navigate fails
      window.location.href = path
    }
  }
  const [students, setStudents] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [profileUpdateTrigger, setProfileUpdateTrigger] = useState(0)

  // Remove the problematic refreshUserData call that was causing infinite loops
  // useEffect(() => {
  //   refreshUserData()
  // }, [refreshUserData])

  // Listen for profile updates to refresh dashboard data
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      // Check if bio or streams were updated, as these affect the Teacher Profile section
      const updatedUser = event.detail
      if (updatedUser.bio !== user?.bio || 
          JSON.stringify(updatedUser.streams) !== JSON.stringify(user?.streams)) {
        // Force re-render by updating the profile update trigger
        setProfileUpdateTrigger(prev => prev + 1)
      }
    }

    window.addEventListener("profileUpdated", handleProfileUpdate)
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate)
  }, [user?.bio, user?.streams])

  // Get Kenya time
  const getKenyaTime = () => {
    return new Date().toLocaleString("en-US", {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadData()
      } catch (error) {
        console.error("Failed to initialize dashboard data:", error)
      }
    }
    
    initializeData()
  }, []) // Empty dependency array - only run once on mount

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Try to load from backend first
      try {
        const apiUrl = API_BASE_URL;
        const [behaviorsResponse, studentsResponse] = await Promise.all([
          fetch(`${apiUrl}/behaviors`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch(`${apiUrl}/students`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ])

        if (behaviorsResponse.ok && studentsResponse.ok) {
          const behaviorsData = await behaviorsResponse.json()
          const studentsData = await studentsResponse.json()
          const studentMap = new Map((Array.isArray(studentsData) ? studentsData : []).map((s) => [s._id || s.id, s.name]))
          const normalizedBehaviors = (Array.isArray(behaviorsData) ? behaviorsData : []).map((b) => ({
            ...b,
            studentDisplayName: (b.student && b.student.name) ? b.student.name : studentMap.get(b.student) || b.student,
          }))
          setBehaviors(normalizedBehaviors)
          setStudents(Array.isArray(studentsData) ? studentsData : [])
        } else {
          throw new Error("Backend not available")
        }
      } catch (backendError) {
        alert("Failed to connect to backend. Please check your server and network.");
        setBehaviors([]);
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setBehaviors(mockBehaviors)
      setStudents(mockStudents)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBehavior = async (behaviorData) => {
    // Map form data to backend payload
    const payload = {
      studentId: behaviorData.studentId, // should be student _id
      behaviorType: behaviorData.behaviorType,
      subject: behaviorData.subject,
      timeOfDay: behaviorData.timeOfDay,
      severity: behaviorData.severity,
      notes: behaviorData.notes,
      outcome: behaviorData.outcome,
      date: new Date().toISOString(),
    }

    try {
      const apiUrl = API_BASE_URL
      const response = await fetch(`${apiUrl}/behaviors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await loadData()
        toast.success("Behavior log added successfully!")
      } else {
        // Try to read detailed error from server
        let serverMessage = `Request failed (${response.status})`
        try {
          const errJson = await response.json()
          serverMessage = errJson?.message || serverMessage
        } catch {}

        // If student not found on backend (common when data exists only in localStorage),
        // fall back to localStorage so the user can keep working offline.
        if (response.status === 404 && serverMessage.toLowerCase().includes("student")) {
          const newBehavior = {
            id: Date.now().toString(),
            ...payload,
            createdAt: new Date().toISOString(),
          }
          const stored = JSON.parse(localStorage.getItem("behaviors") || "[]")
          const updated = [newBehavior, ...stored]
          localStorage.setItem("behaviors", JSON.stringify(updated))
          setBehaviors(updated)
          toast.success("Student not found on server; saved behavior locally")
        } else if (response.status === 401) {
          toast.error("Session expired. Please log in again.")
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
        } else {
          throw new Error(serverMessage)
        }
      }
    } catch (error) {
      console.error("Dashboard add behavior error:", error)
      toast.error(error?.message || "Failed to connect to backend.")
    }

    setShowAddForm(false)
  }

  const mockBehaviors = [
    {
      id: "1",
      student: "Amina Hassan",
      behaviorType: "excellent_work",
      subject: "Mathematics",
      notes: "Actively participated in class discussion about fractions",
      timeOfDay: "Morning (8:00 - 10:00 AM)",
      severity: "low",
      createdAt: getKenyaTime(),
      teacher: user?.id,
    },
    {
      id: "2",
      student: "John Kiprotich",
      behaviorType: "talking_in_class",
      subject: "English",
      notes: "Talking during lesson, disrupting other students",
      timeOfDay: "Mid-Morning (10:00 AM - 12:00 PM)",
      severity: "medium",
      createdAt: getKenyaTime(),
      teacher: user?.id,
    },
  ]

  const mockStudents = [
    { id: "1", name: "Amina Hassan", class: "Grade 5A" },
    { id: "2", name: "John Kiprotich", class: "Grade 5A" },
    { id: "3", name: "Grace Wanjiku", class: "Grade 5B" },
    { id: "4", name: "David Ochieng", class: "Grade 5A" },
  ]

  // Calculate statistics
  const totalBehaviors = behaviors.length
  const positiveBehaviors = behaviors.filter((b) =>
    b && b.behaviorType && [
      'excellent_work', 'class_participation', 'helping_others', 
      'leadership', 'creativity', 'respectful', 'organized', 'teamwork',
      'positive', 'participation', 'helpful' // legacy support
    ].includes(b.behaviorType),
  ).length
  const concerningBehaviors = behaviors.filter((b) => 
    b && b.behaviorType && [
      'talking_in_class', 'not_listening', 'disrupting_class', 
      'using_phone', 'fighting', 'bullying',
      'disruptive', 'aggressive' // legacy support
    ].includes(b.behaviorType)
  ).length
  const todaysBehaviors = behaviors.filter((b) => {
    if (!b || !b.createdAt) return false
    try {
      const today = new Date().toDateString()
      const behaviorDate = new Date(b.createdAt).toDateString()
      return today === behaviorDate
    } catch (error) {
      console.error("Error parsing behavior date:", error)
      return false
    }
  }).length

  // Debug logging for dashboard counts
  // console.log("🔍 [Dashboard] Behavior counts:", {
  //   total: totalBehaviors,
  //   positive: positiveBehaviors,
  //   concerning: concerningBehaviors,
  //   today: todaysBehaviors,
  //   behaviors: behaviors.map(b => ({
  //     id: b._id || b.id,
  //     type: b.behaviorType,
  //     date: b.createdAt || b.date,
  //     isToday: b.createdAt ? new Date(b.createdAt).toDateString() === new Date().toDateString() : false
  //   }))
  // })

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300">Loading dashboard...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 pb-20 space-y-6">
                    {/* Welcome Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 rounded-2xl p-6 text-white shadow-lg transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || "Teacher"}! 👋</h1>
                <p className="text-teal-100 text-lg">
                  {user?.school || "Your School"} • {user?.county || "Kenya"}
                </p>
                <div className="flex items-center mt-3 text-teal-200">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{currentTime}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{totalBehaviors}</div>
                <div className="text-teal-200">Total Logs</div>
              </div>
            </div>
          </div>



          {/* Teacher Profile Section */}
          {(user?.bio || (user?.streams && user.streams.length > 0)) && (
            <Card key={`profile-${profileUpdateTrigger}`} className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-teal-200 dark:border-gray-600 shadow-lg overflow-hidden transition-colors duration-200">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-100/20 to-blue-100/20 dark:from-teal-900/20 dark:to-blue-900/20"></div>
              <CardHeader className="relative">
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-full">
                    <User className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                  </div>
                  Teacher Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {user?.bio && (
                  <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-teal-100 dark:border-teal-800 transition-colors duration-200">
                    <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                      About Me
                    </h4>
                    <p className="text-teal-700 dark:text-teal-300 text-sm leading-relaxed">{user.bio}</p>
                  </div>
                )}
                {user?.streams && user.streams.length > 0 && (
                  <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-4 border border-teal-100 dark:border-teal-800 transition-colors duration-200">
                    <h4 className="font-medium text-teal-800 dark:text-teal-200 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Classes I Teach
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {user.streams.map((stream) => (
                        <Badge 
                          key={stream} 
                          variant="secondary" 
                          className="bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700 hover:from-teal-200 hover:to-blue-200 dark:hover:from-teal-800 dark:hover:to-blue-800 transition-all duration-200"
                        >
                          {stream}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Teaching Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                  Teaching Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-3 border border-teal-100 dark:border-teal-800 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-teal-800 dark:text-teal-200">Behavior Tracking</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">{behaviors.length} logs</span>
                  </div>
                  <div className="w-full bg-teal-100 dark:bg-teal-900 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((behaviors.length / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Goal: 50 logs this month</p>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg p-3 border border-teal-100 dark:border-teal-800 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-teal-800 dark:text-teal-200">Student Engagement</span>
                    <span className="text-xs text-teal-600 dark:text-teal-400">{students.length} students</span>
                  </div>
                  <div className="w-full bg-teal-100 dark:bg-teal-900 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((students.length / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Goal: 30 active students</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-teal-700 dark:text-teal-300">
                  Access key features quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  type="button"
                  className="w-full p-3 border-2 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 hover:border-teal-400 dark:hover:border-teal-500 hover:text-teal-800 dark:hover:text-teal-200 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95 rounded-md font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    
                    // Try React Router first for smooth navigation
                    try {
                      navigate('/students')
                    } catch (error) {
                      console.error('React Router navigation failed:', error)
                      // Fallback to direct navigation if React Router fails
                      window.location.href = '/students'
                    }
                  }}
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  Manage Students
                </button>
                
                <button 
                  type="button"
                  className="w-full p-3 border-2 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 hover:border-teal-400 dark:hover:border-teal-500 hover:text-teal-800 dark:hover:text-teal-200 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-95 rounded-md font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    
                    // Try React Router first for smooth navigation
                    try {
                      navigate('/reports')
                    } catch (error) {
                      console.error('React Router navigation failed:', error)
                      // Fallback to direct navigation if React Router fails
                      window.location.href = '/reports'
                    }
                  }}
                >
                  <BookOpen className="w-4 h-4 mr-2 inline" />
                  View Reports
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-gray-700 border-teal-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-800 dark:text-teal-200">Total Students</CardTitle>
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-full">
                  <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900 dark:text-teal-100">{students.length}</div>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Active in your classes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700 border-green-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Positive Behaviors</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{positiveBehaviors}</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Great job encouraging!</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-700 border-orange-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Needs Attention</CardTitle>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{concerningBehaviors}</div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Behaviors to address</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 border-blue-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Today's Logs</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{todaysBehaviors}</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Recorded today</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Add Behavior */}
          {showAddForm && (
            <Card className="bg-gradient-to-r from-white to-teal-50 dark:from-gray-800 dark:to-gray-700 border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Log Behavior
                </CardTitle>
                <CardDescription className="text-teal-700 dark:text-teal-300">Record a behavior observation</CardDescription>
              </CardHeader>
              <CardContent>
                <BehaviorForm students={students} onSubmit={handleAddBehavior} onCancel={() => setShowAddForm(false)} />
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Analytics Chart */}
            <div className="lg:col-span-2">
              {/* Analytics Chart */}
              <Card className="bg-gradient-to-r from-white to-teal-50 dark:from-gray-800 dark:to-gray-700 border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-teal-900 dark:text-teal-100">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-full">
                          <TrendingUp className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                        </div>
                        Behavior Analytics
                      </CardTitle>
                      <CardDescription className="text-teal-700 dark:text-teal-300">Weekly behavior trends and patterns</CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={showAddForm ? "bg-gray-500 hover:bg-gray-600" : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showAddForm ? "Cancel" : "Log Behavior"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Custom Behavior Analytics Display */}
                  <div className="space-y-6">
                    {/* Behavior Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">Positive Behaviors</p>
                            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                              {behaviors.filter(b => b && b.behaviorType && [
                                'excellent_work', 'class_participation', 'helping_others', 
                                'leadership', 'creativity', 'respectful', 'organized', 'teamwork',
                                'positive', 'participation', 'helpful' // legacy support
                              ].includes(b.behaviorType)).length}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Challenging Behaviors</p>
                            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                              {behaviors.filter(b => b && b.behaviorType && ![
                                'excellent_work', 'class_participation', 'helping_others', 
                                'leadership', 'creativity', 'respectful', 'organized', 'teamwork',
                                'positive', 'participation', 'helpful' // legacy support
                              ].includes(b.behaviorType)).length}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Logged</p>
                            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{behaviors.length}</p>
                          </div>
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-lg">📊</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Behavior Distribution Chart */}
                    {behaviors.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 transition-colors duration-200">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Behavior Type Distribution</h4>
                        <div className="space-y-3">
                          {(() => {
                            const behaviorCounts = behaviors.reduce((acc, behavior) => {
                              if (behavior && behavior.behaviorType) {
                                acc[behavior.behaviorType] = (acc[behavior.behaviorType] || 0) + 1
                              }
                              return acc
                            }, {})
                            
                            const total = Object.values(behaviorCounts).reduce((sum, count) => sum + count, 0)
                            
                            return Object.entries(behaviorCounts).map(([type, count], index) => {
                              const percentage = Math.round((count / total) * 100)
                              const isPositive = [
                                'excellent_work', 'class_participation', 'helping_others', 
                                'leadership', 'creativity', 'respectful', 'organized', 'teamwork',
                                'positive', 'participation', 'helpful' // legacy support
                              ].includes(type)
                              const colorClass = isPositive ? "bg-green-500" : "bg-yellow-500"
                              
                              // Format behavior type for display
                              const displayType = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                              
                              return (
                                <div key={`${type}-${index}`} className="flex items-center space-x-3">
                                  <div className="w-24 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {displayType}
                                  </div>
                                  <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                                    <div 
                                      className={`h-3 rounded-full transition-all duration-500 ${colorClass}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="w-12 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {count}
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Recent Behavior Timeline */}
                    {behaviors.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 transition-colors duration-200">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Recent Activity Timeline</h4>
                        <div className="space-y-3">
                          {behaviors.slice(0, 5).map((behavior, index) => {
                            if (!behavior || !behavior.behaviorType) return null
                            
                            const isPositive = [
                              'excellent_work', 'class_participation', 'helping_others', 
                              'leadership', 'creativity', 'respectful', 'organized', 'teamwork',
                              'positive', 'participation', 'helpful' // legacy support
                            ].includes(behavior.behaviorType)
                            const colorClass = isPositive ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                            const iconClass = isPositive ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                            
                            // Fix date display
                            let dateDisplay = "Unknown Date"
                            try {
                              if (behavior.date) {
                                dateDisplay = new Date(behavior.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              } else if (behavior.createdAt) {
                                dateDisplay = new Date(behavior.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              }
                            } catch (error) {
                              console.error("Error parsing behavior date:", error, behavior)
                              dateDisplay = "Invalid Date"
                            }
                            
                            return (
                              <div key={behavior.id || `behavior-${index}`} className={`flex items-start space-x-3 p-3 rounded-lg border ${colorClass}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconClass}`}>
                                  {isPositive ? "✅" : "⚠️"}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">
                                    {behavior.behaviorType.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {behavior.studentDisplayName || "Unknown Student"}
                                  </p>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {dateDisplay}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default Dashboard