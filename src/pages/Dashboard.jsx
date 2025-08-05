"use client"

import { useState, useEffect } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ReportChart from "../components/ReportChart"
import BehaviorForm from "../components/BehaviorForm"
import SuggestionCard from "../components/SuggestionCard"
import { useAuth } from "../context/AuthContext"
import { BookOpen, Users, TrendingUp, AlertTriangle, Plus, Calendar, Clock, Target, Award } from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth()
  const [behaviors, setBehaviors] = useState([])
  const [students, setStudents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState("")

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
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Try to load from backend first
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
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
          setBehaviors(behaviorsData.behaviors || [])
          setStudents(studentsData.students || [])
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
    const newBehavior = {
      id: Date.now().toString(),
      ...behaviorData,
      teacher: user?.id,
      createdAt: getKenyaTime(),
      updatedAt: getKenyaTime(),
    }

    try {
      // Try to save to backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/behaviors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newBehavior),
      })

      if (response.ok) {
        const savedBehavior = await response.json()
        setBehaviors((prev) => [savedBehavior.behavior, ...prev])
      } else {
        throw new Error("Backend save failed")
      }
    } catch (error) {
      alert("Failed to connect to backend. Please check your server and network.");
    }

    setShowAddForm(false)
  }

  const mockBehaviors = [
    {
      id: "1",
      student: "Amina Hassan",
      behaviorType: "positive",
      subject: "Mathematics",
      description: "Actively participated in class discussion about fractions",
      timeOfDay: "Morning (8:00 - 10:00 AM)",
      severity: "low",
      createdAt: getKenyaTime(),
      teacher: user?.id,
    },
    {
      id: "2",
      student: "John Kiprotich",
      behaviorType: "disruptive",
      subject: "English",
      description: "Talking during lesson, disrupting other students",
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
    ["positive", "participation", "helpful"].includes(b.behaviorType),
  ).length
  const concerningBehaviors = behaviors.filter((b) => ["disruptive", "aggressive"].includes(b.behaviorType)).length
  const todaysBehaviors = behaviors.filter((b) => {
    const today = new Date().toDateString()
    const behaviorDate = new Date(b.createdAt).toDateString()
    return today === behaviorDate
  }).length

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700">Loading dashboard...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-800">Total Students</CardTitle>
                <Users className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-900">{students.length}</div>
                <p className="text-xs text-teal-600 mt-1">Active in your classes</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Positive Behaviors</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{positiveBehaviors}</div>
                <p className="text-xs text-green-600 mt-1">Great job encouraging!</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Needs Attention</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{concerningBehaviors}</div>
                <p className="text-xs text-orange-600 mt-1">Behaviors to address</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Today's Logs</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{todaysBehaviors}</div>
                <p className="text-xs text-blue-600 mt-1">Recorded today</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Add Behavior */}
          {showAddForm && (
            <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-teal-900">Quick Log Behavior</CardTitle>
                <CardDescription className="text-teal-700">Record a behavior observation</CardDescription>
              </CardHeader>
              <CardContent>
                <BehaviorForm students={students} onSubmit={handleAddBehavior} onCancel={() => setShowAddForm(false)} />
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analytics Chart */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-teal-900">
                        <TrendingUp className="w-5 h-5" />
                        Behavior Analytics
                      </CardTitle>
                      <CardDescription className="text-teal-700">Weekly behavior trends and patterns</CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className={showAddForm ? "bg-gray-500 hover:bg-gray-600" : "bg-teal-600 hover:bg-teal-700"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {showAddForm ? "Cancel" : "Log Behavior"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ReportChart behaviors={behaviors} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Suggestions */}
            <div className="space-y-6">
              {/* Recent Behaviors */}
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-900">
                    <BookOpen className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {behaviors.slice(0, 5).map((behavior) => (
                    <div
                      key={behavior.id}
                      className="flex items-start space-x-3 p-3 bg-teal-50 rounded-lg border border-teal-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-teal-900">{behavior.student}</span>
                          <Badge
                            className={
                              ["positive", "participation", "helpful"].includes(behavior.behaviorType)
                                ? "bg-green-100 text-green-800 border-green-300"
                                : behavior.severity === "high"
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-300"
                            }
                          >
                            {behavior.behaviorType}
                          </Badge>
                        </div>
                        <p className="text-sm text-teal-700 mb-1">{behavior.description}</p>
                        <p className="text-xs text-teal-600">
                          {behavior.subject} • {behavior.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                  {behaviors.length === 0 && (
                    <div className="text-center py-8 text-teal-600">
                      <Target className="w-12 h-12 mx-auto mb-3 text-teal-400" />
                      <p>No behaviors logged yet</p>
                      <p className="text-sm">Start tracking to see insights</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <SuggestionCard behaviors={behaviors} />
            </div>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default Dashboard;
