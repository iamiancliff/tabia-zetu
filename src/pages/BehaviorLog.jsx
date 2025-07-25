"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Plus, Clock, Download, CheckCircle, Users, Calendar } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import BehaviorForm from "../components/BehaviorForm"
import DashboardSidebar from "../components/DashboardSidebar"

const BehaviorLog = () => {
  const { user } = useAuth()
  const [behaviors, setBehaviors] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState("")

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

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Try to load from backend first
      try {
        const [behaviorsResponse, studentsResponse] = await Promise.all([
          fetch("/api/behaviors", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("/api/students", {
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
        console.log("Using localStorage data")
        // Load from localStorage
        const storedBehaviors = JSON.parse(localStorage.getItem("behaviors") || "[]")
        const storedStudents = JSON.parse(localStorage.getItem("students") || "[]")

        setBehaviors(storedBehaviors)
        setStudents(storedStudents)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setBehaviors([])
      setStudents([])
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
    }

    try {
      // Try to save to backend
      const response = await fetch("/api/behaviors", {
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
      console.log("Saving to localStorage")
      // Save to localStorage as fallback
      const updatedBehaviors = [newBehavior, ...behaviors]
      setBehaviors(updatedBehaviors)
      localStorage.setItem("behaviors", JSON.stringify(updatedBehaviors))
    }

    setShowAddForm(false)
    setMessage("Behavior logged successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const getRecentActivity = () => {
    if (behaviors.length === 0) return "No behaviors logged yet"

    const lastBehavior = behaviors[0]
    const lastLoggedDate = new Date(lastBehavior.createdAt)
    const now = new Date()
    const diffInHours = Math.floor((now - lastLoggedDate) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
  }

  const exportBehaviors = () => {
    const csvData = [
      ["Date", "Time", "Student", "Behavior Type", "Subject", "Time of Day", "Severity", "Description", "Outcome"],
      ...behaviors.map((behavior) => [
        new Date(behavior.createdAt).toLocaleDateString(),
        new Date(behavior.createdAt).toLocaleTimeString(),
        behavior.student,
        behavior.behaviorType,
        behavior.subject,
        behavior.timeOfDay,
        behavior.severity,
        behavior.description,
        behavior.outcome || "",
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `behavior-log-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setMessage("Behavior log exported successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const getBehaviorTypeColor = (type) => {
    switch (type) {
      case "positive":
      case "participation":
      case "helpful":
        return "bg-green-100 text-green-800"
      case "disruptive":
      case "aggressive":
        return "bg-red-100 text-red-800"
      case "late":
      case "absent":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700">Loading behavior log...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Behavior Log</h1>
                  <p className="text-teal-100 text-lg">Track and manage student behaviors in real-time</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{behaviors.length}</div>
                <div className="text-teal-200">Total Logs</div>
              </div>
            </div>
          </div>

          {message && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Students Registered</p>
                    <p className="text-3xl font-bold">{students.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Behaviors Logged</p>
                    <p className="text-3xl font-bold">{behaviors.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Last Activity</p>
                    <p className="text-lg font-bold">{getRecentActivity()}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="log" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 border border-teal-200">
              <TabsTrigger value="log" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Behavior History
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Log New Behavior
              </TabsTrigger>
            </TabsList>

            <TabsContent value="log">
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-teal-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Behavior History
                      </CardTitle>
                      <CardDescription className="text-teal-700">
                        Complete log of all recorded student behaviors
                      </CardDescription>
                    </div>
                    {behaviors.length > 0 && (
                      <Button
                        onClick={exportBehaviors}
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-50 bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {behaviors.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto text-teal-400 mb-4" />
                      <h3 className="text-xl font-semibold text-teal-900 mb-2">No Behaviors Logged Yet</h3>
                      <p className="text-teal-700 mb-4">
                        {students.length === 0
                          ? "Register students first, then start logging their behaviors."
                          : "Start tracking student behaviors to see insights and patterns."}
                      </p>
                      {students.length > 0 && (
                        <Button
                          onClick={() => setShowAddForm(true)}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Log First Behavior
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-teal-50">
                          <TableRow>
                            <TableHead className="text-teal-800">Date & Time</TableHead>
                            <TableHead className="text-teal-800">Student</TableHead>
                            <TableHead className="text-teal-800">Behavior</TableHead>
                            <TableHead className="text-teal-800">Subject</TableHead>
                            <TableHead className="text-teal-800">Severity</TableHead>
                            <TableHead className="text-teal-800">Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {behaviors.map((behavior) => (
                            <TableRow key={behavior.id} className="hover:bg-teal-50/50">
                              <TableCell>
                                <div className="text-sm">
                                  <div className="font-medium text-teal-900">
                                    {new Date(behavior.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="text-teal-600">
                                    {new Date(behavior.createdAt).toLocaleTimeString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-teal-900">{behavior.student}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getBehaviorTypeColor(behavior.behaviorType)}>
                                  {behavior.behaviorType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="text-teal-700">{behavior.subject}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getSeverityColor(behavior.severity)}>{behavior.severity}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <p className="text-sm text-teal-700 truncate" title={behavior.description}>
                                    {behavior.description}
                                  </p>
                                  {behavior.outcome && (
                                    <p className="text-xs text-teal-600 mt-1 truncate" title={behavior.outcome}>
                                      Action: {behavior.outcome}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add">
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Log New Behavior
                  </CardTitle>
                  <CardDescription className="text-teal-700">
                    Record a new student behavior incident or positive action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BehaviorForm students={students} onSubmit={handleAddBehavior} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center py-8 border-t border-teal-200 bg-teal-50/50">
          <p className="text-teal-600 text-sm">© 2025 TabiaZetu. All rights reserved.</p>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default BehaviorLog;
