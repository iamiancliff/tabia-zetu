"use client"

import { useState, useEffect } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, Users, School, BarChart3, Trash2, AlertTriangle, CheckCircle, UserCheck, Building } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [schools, setSchools] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Try to load from backend first
      try {
        const [teachersResponse, behaviorsResponse] = await Promise.all([
          fetch("/api/admin/teachers", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("/api/admin/behaviors", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ])

        if (teachersResponse.ok && behaviorsResponse.ok) {
          const teachersData = await teachersResponse.json()
          const behaviorsData = await behaviorsResponse.json()
          setTeachers(teachersData.teachers || [])
          setBehaviors(behaviorsData.behaviors || [])
        } else {
          throw new Error("Backend not available")
        }
      } catch (backendError) {
        console.log("Using localStorage data")
        // Load from localStorage
        const storedUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
        const storedBehaviors = JSON.parse(localStorage.getItem("behaviors") || "[]")

        // Filter out admin users
        const teacherUsers = storedUsers.filter((u) => u.email !== "admin@tabiazetu.co.ke")
        setTeachers(teacherUsers.length > 0 ? teacherUsers : mockTeachers)
        setBehaviors(storedBehaviors)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setTeachers(mockTeachers)
      setBehaviors([])
    } finally {
      setIsLoading(false)
    }
  }

  const mockTeachers = [
    {
      id: "1",
      firstName: "Mary",
      lastName: "Wanjiku",
      email: "mary.wanjiku@demo.school.ke",
      school: "Demo Primary School",
      county: "Nairobi",
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      firstName: "James",
      lastName: "Ochieng",
      email: "james.ochieng@kisumu.school.ke",
      school: "Kisumu Secondary School",
      county: "Kisumu",
      createdAt: "2024-02-20T14:15:00Z",
    },
    {
      id: "3",
      firstName: "Sarah",
      lastName: "Kimani",
      email: "sarah.kimani@nakuru.school.ke",
      school: "Nakuru Girls High School",
      county: "Nakuru",
      createdAt: "2024-03-10T09:45:00Z",
    },
  ]

  // Group teachers by school
  const getTeachersBySchool = () => {
    const schoolGroups = {}

    teachers.forEach((teacher) => {
      const schoolName = teacher.school || "Unknown School"
      if (!schoolGroups[schoolName]) {
        schoolGroups[schoolName] = {
          name: schoolName,
          county: teacher.county || "Unknown",
          teachers: [],
        }
      }
      schoolGroups[schoolName].teachers.push(teacher)
    })

    return Object.values(schoolGroups).sort((a, b) => a.name.localeCompare(b.name))
  }

  const schoolGroups = getTeachersBySchool()

  // Calculate statistics
  const getStats = () => {
    const totalTeachers = teachers.length
    const totalSchools = new Set(teachers.map((t) => t.school)).size
    const totalBehaviors = behaviors.length
    const recentTeachers = teachers.filter((t) => {
      const createdDate = new Date(t.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate >= weekAgo
    }).length

    return {
      totalTeachers,
      totalSchools,
      totalBehaviors,
      recentTeachers,
    }
  }

  const stats = getStats()

  const handleDeleteTeacher = async (teacher) => {
    setItemToDelete(teacher)
    setDeleteType("teacher")
    setShowDeleteDialog(true)
  }

  const handleDeleteSchool = async (school) => {
    setItemToDelete(school)
    setDeleteType("school")
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      if (deleteType === "teacher") {
        // Try to delete from backend
        try {
          const response = await fetch(`/api/admin/teachers/${itemToDelete.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })

          if (response.ok) {
            setTeachers((prev) => prev.filter((t) => t.id !== itemToDelete.id))
          } else {
            throw new Error("Backend delete failed")
          }
        } catch (backendError) {
          console.log("Deleting from localStorage")
          // Delete from localStorage as fallback
          const updatedTeachers = teachers.filter((t) => t.id !== itemToDelete.id)
          setTeachers(updatedTeachers)

          // Update allUsers in localStorage
          const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
          const updatedAllUsers = allUsers.filter((u) => u.id !== itemToDelete.id)
          localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers))
        }

        setMessage(`Teacher ${itemToDelete.firstName} ${itemToDelete.lastName} deleted successfully`)
      } else if (deleteType === "school") {
        // Delete all teachers from the school
        const teachersToDelete = itemToDelete.teachers.map((t) => t.id)

        try {
          // Try to delete from backend
          const response = await fetch("/api/admin/schools", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ schoolName: itemToDelete.name }),
          })

          if (response.ok) {
            setTeachers((prev) => prev.filter((t) => !teachersToDelete.includes(t.id)))
          } else {
            throw new Error("Backend delete failed")
          }
        } catch (backendError) {
          console.log("Deleting school from localStorage")
          // Delete from localStorage as fallback
          const updatedTeachers = teachers.filter((t) => !teachersToDelete.includes(t.id))
          setTeachers(updatedTeachers)

          // Update allUsers in localStorage
          const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
          const updatedAllUsers = allUsers.filter((u) => !teachersToDelete.includes(u.id))
          localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers))
        }

        setMessage(`School ${itemToDelete.name} and all associated teachers deleted successfully`)
      }

      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Delete error:", error)
      setMessage("Failed to delete. Please try again.")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setShowDeleteDialog(false)
      setItemToDelete(null)
      setDeleteType("")
    }
  }

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700">Loading admin dashboard...</p>
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
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-teal-100 text-lg">System overview and management</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-teal-200">Welcome back,</div>
                <div className="text-xl font-semibold">
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
            </div>
          </div>

          {message && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Teachers</p>
                    <p className="text-3xl font-bold">{stats.totalTeachers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Schools</p>
                    <p className="text-3xl font-bold">{stats.totalSchools}</p>
                  </div>
                  <Building className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total Behaviors</p>
                    <p className="text-3xl font-bold">{stats.totalBehaviors}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">New This Week</p>
                    <p className="text-3xl font-bold">{stats.recentTeachers}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schools and Teachers */}
          <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-teal-900 flex items-center gap-2">
                <School className="w-5 h-5" />
                Schools & Teachers
              </CardTitle>
              <CardDescription className="text-teal-700">Manage schools and their associated teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {schoolGroups.length === 0 ? (
                  <div className="text-center py-8 text-teal-600">
                    <School className="w-16 h-16 mx-auto text-teal-400 mb-4" />
                    <p>No schools or teachers found</p>
                  </div>
                ) : (
                  schoolGroups.map((school, index) => (
                    <div key={index} className="border border-teal-200 rounded-lg p-4 bg-teal-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                            <School className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-teal-900">{school.name}</h3>
                            <p className="text-teal-700">
                              {school.county} • {school.teachers.length} teacher
                              {school.teachers.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteSchool(school)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete School
                        </Button>
                      </div>

                      {/* Teachers in this school */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-white/50">
                              <TableHead className="text-teal-800">Teacher</TableHead>
                              <TableHead className="text-teal-800">Email</TableHead>
                              <TableHead className="text-teal-800">Joined</TableHead>
                              <TableHead className="text-teal-800">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {school.teachers.map((teacher) => (
                              <TableRow key={teacher.id} className="hover:bg-white/50">
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="w-8 h-8 border border-teal-200">
                                      <AvatarImage src={teacher.profileImage || "/placeholder.svg"} alt="Profile" />
                                      <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                        {teacher.firstName?.[0]}
                                        {teacher.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-teal-900">
                                        {teacher.firstName} {teacher.lastName}
                                      </div>
                                      <div className="text-sm text-teal-600">{teacher.county}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-teal-700">{teacher.email}</TableCell>
                                <TableCell className="text-teal-700">
                                  {new Date(teacher.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    onClick={() => handleDeleteTeacher(teacher)}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center py-8 border-t border-teal-200 bg-teal-50/50">
          <p className="text-teal-600 text-sm">© 2025 TabiaZetu. All rights reserved.</p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-red-700">
              {deleteType === "teacher"
                ? `Are you sure you want to delete teacher ${itemToDelete?.firstName} ${itemToDelete?.lastName}? This will remove all their data including student records and behavior logs.`
                : `Are you sure you want to delete ${itemToDelete?.name} and ALL associated teachers? This will remove all data for ${itemToDelete?.teachers?.length} teacher(s) and their students.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">This action will delete:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {deleteType === "teacher" ? (
                  <>
                    <li>• Teacher profile and account</li>
                    <li>• All student records</li>
                    <li>• All behavior logs</li>
                    <li>• Generated reports</li>
                  </>
                ) : (
                  <>
                    <li>• The entire school record</li>
                    <li>• {itemToDelete?.teachers?.length} teacher account(s)</li>
                    <li>• All associated student records</li>
                    <li>• All behavior logs and reports</li>
                  </>
                )}
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {deleteType === "teacher" ? "Teacher" : "School"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardSidebar>
  )
}

export default AdminDashboard;
