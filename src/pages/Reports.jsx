"use client"

import { useState, useEffect } from "react"
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BarChart3, Download, TrendingUp, AlertTriangle, FileText, Award, Clock } from "lucide-react"
import { useAuth } from "../context/AuthContext"
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

  // Filter behaviors based on selected period and student
  const getFilteredBehaviors = () => {
    let filtered = [...behaviors]

    // Filter by student
    if (selectedStudent !== "all") {
      filtered = filtered.filter((b) => b.student === selectedStudent)
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

    filtered = filtered.filter((b) => new Date(b.createdAt) >= startDate)

    return filtered
  }

  const filteredBehaviors = getFilteredBehaviors()

  // Generate chart data
  const getBehaviorTrendsData = () => {
    const data = {}
    const daysToShow = selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 90

    // Initialize data for each day
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      data[dateKey] = {
        date: date.toLocaleDateString(),
        positive: 0,
        negative: 0,
        total: 0,
      }
    }

    // Count behaviors by date
    filteredBehaviors.forEach((behavior) => {
      const behaviorDate = new Date(behavior.createdAt).toISOString().split("T")[0]
      if (data[behaviorDate]) {
        data[behaviorDate].total++
        if (["positive", "participation", "helpful"].includes(behavior.behaviorType)) {
          data[behaviorDate].positive++
        } else {
          data[behaviorDate].negative++
        }
      }
    })

    return Object.values(data)
  }

  const getBehaviorBySubjectData = () => {
    const subjectData = {}

    filteredBehaviors.forEach((behavior) => {
      if (!subjectData[behavior.subject]) {
        subjectData[behavior.subject] = { subject: behavior.subject, positive: 0, negative: 0, total: 0 }
      }

      subjectData[behavior.subject].total++
      if (["positive", "participation", "helpful"].includes(behavior.behaviorType)) {
        subjectData[behavior.subject].positive++
      } else {
        subjectData[behavior.subject].negative++
      }
    })

    return Object.values(subjectData).sort((a, b) => b.total - a.total)
  }

  const getBehaviorTypeData = () => {
    const typeData = {}

    filteredBehaviors.forEach((behavior) => {
      if (!typeData[behavior.behaviorType]) {
        typeData[behavior.behaviorType] = { name: behavior.behaviorType, value: 0 }
      }
      typeData[behavior.behaviorType].value++
    })

    return Object.values(typeData)
  }

  const getTimeOfDayData = () => {
    const timeData = {}

    filteredBehaviors.forEach((behavior) => {
      const timeOfDay = behavior.timeOfDay || "Unknown"
      if (!timeData[timeOfDay]) {
        timeData[timeOfDay] = { time: timeOfDay, count: 0 }
      }
      timeData[timeOfDay].count++
    })

    return Object.values(timeData)
  }

  // Calculate summary statistics
  const getSummaryStats = () => {
    const total = filteredBehaviors.length
    const positive = filteredBehaviors.filter((b) =>
      ["positive", "participation", "helpful"].includes(b.behaviorType),
    ).length
    const negative = filteredBehaviors.filter((b) =>
      ["disruptive", "aggressive", "late"].includes(b.behaviorType),
    ).length
    const studentsWithBehaviors = new Set(filteredBehaviors.map((b) => b.student)).size

    return {
      total,
      positive,
      negative,
      studentsWithBehaviors,
      positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
    }
  }

  const summaryStats = getSummaryStats()

  // Export functions
  const exportToCSV = () => {
    const csvData = [
      ["Date", "Student", "Behavior Type", "Subject", "Time of Day", "Severity", "Description"],
      ...filteredBehaviors.map((behavior) => [
        new Date(behavior.createdAt).toLocaleDateString(),
        behavior.student,
        behavior.behaviorType,
        behavior.subject,
        behavior.timeOfDay,
        behavior.severity,
        behavior.description,
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
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("TabiaZetu Behavior Report", 20, 20)

    doc.setFontSize(12)
    doc.text(`Teacher: ${user?.firstName} ${user?.lastName}`, 20, 35)
    doc.text(`School: ${user?.school}`, 20, 45)
    doc.text(`Period: ${selectedPeriod}`, 20, 55)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 65)

    // Summary Statistics
    doc.setFontSize(16)
    doc.text("Summary Statistics", 20, 85)

    doc.setFontSize(12)
    doc.text(`Total Behaviors: ${summaryStats.total}`, 20, 100)
    doc.text(`Positive Behaviors: ${summaryStats.positive}`, 20, 110)
    doc.text(`Negative Behaviors: ${summaryStats.negative}`, 20, 120)
    doc.text(`Students Tracked: ${summaryStats.studentsWithBehaviors}`, 20, 130)
    doc.text(`Positive Rate: ${summaryStats.positiveRate}%`, 20, 140)

    // Behavior Details Table
    if (filteredBehaviors.length > 0) {
      doc.setFontSize(16)
      doc.text("Behavior Details", 20, 160)

      const tableData = filteredBehaviors
        .slice(0, 20)
        .map((behavior) => [
          new Date(behavior.createdAt).toLocaleDateString(),
          behavior.student,
          behavior.behaviorType,
          behavior.subject,
          behavior.severity,
        ])

      doc.autoTable({
        head: [["Date", "Student", "Type", "Subject", "Severity"]],
        body: tableData,
        startY: 170,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [20, 184, 166] },
      })
    }

    doc.save(`behavior-report-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.pdf`)

    setMessage("PDF report exported successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700">Loading reports...</p>
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
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Behavior Reports & Analytics</h1>
                  <p className="text-teal-100 text-lg">Comprehensive insights into classroom behavior patterns</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{summaryStats.total}</div>
                <div className="text-teal-200">Total Behaviors</div>
              </div>
            </div>
          </div>

          {message && (
            <Alert className="border-green-500 bg-green-50">
              <FileText className="h-4 w-4" />
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {/* Controls */}
          <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-teal-900">Report Filters & Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-teal-800 font-medium">Period:</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-32 border-teal-300">
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
                  <label className="text-teal-800 font-medium">Student:</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-48 border-teal-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.name}>
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
                    className="border-teal-300 text-teal-700 hover:bg-teal-50 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    className="border-teal-300 text-teal-700 hover:bg-teal-50 bg-transparent"
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
                    <p className="text-purple-100">Positive Rate</p>
                    <p className="text-3xl font-bold">{summaryStats.positiveRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 border border-teal-200">
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
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900">Behavior Trends Over Time</CardTitle>
                  <CardDescription className="text-teal-700">
                    Daily behavior patterns showing positive vs negative trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getBehaviorTrendsData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2f1" />
                        <XAxis dataKey="date" stroke="#0f766e" />
                        <YAxis stroke="#0f766e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #14b8a6",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="positive"
                          stroke="#10b981"
                          strokeWidth={3}
                          name="Positive Behaviors"
                        />
                        <Line
                          type="monotone"
                          dataKey="negative"
                          stroke="#ef4444"
                          strokeWidth={3}
                          name="Negative Behaviors"
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Total Behaviors"
                        />
                      </LineChart>
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
            <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-teal-900 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-teal-700">
                  Latest behavior logs from the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredBehaviors.slice(0, 5).map((behavior, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={
                            ["positive", "participation", "helpful"].includes(behavior.behaviorType)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {behavior.behaviorType}
                        </Badge>
                        <span className="font-medium text-teal-900">{behavior.student}</span>
                        <span className="text-teal-700">in {behavior.subject}</span>
                      </div>
                      <div className="text-sm text-teal-600">{new Date(behavior.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {filteredBehaviors.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-teal-400 mb-4" />
                <h3 className="text-xl font-semibold text-teal-900 mb-2">No Data Available</h3>
                <p className="text-teal-700 mb-4">No behavior data found for the selected period and filters.</p>
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
        <div className="mt-16 text-center py-8 border-t border-teal-200 bg-teal-50/50">
          <p className="text-teal-600 text-sm">© 2025 TabiaZetu. All rights reserved.</p>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default Reports;
