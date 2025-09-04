import { useState, useEffect, useMemo, useCallback } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts"
import { BarChart3, Download, TrendingUp, AlertTriangle, FileText, Award, Clock, Users, Shield } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { API_BASE_URL } from "../utils/api"
import jsPDF from "jspdf"
import "jspdf-autotable"

const Reports = () => {
  const { user } = useAuth()
  const [behaviors, setBehaviors] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedStudent, setSelectedStudent] = useState("all")
  const [message, setMessage] = useState("")

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (user?.role === "admin") {
          setMessage("Loading admin reports...");
        }
        await loadData()
      } catch (error) {
        console.error("Failed to initialize reports data:", error)
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
        
        let behaviorsResponse, studentsResponse;
        
        // Use admin endpoint if user is admin, otherwise use regular endpoints
        if (user?.role === "admin") {
          const adminReportsResponse = await fetch(`${apiUrl}/admin/reports`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          
          if (adminReportsResponse.ok) {
            const adminData = await adminReportsResponse.json();
            
            // Normalize admin behaviors data to match the expected structure
            const normalizedAdminBehaviors = (adminData.recentBehaviors || []).map((b) => {
              const studentId = (b.student && b.student._id) ? b.student._id : b.student;
              const studentName = (b.student && b.student.name) ? b.student.name : 'Unknown Student';
              const createdAt = b.date || b.createdAt || new Date().toISOString();
              return { 
                ...b, 
                studentId, 
                studentName, 
                createdAt,
                // Ensure behaviorType exists for filtering
                behaviorType: b.behaviorType || 'unknown'
              };
            });
            
            setBehaviors(normalizedAdminBehaviors);
            setStudents([]); // Admin reports don't need individual student list for charts
            setMessage("Admin reports loaded successfully! Viewing system-wide data.");
            setIsLoading(false);
            return; // Exit early for admin users
          } else {
            console.log("Admin reports not available, falling back to regular endpoints");
            // Fall back to regular endpoints if admin reports fail
            [behaviorsResponse, studentsResponse] = await Promise.all([
              fetch(`${apiUrl}/behaviors`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              }),
              fetch(`${apiUrl}/students`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              }),
            ]);
            
            if (behaviorsResponse.ok && studentsResponse.ok) {
              const behaviorsRaw = await behaviorsResponse.json()
              const studentsRaw = await studentsResponse.json()

              const studentsArr = Array.isArray(studentsRaw) ? studentsRaw : []
              const studentMap = new Map(studentsArr.map((s) => [s._id || s.id, s.name]))

              const normalizedBehaviors = (Array.isArray(behaviorsRaw) ? behaviorsRaw : []).map((b) => {
                const studentId = (b.student && b.student._id)
                  ? b.student._id
                  : (typeof b.student === "string" ? b.student : b.student)
                const studentName = (b.student && b.student.name)
                  ? b.student.name
                  : (studentMap.get(studentId) || studentId)
                const createdAt = b.date || b.createdAt || new Date().toISOString()
                return { ...b, studentId, studentName, createdAt }
              })

              setBehaviors(normalizedBehaviors)
              setStudents(studentsArr)
            } else {
              throw new Error("Backend not available")
            }
          }
        } else {
          // Regular teacher endpoints
          [behaviorsResponse, studentsResponse] = await Promise.all([
            fetch(`${apiUrl}/behaviors`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }),
            fetch(`${apiUrl}/students`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }),
          ]);

          if (behaviorsResponse.ok && studentsResponse.ok) {
            const behaviorsRaw = await behaviorsResponse.json()
            const studentsRaw = await studentsResponse.json()

            const studentsArr = Array.isArray(studentsRaw) ? studentsRaw : []
            const studentMap = new Map(studentsArr.map((s) => [s._id || s.id, s.name]))

            const normalizedBehaviors = (Array.isArray(behaviorsRaw) ? behaviorsRaw : []).map((b) => {
              const studentId = (b.student && b.student._id)
                ? b.student._id
                : (typeof b.student === "string" ? b.student : b.student)
              const studentName = (b.student && b.student.name)
                ? b.student.name
                : (studentMap.get(studentId) || studentId)
              const createdAt = b.date || b.createdAt || new Date().toISOString()
              return { ...b, studentId, studentName, createdAt }
            })

            setBehaviors(normalizedBehaviors)
            setStudents(studentsArr)
          } else {
            throw new Error("Backend not available")
          }
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

  // Filter behaviors based on selected period and student
  const getFilteredBehaviors = useCallback(() => {
    let filtered = [...behaviors]

    // Filter by student
    if (selectedStudent !== "all") {
      filtered = filtered.filter((b) => b.studentId === selectedStudent)
    }

    // Filter by time period
    const now = new Date()
    let startDate

    switch (selectedPeriod) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    filtered = filtered.filter((b) => {
      if (!b || !b.createdAt) return false
      try {
        const behaviorDate = new Date(b.createdAt)
        return behaviorDate >= startDate && !isNaN(behaviorDate.getTime())
      } catch (error) {
        console.error("Error parsing behavior date:", error)
        return false
      }
    })

    return filtered
  }, [behaviors, selectedStudent, selectedPeriod])

  const filteredBehaviors = useMemo(() => getFilteredBehaviors(), [getFilteredBehaviors])

  // Generate chart data grouped by month
  const getBehaviorTrendsData = useCallback(() => {
    const monthlyMap = new Map()

    filteredBehaviors.forEach((behavior) => {
      if (!behavior || !behavior.createdAt || !behavior.behaviorType) return
      try {
        const d = new Date(behavior.createdAt)
        if (isNaN(d.getTime())) return
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        const dateMonth = d.toLocaleDateString("en-GB", { month: "short" })
        const monthYear = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            monthKey,
            dateMonth,
            monthYear,
            positive: 0,
            negative: 0,
            total: 0,
          })
        }

        const bucket = monthlyMap.get(monthKey)
        bucket.total += 1
        if ([
          "excellent_work",
          "class_participation",
          "helping_others",
          "leadership",
          "creativity",
          "respectful",
          "organized",
          "teamwork",
        ].includes(behavior.behaviorType)) {
          bucket.positive += 1
        } else {
          bucket.negative += 1
        }
      } catch (error) {
        console.error("Error processing behavior for monthly trends:", error)
      }
    })

    return Array.from(monthlyMap.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([, v]) => v)
  }, [filteredBehaviors])

  const getBehaviorBySubjectData = useCallback(() => {
    const subjectData = {}

    filteredBehaviors.forEach((behavior) => {
      if (!behavior || !behavior.behaviorType) return
      
      const subjectKey = behavior.subject || "Unknown"
      if (!subjectData[subjectKey]) {
        subjectData[subjectKey] = { subject: subjectKey, positive: 0, negative: 0, total: 0 }
      }

      subjectData[subjectKey].total++
      if (["excellent_work", "class_participation", "helping_others", "leadership", "creativity", "respectful", "organized", "teamwork"].includes(behavior.behaviorType)) {
        subjectData[subjectKey].positive++
      } else {
        subjectData[subjectKey].negative++
      }
    })

    return Object.values(subjectData).sort((a, b) => b.total - a.total)
  }, [filteredBehaviors])

  const getBehaviorTypeData = useCallback(() => {
    const typeData = {}

    filteredBehaviors.forEach((behavior) => {
      if (!behavior || !behavior.behaviorType) return
      
      if (!typeData[behavior.behaviorType]) {
        typeData[behavior.behaviorType] = { name: behavior.behaviorType, value: 0 }
      }
      typeData[behavior.behaviorType].value++
    })

    return Object.values(typeData)
  }, [filteredBehaviors])

  const getTimeOfDayData = useCallback(() => {
    const timeData = {}

    filteredBehaviors.forEach((behavior) => {
      if (!behavior) return
      
      const timeOfDay = behavior.timeOfDay || "Unknown"
      if (!timeData[timeOfDay]) {
        timeData[timeOfDay] = { time: timeOfDay, count: 0 }
      }
      timeData[timeOfDay].count++
    })

    return Object.values(timeData)
  }, [filteredBehaviors])

  // Custom legend with rounded color markers matching theme
  const TrendsLegend = () => (
    <div className="flex items-center justify-center gap-6 mt-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#10b981' }}></span>
        <span className="text-teal-800">Positive Behaviors</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></span>
        <span className="text-teal-800">Negative Behaviors</span>
      </div>
    </div>
  )

  // Calculate summary statistics
  const getSummaryStats = useCallback(() => {
    const total = filteredBehaviors.length
    const positive = filteredBehaviors.filter((b) =>
      b && b.behaviorType && ["excellent_work", "class_participation", "helping_others", "leadership", "creativity", "respectful", "organized", "teamwork"].includes(b.behaviorType),
    ).length
    const negative = filteredBehaviors.filter((b) =>
      b && b.behaviorType && ["disruptive", "aggressive", "late"].includes(b.behaviorType),
    ).length
    const studentsWithBehaviors = new Set(filteredBehaviors.filter(b => b && b.studentId).map((b) => b.studentId)).size

    return {
      total,
      positive,
      negative,
      studentsWithBehaviors,
      positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
    }
  }, [filteredBehaviors])

  const summaryStats = useMemo(() => getSummaryStats(), [getSummaryStats])

  // Export functions
  const exportToCSV = () => {
    const csvData = [
      ["Date", "Student", "Behavior Type", "Subject", "Time of Day", "Severity", "Description"],
      ...filteredBehaviors.filter(behavior => behavior && behavior.createdAt).map((behavior) => [
        behavior.createdAt ? new Date(behavior.createdAt).toLocaleDateString() : 'No date',
        behavior.studentName || behavior.studentId || 'Unknown Student',
        behavior.behaviorType || 'Unknown',
        behavior.subject || "",
        behavior.timeOfDay || "",
        behavior.severity || "",
        behavior.notes || behavior.description || "",
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `behavior-report-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setMessage("CSV report exported successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const exportToPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" })

    // Header
    doc.setFontSize(20)
    doc.text("TabiaZetu Behavior Report", 40, 40)

    doc.setFontSize(12)
    doc.text(`Teacher: ${user?.firstName || ""} ${user?.lastName || ""}`, 40, 65)
    doc.text(`School: ${user?.school || ""}`, 40, 80)
    doc.text(`Period: ${selectedPeriod}`, 40, 95)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 40, 110)

    // Summary Statistics
    doc.setFontSize(16)
    doc.text("Summary Statistics", 40, 140)

    doc.setFontSize(12)
    const y0 = 160
    doc.text(`Total Behaviors: ${summaryStats.total}`, 40, y0)
    doc.text(`Positive Behaviors: ${summaryStats.positive}`, 40, y0 + 15)
    doc.text(`Negative Behaviors: ${summaryStats.negative}`, 40, y0 + 30)
    doc.text(`Students Tracked: ${summaryStats.studentsWithBehaviors}`, 40, y0 + 45)
    doc.text(`Positive Rate: ${summaryStats.positiveRate}%`, 40, y0 + 60)

    // Behavior Details Table
    if (filteredBehaviors.length > 0) {
      const tableData = filteredBehaviors.filter(behavior => behavior && behavior.createdAt).slice(0, 200).map((behavior) => [
        behavior.createdAt ? new Date(behavior.createdAt).toLocaleDateString() : 'No date',
        behavior.studentName || behavior.studentId || 'Unknown Student',
        behavior.behaviorType || 'Unknown',
        behavior.subject || "",
        behavior.severity || "",
      ])

      doc.autoTable({
        head: [["Date", "Student", "Type", "Subject", "Severity"]],
        body: tableData,
        startY: y0 + 90,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [20, 184, 166] },
        theme: "grid",
      })
    }

    doc.save(`behavior-report-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.pdf`)

    setMessage("PDF report exported successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300">Loading reports...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 rounded-2xl p-6 text-white shadow-lg transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Behavior Reports & Analytics</h1>
                  <p className="text-teal-100 dark:text-teal-200 text-lg">Comprehensive insights into classroom behavior patterns</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{summaryStats.total}</div>
                <div className="text-teal-200 dark:text-teal-300">Total Behaviors</div>
              </div>
            </div>
          </div>

          {message && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600 transition-colors duration-200">
              <FileText className="h-4 w-4" />
              <AlertDescription className="text-green-700 dark:text-green-300">{message}</AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-teal-900 dark:text-teal-100">Report Filters & Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-teal-800 dark:text-teal-200 font-medium">Period:</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32 border-teal-300 dark:border-teal-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-teal-800 dark:text-teal-200 font-medium">Student:</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-48 border-teal-300 dark:border-teal-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student._id || student.id} value={student._id || student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Behaviors</p>
                    <p className="text-3xl font-bold">{summaryStats.total}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Positive Behaviors</p>
                    <p className="text-3xl font-bold">{summaryStats.positive}</p>
                  </div>
                  <Award className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Negative Behaviors</p>
                    <p className="text-3xl font-bold">{summaryStats.negative}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Students Involved</p>
                    <p className="text-3xl font-bold">{summaryStats.studentsWithBehaviors}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin-specific System Overview */}
          {user?.role === "admin" && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Overview (Admin View)
                </CardTitle>
                <CardDescription className="text-teal-700 dark:text-teal-300">
                  Comprehensive statistics across all schools and teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200 dark:border-indigo-700 transition-colors duration-200">
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                      {behaviors.length > 0 ? behaviors.length : "Loading..."}
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm">Recent Behaviors</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-700 transition-colors duration-200">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {behaviors.filter(b => b && b.behaviorType && ["excellent_work", "class_participation", "helping_others", "leadership", "creativity", "respectful", "organized", "teamwork"].includes(b.behaviorType)).length}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-sm">Positive Behaviors</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-700 transition-colors duration-200">
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                      {behaviors.filter(b => b && b.behaviorType && !["excellent_work", "class_participation", "helping_others", "leadership", "creativity", "respectful", "organized", "teamwork"].includes(b.behaviorType)).length}
                    </div>
                    <div className="text-amber-600 dark:text-amber-400 text-sm">Challenging Behaviors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts */}
          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 dark:bg-gray-800/80 border border-teal-200 dark:border-gray-600 transition-colors duration-200">
              <TabsTrigger value="trends" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Behavior Trends
              </TabsTrigger>
              <TabsTrigger value="subjects" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                By Subject
              </TabsTrigger>
              <TabsTrigger value="types" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Behavior Types
              </TabsTrigger>
              <TabsTrigger value="time" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Time Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card className="bg-white/90 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900 text-xl md:text-2xl">Behavior Trends Over Time — Positive vs Negative</CardTitle>
                  <CardDescription className="text-teal-700">
                    Monthly totals showing how positive and negative behaviors evolve over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getBehaviorTrendsData()}
                        barCategoryGap="28%"
                        barGap={14}
                        barSize={36}
                        margin={{ bottom: 64, left: 16, right: 16, top: 8 }}
                      >
                        <defs>
                          <linearGradient id="gradientPositive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.5} />
                          </linearGradient>
                          <linearGradient id="gradientNegative" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.5} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2f5f3" vertical={false} />
                        <XAxis
                          dataKey="dateMonth"
                          stroke="#0f766e"
                          tickMargin={10}
                          interval="preserveStartEnd"
                          minTickGap={18}
                          height={36}
                          tick={{ fontSize: 12, fill: '#0f766e' }}
                          axisLine={false}
                          tickLine={false}
                          label={{ value: "Month", position: "insideBottom", offset: -10, style: { fill: "#0f766e" } }}
                        />
                        <YAxis
                          stroke="#0f766e"
                          allowDecimals={false}
                          domain={[0, 'dataMax + 1']}
                          axisLine={false}
                          tickLine={false}
                          width={44}
                          label={{ value: "Behavior Count", angle: -90, position: "insideLeft", offset: 10, style: { fill: "#0f766e" } }}
                        />
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          labelFormatter={(_, payload) => {
                            if (!payload || !payload[0] || !payload[0].payload) return ''
                            const p = payload[0].payload
                            return p.monthYear || p.fullDate || ''
                          }}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #14b8a6",
                            borderRadius: "10px",
                            fontSize: 12,
                          }}
                        />
                        {/* Custom legend for modern look */}
                        <Legend verticalAlign="bottom" height={36} align="center" content={<TrendsLegend />} />
                        <Bar dataKey="positive" name="Positive Behaviors" fill="url(#gradientPositive)" radius={[6,6,0,0]} />
                        <Bar dataKey="negative" name="Negative Behaviors" fill="url(#gradientNegative)" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects">
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900">Behaviors by Subject</CardTitle>
                  <CardDescription className="text-teal-700">
                    Compare behavior patterns across different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getBehaviorBySubjectData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2f1" />
                        <XAxis dataKey="subject" stroke="#0f766e" angle={-45} textAnchor="end" height={100} />
                        <YAxis stroke="#0f766e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #14b8a6",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="positive" fill="#10b981" name="Positive" />
                        <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types">
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900">Behavior Type Distribution</CardTitle>
                  <CardDescription className="text-teal-700">
                    Breakdown of different behavior types recorded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getBehaviorTypeData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getBehaviorTypeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time">
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900">Behaviors by Time of Day</CardTitle>
                  <CardDescription className="text-teal-700">
                    When do most behaviors occur during the school day?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getTimeOfDayData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2f1" />
                        <XAxis dataKey="time" stroke="#0f766e" />
                        <YAxis stroke="#0f766e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #14b8a6",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="#14b8a6" name="Behavior Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Activity */}
          {filteredBehaviors.length > 0 && (
            <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-teal-700 dark:text-teal-300">
                  Latest behavior logs from the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBehaviors.slice(0, 5).map((behavior, index) => {
                    if (!behavior) return null
                    
                    return (
                      <div key={behavior.id || `recent-${index}`} className="flex items-center justify-between p-3 bg-teal-50 dark:bg-slate-700/50 rounded-lg transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={
                              behavior.behaviorType && ["excellent_work", "class_participation", "helping_others", "leadership", "creativity", "respectful", "organized", "teamwork"].includes(behavior.behaviorType)
                              ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200"
                          }
                        >
                            {behavior.behaviorType || 'unknown'}
                        </Badge>
                          <span className="font-medium text-teal-900 dark:text-slate-200">{behavior.studentName || behavior.studentId || 'Unknown Student'}</span>
                          <span className="text-teal-700 dark:text-slate-300">in {behavior.subject || 'No subject'}</span>
                        </div>
                        <div className="text-sm text-teal-600 dark:text-slate-400">
                          {behavior.createdAt ? new Date(behavior.createdAt).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {filteredBehaviors.length === 0 && (
            <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-teal-400 mb-4" />
                <h3 className="text-xl font-semibold text-teal-900 dark:text-teal-100 mb-2">No Data Available</h3>
                <p className="text-teal-700 dark:text-teal-300 mb-4">No behavior data found for the selected period and filters.</p>
                <Button
                  onClick={() => {
                    setSelectedPeriod("year")
                    setSelectedStudent("all")
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-teal-200 dark:border-teal-600 transition-colors duration-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-700 rounded-full flex items-center justify-center transition-colors duration-200">
                <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-lg font-semibold text-teal-800 dark:text-teal-200">TabiaZetu</span>
            </div>
            <p className="text-sm text-teal-600 dark:text-teal-300 mb-2">Track. Understand. Improve.</p>
            <p className="text-xs text-teal-500 dark:text-teal-400">© 2025 TabiaZetu. All rights reserved.</p>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default Reports;
