import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Plus, Clock, Download, CheckCircle, Users, Calendar, RefreshCw } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import BehaviorForm from "../components/BehaviorForm"
import DashboardSidebar from "../components/DashboardSidebar"
import AIBehaviorInsights from "../components/AIBehaviorInsights"
import BehaviorPredictor from "../components/BehaviorPredictor"
import AIAnalysisSummary from "../components/AIAnalysisSummary"
import SmartSuggestions from "../components/SmartSuggestions"
import QuickActions from "../components/QuickActions"
import AIDashboardStatus from "../components/AIDashboardStatus"
import AIDataDashboard from "../components/AIDataDashboard"

const BehaviorLog = () => {
  const { user } = useAuth()
  const [behaviors, setBehaviors] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [message, setMessage] = useState("")
  const [todayBehaviors, setTodayBehaviors] = useState([])
  const [weekBehaviors, setWeekBehaviors] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [aiPredictions, setAiPredictions] = useState([])
  const [currentBehavior, setCurrentBehavior] = useState(null)

  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadData()
        await loadAIData() // Load AI-related data
      } catch (error) {
        console.error("Failed to initialize data:", error)
      }
    }
    
    initializeData()
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
          
          // Create a proper student map for quick lookup
          const studentMap = new Map()
          if (Array.isArray(studentsData)) {
            studentsData.forEach(student => {
              if (student._id) {
                studentMap.set(student._id.toString(), student.name)
              }
            })
          }
          
          // Normalize behaviors with proper student names
          const normalizedBehaviors = (Array.isArray(behaviorsData) ? behaviorsData : []).map((b) => {
            let studentName = "Unknown Student"
            
            // Try different ways to get student name
            if (b.student && typeof b.student === 'object' && b.student.name) {
              studentName = b.student.name
            } else if (b.student && typeof b.student === 'string') {
              studentName = studentMap.get(b.student) || b.student
            } else if (b.studentId) {
              studentName = studentMap.get(b.studentId.toString()) || "Unknown Student"
            }
            
            // Ensure we have a proper date field
            const behaviorWithDate = {
              ...b,
              studentDisplayName: studentName,
              studentId: b.student?._id || b.student || b.studentId,
              // Ensure date field exists - use date if available, otherwise createdAt
              date: b.date || b.createdAt || new Date().toISOString()
            }
            
            return behaviorWithDate
          })
          
          setBehaviors(normalizedBehaviors)
          setStudents(Array.isArray(studentsData) ? studentsData : [])
        } else {
          throw new Error("Backend not available")
        }
      } catch (backendError) {
        console.log("Using localStorage data due to backend error:", backendError.message)
        // Load from localStorage
        const storedBehaviors = JSON.parse(localStorage.getItem("behaviors") || "[]")
        const storedStudents = JSON.parse(localStorage.getItem("students") || "[]")

        // Normalize localStorage behaviors too
        const studentMap = new Map()
        if (Array.isArray(storedStudents)) {
          storedStudents.forEach(student => {
            if (student._id) {
              studentMap.set(student._id.toString(), student.name)
            }
          })
        }

        const normalizedStoredBehaviors = storedBehaviors.map(b => {
          // Ensure we have a proper date field for localStorage data too
          const behaviorWithDate = {
            ...b,
            studentDisplayName: studentMap.get(b.studentId?.toString()) || b.studentDisplayName || "Unknown Student",
            // Ensure date field exists - use date if available, otherwise createdAt, or fallback to current time
            date: b.date || b.createdAt || new Date().toISOString()
          }
          
          return behaviorWithDate
        })

        setBehaviors(normalizedStoredBehaviors)
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

  const loadAIData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('No authentication token found, AI data will not be loaded')
        return
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      
      // Load AI insights
      try {
        const insightsResponse = await fetch(`${apiUrl}/ai-insights`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json()
          setAiInsights(insightsData.insights || [])
          console.log('✅ AI insights loaded from database:', insightsData.insights?.length || 0)
        }
      } catch (error) {
        console.error('❌ Failed to load AI insights:', error)
      }

      // Load behavior predictions
      try {
        const predictionsResponse = await fetch(`${apiUrl}/behavior-predictions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (predictionsResponse.ok) {
          const predictionsData = await predictionsResponse.json()
          setAiPredictions(predictionsData.predictions || [])
          console.log('✅ Behavior predictions loaded from database:', predictionsData.predictions?.length || 0)
        }
      } catch (error) {
        console.error('❌ Failed to load behavior predictions:', error)
      }

      // Load teacher actions
      try {
        const actionsResponse = await fetch(`${apiUrl}/teacher-actions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (actionsResponse.ok) {
          const actionsData = await actionsResponse.json()
          // You can add a state for teacher actions if needed
          console.log('✅ Teacher actions loaded from database:', actionsData.actions?.length || 0)
        }
      } catch (error) {
        console.error('❌ Failed to load teacher actions:', error)
      }
    } catch (error) {
      console.error('❌ Error loading AI data:', error)
    }
  }

  const handleAddBehavior = async (behaviorData) => {
    try {
      setIsSubmitting(true)
      
      // Try to save to backend first
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token")
        }

        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        const response = await fetch(`${apiUrl}/behaviors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(behaviorData),
        })

        if (response.ok) {
          const savedBehavior = await response.json()
          console.log("✅ Behavior saved to backend:", savedBehavior)
          
          // Refresh the behaviors list
          await loadData()
          
          // Refresh AI data to include the new behavior
          await loadAIData()
          
          // Show success message
          toast.success("Behavior log added successfully!")
          
          // Reset form
          setShowForm(false)
          return
        } else {
          throw new Error(`Backend error: ${response.status}`)
        }
      } catch (backendError) {
        console.log("Backend save failed, using localStorage:", backendError.message)
        
        // Fallback to localStorage
        const newBehavior = {
          id: Date.now().toString(),
          ...behaviorData,
          createdAt: new Date().toISOString(),
        }
        
        const updatedBehaviors = [newBehavior, ...behaviors]
        setBehaviors(updatedBehaviors)
        localStorage.setItem("behaviors", JSON.stringify(updatedBehaviors))
        
        // Refresh AI data even for localStorage data
        await loadAIData()
        
        toast.success("Behavior log added to local storage")
        setShowForm(false)
      }
    } catch (error) {
      console.error("Error adding behavior:", error)
      toast.error("Failed to add behavior log. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBehaviorTypeColor = (type) => {
    const colors = {
      // Positive behaviors - green shades
      excellent_work: "bg-green-100 text-green-800 border-green-200",
      class_participation: "bg-green-100 text-green-800 border-green-200",
      helping_others: "bg-green-100 text-green-800 border-green-200",
      leadership: "bg-green-100 text-green-800 border-green-200",
      creativity: "bg-green-100 text-green-800 border-green-200",
      respectful: "bg-green-100 text-green-800 border-green-200",
      organized: "bg-green-100 text-green-800 border-green-200",
      teamwork: "bg-green-100 text-green-800 border-green-200",
      
      // Neutral behaviors - blue shades
      late_to_class: "bg-blue-100 text-blue-800 border-blue-200",
      absent: "bg-blue-100 text-blue-800 border-blue-200",
      incomplete_work: "bg-blue-100 text-blue-800 border-blue-200",
      
      // Negative behaviors - red/orange shades
      talking_in_class: "bg-yellow-100 text-yellow-800 border-yellow-200",
      not_listening: "bg-yellow-100 text-yellow-800 border-yellow-200",
      disrupting_class: "bg-orange-100 text-orange-800 border-orange-200",
      using_phone: "bg-orange-100 text-orange-800 border-orange-200",
      fighting: "bg-red-100 text-red-800 border-red-200",
      bullying: "bg-red-100 text-red-800 border-red-200",
      
      // Fallback
      other: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[type] || colors.other
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-yellow-100 text-yellow-800 border-yellow-200",
      medium: "bg-orange-100 text-orange-800 border-orange-200",
      high: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[severity] || colors.low
  }

  // Calculate today's and this week's behaviors whenever behaviors change
  useEffect(() => {
    if (behaviors.length > 0) {
      const today = new Date()
      const todayString = today.toDateString()
      
      console.log("🔍 [BehaviorLog] Today's date:", todayString)
      console.log("🔍 [BehaviorLog] All behaviors:", behaviors.map(b => ({
        id: b._id,
        date: b.date,
        createdAt: b.createdAt,
        studentName: b.studentDisplayName || "Unknown"
      })))

      const todayBehaviorsList = behaviors.filter(behavior => {
        if (!behavior.date && !behavior.createdAt) {
          console.log("🔍 [BehaviorLog] Behavior has no date:", behavior)
          return false
        }
        
        try {
          // Try both date and createdAt fields
          let behaviorDate
          if (behavior.date) {
            behaviorDate = new Date(behavior.date)
          } else if (behavior.createdAt) {
            behaviorDate = new Date(behavior.createdAt)
          } else {
            return false
          }
          
          // Use toDateString() for date-only comparison (ignoring time)
          const behaviorDateString = behaviorDate.toDateString()
          const isToday = behaviorDateString === todayString
          
          console.log("🔍 [BehaviorLog] Behavior date check:", {
            behaviorId: behavior._id,
            originalDate: behavior.date || behavior.createdAt,
            parsedDate: behaviorDateString,
            isToday: isToday,
            student: behavior.studentDisplayName || "Unknown"
          })
          
          return isToday
        } catch (error) {
          console.error("🔍 [BehaviorLog] Error parsing behavior date:", error, behavior)
          return false
        }
      })

      const weekBehaviorsList = behaviors.filter(behavior => {
        if (!behavior.date && !behavior.createdAt) return false
        try {
          let behaviorDate
          if (behavior.date) {
            behaviorDate = new Date(behavior.date)
          } else if (behavior.createdAt) {
            behaviorDate = new Date(behavior.createdAt)
          } else {
            return false
          }
          
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return behaviorDate >= weekAgo
        } catch (error) {
          console.error("Error parsing behavior date:", error, behavior)
          return false
        }
      })

      // Debug logging for date calculations
      console.log("🔍 [BehaviorLog] Date calculations:", {
        today: todayString,
        totalBehaviors: behaviors.length,
        todayBehaviors: todayBehaviorsList.length,
        weekBehaviors: weekBehaviorsList.length,
        todayBehaviorsDetails: todayBehaviorsList.map(b => ({
          id: b._id,
          date: b.date || b.createdAt,
          student: b.studentDisplayName || "Unknown"
        }))
      })

      setTodayBehaviors(todayBehaviorsList)
      setWeekBehaviors(weekBehaviorsList)
    }
  }, [behaviors])

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 rounded-2xl p-6 text-white shadow-lg transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 dark:bg-teal-700/50 rounded-2xl flex items-center justify-center transition-colors duration-200">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Behavior Log</h1>
                  <p className="text-teal-100 dark:text-teal-200 text-lg">Track and manage student behaviors in real-time</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{behaviors.length}</div>
                <div className="text-teal-200 dark:text-teal-300">Total Logs</div>
              </div>
            </div>
          </div>

          {message && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600 transition-colors duration-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700 dark:text-green-300">{message}</AlertDescription>
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
                    <p className="text-green-100">Today's Logs</p>
                    <p className="text-3xl font-bold">{todayBehaviors.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">This Week</p>
                    <p className="text-3xl font-bold">{weekBehaviors.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Summary */}
          <AIAnalysisSummary 
            behaviors={behaviors} 
            students={students} 
            insights={aiInsights} 
            predictions={aiPredictions} 
          />

          {/* AI Data Sync Controls */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-900 font-medium">AI Data Synchronization</span>
                </div>
                <Button 
                  onClick={loadAIData}
                  variant="outline" 
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync AI Data
                </Button>
              </div>
              <p className="text-blue-700 text-sm mt-2">
                Last sync: {new Date().toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <QuickActions 
            insights={aiInsights}
            predictions={aiPredictions}
            behaviors={behaviors}
            students={students}
          />

          {/* AI Dashboard Status */}
          <AIDashboardStatus 
            behaviors={behaviors}
            students={students}
            insights={aiInsights}
            predictions={aiPredictions}
          />

          {/* AI Data Dashboard */}
          <AIDataDashboard />

          {/* AI Behavior Insights */}
          <AIBehaviorInsights 
            behaviors={behaviors} 
            students={students} 
            onInsightsGenerated={setAiInsights}
          />

          {/* Behavior Predictor */}
          <BehaviorPredictor 
            behaviors={behaviors} 
            students={students} 
            onPredictionsGenerated={setAiPredictions}
          />

          {/* Main Content Area */}
                      <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-teal-900 dark:text-teal-100">Behavior Management</CardTitle>
                  <CardDescription className="text-teal-700 dark:text-teal-300 mt-1">
                    View existing logs and add new behavior records
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <Tabs defaultValue="view" className="w-full">
              <div className="px-6 mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-teal-800 border border-teal-200 dark:border-teal-600 p-1 rounded-lg transition-colors duration-200">
                  <TabsTrigger 
                    value="view" 
                    className="text-teal-700 data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-200 ease-in-out rounded-md font-medium py-2 px-3 hover:bg-teal-50 hover:text-teal-800 h-9 flex items-center justify-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 flex-shrink-0" />
                      <span>View Logs</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="add" 
                    className="text-teal-700 data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-200 ease-in-out rounded-md font-medium py-2 px-3 hover:bg-teal-50 hover:text-teal-800 h-9 flex items-center justify-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 flex-shrink-0" />
                      <span>Add New</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="view">
                <div className="px-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-teal-900 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Behavior Logs
                    </h3>
                    <p className="text-teal-700 mt-1">
                      Monitor and review student behavior patterns
                    </p>
                  </div>
                  <div>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                        <p className="text-teal-600 mt-2">Loading behaviors...</p>
                      </div>
                    ) : behaviors.length === 0 ? (
                      <div className="text-center py-8 text-teal-600">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-teal-400" />
                        <p className="text-lg font-semibold">No behaviors logged yet</p>
                        <p className="text-sm">Start by adding your first behavior log</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-teal-50">
                              <TableHead className="text-teal-900">Student</TableHead>
                              <TableHead className="text-teal-900">Date</TableHead>
                              <TableHead className="text-teal-900">Type</TableHead>
                              <TableHead className="text-teal-900">Subject</TableHead>
                              <TableHead className="text-teal-900">Time</TableHead>
                              <TableHead className="text-teal-900">Severity</TableHead>
                              <TableHead className="text-teal-900">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {behaviors.map((behavior, index) => {
                              // Get student name with fallbacks
                              const studentName = behavior.studentDisplayName || 
                                                (behavior.student && typeof behavior.student === 'object' ? behavior.student.name : behavior.student) || 
                                                "Unknown Student"
                              
                              const behaviorDate = behavior.date ? new Date(behavior.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }) : "No date"
                              
                              return (
                                <TableRow key={behavior._id || index} className="hover:bg-teal-50/50">
                                  <TableCell className="font-medium text-teal-900">{studentName}</TableCell>
                                  <TableCell className="text-teal-700">{behaviorDate}</TableCell>
                                  <TableCell>
                                    <Badge className={getBehaviorTypeColor(behavior.behaviorType || 'other')}>
                                      {(behavior.behaviorType || 'other').replace(/_/g, ' ')}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-teal-700">{behavior.subject || 'No subject'}</TableCell>
                                  <TableCell className="text-teal-700">{behavior.timeOfDay || 'No time'}</TableCell>
                                  <TableCell>
                                    <Badge className={getSeverityColor(behavior.severity || 'low')}>{behavior.severity || 'low'}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-xs">
                                      <p className="text-sm text-teal-700 truncate" title={behavior.notes || 'No description'}>
                                        {behavior.notes || 'No description'}
                                      </p>
                                      {behavior.outcome && (
                                        <p className="text-xs text-teal-600 mt-1 truncate" title={behavior.outcome}>
                                          Action: {behavior.outcome}
                                        </p>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="add">
                <div className="px-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-teal-900 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Log New Behavior
                    </h3>
                    <p className="text-teal-700 mt-1">
                      Record a new student behavior incident or positive action
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <BehaviorForm 
                        students={students} 
                        onSubmit={handleAddBehavior}
                        onFormChange={setCurrentBehavior}
                      />
                    </div>
                    <div>
                      <SmartSuggestions 
                        currentBehavior={currentBehavior}
                        behaviors={behaviors}
                        students={students}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-teal-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-lg font-semibold text-teal-800">TabiaZetu</span>
            </div>
            <p className="text-sm text-teal-600 mb-2">Track. Understand. Improve.</p>
            <p className="text-xs text-teal-500">© 2025 TabiaZetu. All rights reserved.</p>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default BehaviorLog




