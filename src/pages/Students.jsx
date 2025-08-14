import { useState, useEffect } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Lightbulb,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Students = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState({})
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "",
    age: "",
    class: "",
    specialAttention: false,
    specialNotes: "",
  })

  const classes = [
    "Pre-Primary 1",
    "Pre-Primary 2",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Form 1",
    "Form 2",
    "Form 3",
    "Form 4",
  ]

  const getId = (s) => (s && (s._id || s.id))

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
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const [studentsResponse, behaviorsResponse] = await Promise.all([
          fetch(`${apiUrl}/students`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch(`${apiUrl}/behaviors`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ])

        if (studentsResponse.ok && behaviorsResponse.ok) {
          const studentsData = await studentsResponse.json()
          const behaviorsData = await behaviorsResponse.json()
          const normalizedStudents = (Array.isArray(studentsData) ? studentsData : []).map((s) => ({
            ...s,
            class: s.class || s.stream || "",
          }))
          setStudents(normalizedStudents)
          setBehaviors(Array.isArray(behaviorsData) ? behaviorsData : [])
        } else {
          throw new Error("Backend not available")
        }
      } catch (backendError) {
        alert("Failed to connect to backend. Please check your server and network.");
        setStudents([]);
        setBehaviors([]);
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setStudents(mockStudents)
      setBehaviors([])
    } finally {
      setIsLoading(false)
    }
  }

  const mockStudents = [
    {
      id: "1",
      name: "Amina Hassan",
      gender: "Female",
      age: 11,
      class: "Grade 5A",
      specialAttention: false,
      specialNotes: "",
      createdAt: getKenyaTime(),
      teacher: user?.id,
    },
    {
      id: "2",
      name: "John Kiprotich",
      gender: "Male",
      age: 12,
      class: "Grade 5A",
      specialAttention: true,
      specialNotes: "Requires extra support with reading comprehension",
      createdAt: getKenyaTime(),
      teacher: user?.id,
    },
  ]

  const handleAddStudent = async (e) => {
    e.preventDefault()

    if (!newStudent.name || !newStudent.gender || !newStudent.age || !newStudent.class) {
      setMessage("Please fill in all required fields")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const studentData = {
      name: newStudent.name,
      stream: newStudent.class, // map UI "class" to backend "stream"
      age: Number.parseInt(newStudent.age),
      subjects: Array.isArray(newStudent.subjects) ? newStudent.subjects : [],
      parentContact: newStudent.parentContact || undefined,
      notes: newStudent.specialNotes || undefined,
    }

    try {
      // Try to save to backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(studentData),
      })

      if (response.ok) {
        const savedStudent = await response.json()
        const normalized = { ...savedStudent, class: savedStudent.class || savedStudent.stream || "" }
        setStudents((prev) => [...prev, normalized])
      } else {
        throw new Error("Backend save failed")
      }
    } catch (error) {
      console.log("Saving to localStorage")
      // Save to localStorage as fallback
      const updatedStudents = [...students, studentData]
      setStudents(updatedStudents)
      localStorage.setItem("students", JSON.stringify(updatedStudents))
    }

    setNewStudent({
      name: "",
      gender: "",
      age: "",
      class: "",
      specialAttention: false,
      specialNotes: "",
    })
    setShowAddStudent(false)
    setMessage("Student added successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const handleEditStudent = async (updatedData) => {
    const updatedStudent = {
      name: updatedData.name,
      stream: updatedData.class || editingStudent.class || "",
      age: Number.parseInt(updatedData.age),
      subjects: Array.isArray(updatedData.subjects) ? updatedData.subjects : [],
      parentContact: updatedData.parentContact || undefined,
      notes: updatedData.specialNotes || undefined,
    }

    try {
      // Try to update in backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/students/${getId(editingStudent)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedStudent),
      })

      if (response.ok) {
        const savedStudent = await response.json()
        const normalized = { ...savedStudent, class: savedStudent.class || savedStudent.stream || "" }
        setStudents((prev) => prev.map((s) => (getId(s) === getId(savedStudent) ? normalized : s)))
      } else {
        throw new Error("Backend update failed")
      }
    } catch (error) {
      console.log("Updating in localStorage")
      // Update in localStorage as fallback
      const updatedStudents = students.map((s) => (getId(s) === getId(editingStudent) ? updatedStudent : s))
      setStudents(updatedStudents)
      localStorage.setItem("students", JSON.stringify(updatedStudents))
    }

    setShowEditDialog(false)
    setEditingStudent(null)
    setMessage("Student updated successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const handleDeleteStudent = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student? This will also remove all their behavior logs.")) return

    try {
      // Try to delete from backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/students/${studentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (response.ok) {
        setStudents((prev) => prev.filter((s) => getId(s) !== studentId))
        setBehaviors((prev) => prev.filter((b) => (b.student?._id || b.student) !== studentId))
      } else {
        throw new Error("Backend delete failed")
      }
    } catch (error) {
      console.log("Deleting from localStorage")
      // Delete from localStorage as fallback
      const updatedStudents = students.filter((s) => getId(s) !== studentId)
      const updatedBehaviors = behaviors.filter((b) => (b.student?._id || b.student) !== studentId)
      setStudents(updatedStudents)
      setBehaviors(updatedBehaviors)
      localStorage.setItem("students", JSON.stringify(updatedStudents))
      localStorage.setItem("behaviors", JSON.stringify(updatedBehaviors))
    }

    setMessage("Student deleted successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  // Generate behavior suggestions based on patterns
  const generateSuggestions = (student) => {
    const studentBehaviors = behaviors.filter((b) => b.student === student.name)
    const suggestions = []

    if (studentBehaviors.length === 0) {
      return [
        {
          type: "info",
          title: "Start Tracking",
          description: "Begin logging behaviors to receive personalized suggestions for this student.",
          priority: "low",
        },
      ]
    }

    // Analyze behavior patterns
    const behaviorCounts = {}
    const recentBehaviors = studentBehaviors.slice(-10) // Last 10 behaviors

    studentBehaviors.forEach((behavior) => {
      behaviorCounts[behavior.behaviorType] = (behaviorCounts[behavior.behaviorType] || 0) + 1
    })

    // Generate suggestions based on patterns
    if (behaviorCounts.late >= 3) {
      suggestions.push({
        type: "warning",
        title: "Address Lateness Pattern",
        description:
          "Set up morning check-in routines and notify parents after 3 late arrivals. Consider discussing morning schedules with the family.",
        priority: "high",
      })
    }

    if (behaviorCounts.disruptive >= 3) {
      suggestions.push({
        type: "warning",
        title: "Manage Disruptive Behavior",
        description:
          "Implement clear classroom expectations and positive reinforcement strategies. Consider seating arrangements and engagement techniques.",
        priority: "high",
      })
    }

    if (behaviorCounts.aggressive >= 2) {
      suggestions.push({
        type: "danger",
        title: "Address Aggressive Behavior",
        description:
          "Immediate intervention needed. Consider counseling referral, parent conference, and anger management strategies.",
        priority: "urgent",
      })
    }

    if (behaviorCounts.positive >= 5) {
      suggestions.push({
        type: "success",
        title: "Leverage Positive Behavior",
        description:
          "This student shows consistent positive behavior. Consider peer mentoring opportunities and leadership roles.",
        priority: "medium",
      })
    }

    if (behaviorCounts.participation && behaviorCounts.participation >= 3) {
      suggestions.push({
        type: "success",
        title: "Encourage Participation",
        description:
          "Student shows good participation. Provide more opportunities for class presentations and group leadership.",
        priority: "medium",
      })
    }

    // Subject-specific suggestions
    const mathBehaviors = studentBehaviors.filter((b) => b.subject === "Mathematics")
    if (mathBehaviors.filter((b) => ["disruptive", "frustrated"].includes(b.behaviorType)).length >= 2) {
      suggestions.push({
        type: "info",
        title: "Mathematics Support Needed",
        description:
          "Consider additional math support, visual aids, or peer tutoring to reduce frustration in mathematics.",
        priority: "medium",
      })
    }

    // Time-based suggestions
    const morningBehaviors = studentBehaviors.filter((b) => b.timeOfDay?.includes("Morning"))
    const afternoonBehaviors = studentBehaviors.filter((b) => b.timeOfDay?.includes("Afternoon"))

    if (afternoonBehaviors.filter((b) => ["disruptive", "tired"].includes(b.behaviorType)).length >= 3) {
      suggestions.push({
        type: "info",
        title: "Afternoon Energy Management",
        description:
          "Student shows challenging behavior in afternoons. Consider brain breaks, physical activities, or adjusted expectations.",
        priority: "medium",
      })
    }

    // Special attention considerations
    if (student.specialAttention && suggestions.length === 0) {
      suggestions.push({
        type: "info",
        title: "Individualized Support",
        description: `This student requires special attention: ${student.specialNotes}. Monitor closely and adjust strategies as needed.`,
        priority: "medium",
      })
    }

    // Default suggestion if no patterns found
    if (suggestions.length === 0) {
      suggestions.push({
        type: "info",
        title: "Continue Monitoring",
        description: "Keep tracking behaviors to identify patterns and receive more specific suggestions.",
        priority: "low",
      })
    }

    return suggestions
  }

  const getStudentStats = (student) => {
    const studentBehaviors = behaviors.filter((b) => b.student === student.name)
    const positive = studentBehaviors.filter((b) =>
      ["positive", "participation", "helpful"].includes(b.behaviorType),
    ).length
    const negative = studentBehaviors.filter((b) =>
      ["disruptive", "aggressive", "late"].includes(b.behaviorType),
    ).length
    const lastLogged = studentBehaviors.length > 0 ? studentBehaviors[studentBehaviors.length - 1].createdAt : "Never"

    return { positive, negative, total: studentBehaviors.length, lastLogged }
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.class || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleExportStudents = () => {
    const csvData = [
      [
        "Name",
        "Gender",
        "Age",
        "Class",
        "Special Attention",
        "Special Notes",
        "Positive Behaviors",
        "Negative Behaviors",
        "Total Behaviors",
        "Last Logged",
      ],
      ...filteredStudents.map((student) => {
        const stats = getStudentStats(student)
        return [
          student.name,
          student.gender,
          student.age,
          student.class,
          student.specialAttention ? "Yes" : "No",
          student.specialNotes || "None",
          stats.positive,
          stats.negative,
          stats.total,
          stats.lastLogged,
        ]
      }),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300">Loading students...</p>
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
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Student Management</h1>
                  <p className="text-teal-100 dark:text-teal-200 text-lg">Manage your students and track their classroom behavior</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{students.length}</div>
                <div className="text-teal-200 dark:text-teal-300">Total Students</div>
              </div>
            </div>
          </div>

          {message && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600 transition-colors duration-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700 dark:text-green-300">{message}</AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-teal-900 dark:text-teal-100">
                    <Users className="w-5 h-5" />
                    Students ({filteredStudents.length})
                  </CardTitle>
                  <CardDescription className="text-teal-700 dark:text-teal-300">
                    Register and manage students in your classroom
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleExportStudents}
                    variant="outline"
                    className="border-teal-300 dark:border-teal-600 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                    <DialogTrigger asChild>
                      <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl transition-colors duration-200">
                      <DialogHeader>
                        <DialogTitle className="text-teal-900 dark:text-teal-100">Register New Student</DialogTitle>
                        <DialogDescription className="text-teal-700 dark:text-teal-300">
                          Add a new student to your classroom with complete information
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddStudent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-teal-800">Full Name *</Label>
                            <Input
                              value={newStudent.name}
                              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                              placeholder="Enter student's full name"
                              className="border-teal-300"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-teal-800">Gender *</Label>
                            <Select
                              value={newStudent.gender}
                              onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}
                            >
                              <SelectTrigger className="border-teal-300">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-teal-800">Age *</Label>
                            <Input
                              type="number"
                              min="3"
                              max="20"
                              value={newStudent.age}
                              onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                              placeholder="Enter age"
                              className="border-teal-300"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-teal-800">Class *</Label>
                            <Select
                              value={newStudent.class}
                              onValueChange={(value) => setNewStudent({ ...newStudent, class: value })}
                            >
                              <SelectTrigger className="border-teal-300">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((cls) => (
                                  <SelectItem key={cls} value={cls}>
                                    {cls}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-teal-800">Special Attention Required?</Label>
                              <p className="text-sm text-teal-600">
                                Does this student need special support or accommodations?
                              </p>
                            </div>
                            <Switch
                              checked={newStudent.specialAttention}
                              onCheckedChange={(checked) => setNewStudent({ ...newStudent, specialAttention: checked })}
                            />
                          </div>

                          {newStudent.specialAttention && (
                            <div className="space-y-2">
                              <Label className="text-teal-800">Special Notes</Label>
                              <Textarea
                                value={newStudent.specialNotes}
                                onChange={(e) => setNewStudent({ ...newStudent, specialNotes: e.target.value })}
                                placeholder="Describe the special attention needed (e.g., visual impairment, requires supervision, learning difficulties)"
                                className="border-teal-300"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddStudent(false)}
                            className="border-teal-300 text-teal-700"
                          >
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                            Register Student
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-teal-500" />
                  <Input
                    placeholder="Search students by name or class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-teal-300"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="rounded-lg border border-teal-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-teal-50">
                    <TableRow>
                      <TableHead className="text-teal-800">Student</TableHead>
                      <TableHead className="text-teal-800">Class</TableHead>
                      <TableHead className="text-teal-800">Behavior Summary</TableHead>
                      <TableHead className="text-teal-800">Recent Activity</TableHead>
                      <TableHead className="text-teal-800">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-teal-600">
                          {students.length === 0 ? (
                            <div className="space-y-3">
                              <User className="w-12 h-12 mx-auto text-teal-400" />
                              <p>No students registered yet</p>
                              <p className="text-sm">Add your first student to get started</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Search className="w-12 h-12 mx-auto text-teal-400" />
                              <p>No students match your search</p>
                              <p className="text-sm">Try adjusting your search terms</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => {
                        const stats = getStudentStats(student)
                        return (
                          <TableRow key={getId(student)} className="hover:bg-teal-50/50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10 border-2 border-teal-200">
                                  <AvatarFallback className="bg-teal-100 text-teal-700">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-teal-900">{student.name}</div>
                                  <div className="text-sm text-teal-600 flex items-center space-x-2">
                                    <span>
                                      {student.gender}, {student.age} years
                                    </span>
                                    {student.specialAttention && (
                                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Special Attention
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">{student.class}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {stats.positive > 0 && (
                                  <Badge className="bg-green-100 text-green-800">+{stats.positive}</Badge>
                                )}
                                {stats.negative > 0 && (
                                  <Badge className="bg-red-100 text-red-800">-{stats.negative}</Badge>
                                )}
                                {stats.total === 0 && <span className="text-teal-600 text-sm">No logs yet</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-teal-700 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Last logged:{" "}
                                {stats.lastLogged === "Never"
                                  ? "Never"
                                  : new Date(stats.lastLogged).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setShowSuggestions((prev) => ({
                                      ...prev,
                                      [getId(student)]: !prev[getId(student)],
                                    }))
                                  }}
                                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                >
                                  <Lightbulb className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingStudent(student)
                                    setShowEditDialog(true)
                                  }}
                                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteStudent(getId(student))}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Behavior Suggestions */}
              {Object.keys(showSuggestions).some((key) => showSuggestions[key]) && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-teal-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Behavior Improvement Suggestions
                  </h3>
                  {filteredStudents.map((student) => {
                    if (!showSuggestions[getId(student)]) return null

                    const suggestions = generateSuggestions(student)

                    return (
                      <Card key={getId(student)} className="bg-purple-50 border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-purple-900">Suggestions for {student.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border-l-4 ${
                                suggestion.type === "danger"
                                  ? "bg-red-50 border-red-500"
                                  : suggestion.type === "warning"
                                    ? "bg-yellow-50 border-yellow-500"
                                    : suggestion.type === "success"
                                      ? "bg-green-50 border-green-500"
                                      : "bg-blue-50 border-blue-500"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {suggestion.type === "danger" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                                  {suggestion.type === "warning" && (
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                  )}
                                  {suggestion.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                                  {suggestion.type === "info" && <Target className="w-5 h-5 text-blue-600" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                                    <Badge
                                      className={
                                        suggestion.priority === "urgent"
                                          ? "bg-red-100 text-red-800"
                                          : suggestion.priority === "high"
                                            ? "bg-orange-100 text-orange-800"
                                            : suggestion.priority === "medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                      }
                                    >
                                      {suggestion.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-700 text-sm">{suggestion.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Student Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="bg-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-teal-900">Edit Student Information</DialogTitle>
                <DialogDescription className="text-teal-700">
                  Update student details and special requirements
                </DialogDescription>
              </DialogHeader>
              {editingStudent && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-teal-800">Full Name</Label>
                      <Input
                        value={editingStudent.name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                        className="border-teal-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-teal-800">Gender</Label>
                      <Select
                        value={editingStudent.gender}
                        onValueChange={(value) => setEditingStudent({ ...editingStudent, gender: value })}
                      >
                        <SelectTrigger className="border-teal-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-teal-800">Age</Label>
                      <Input
                        type="number"
                        min="3"
                        max="20"
                        value={editingStudent.age}
                        onChange={(e) => setEditingStudent({ ...editingStudent, age: e.target.value })}
                        className="border-teal-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-teal-800">Class</Label>
                      <Select
                        value={editingStudent.class}
                        onValueChange={(value) => setEditingStudent({ ...editingStudent, class: value })}
                      >
                        <SelectTrigger className="border-teal-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-teal-800">Special Attention Required?</Label>
                        <p className="text-sm text-teal-600">Does this student need special support?</p>
                      </div>
                      <Switch
                        checked={editingStudent.specialAttention}
                        onCheckedChange={(checked) =>
                          setEditingStudent({ ...editingStudent, specialAttention: checked })
                        }
                      />
                    </div>

                    {editingStudent.specialAttention && (
                      <div className="space-y-2">
                        <Label className="text-teal-800">Special Notes</Label>
                        <Textarea
                          value={editingStudent.specialNotes}
                          onChange={(e) => setEditingStudent({ ...editingStudent, specialNotes: e.target.value })}
                          className="border-teal-300"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
                      className="border-teal-300 text-teal-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleEditStudent(editingStudent)}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-teal-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600" />
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

export default Students;
