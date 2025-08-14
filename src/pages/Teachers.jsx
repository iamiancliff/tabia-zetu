import { useState, useEffect } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Search, Mail, School, MapPin } from "lucide-react"
import ApiService from "../utils/api"

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    school: "",
    county: "",
  })

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

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setIsLoading(true)
      // This would be an admin endpoint to get all teachers
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/admin/teachers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTeachers(data.teachers || data || [])
      } else {
        throw new Error("Failed to fetch teachers")
      }
    } catch (error) {
      alert("Failed to connect to backend. Please check your server and network.");
      setTeachers([]);
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTeacher = async () => {
    if (newTeacher.firstName && newTeacher.lastName && newTeacher.email && newTeacher.school) {
      try {
        const response = await ApiService.register({
          ...newTeacher,
          role: "teacher",
        })

        const teacher = {
          id: response?._id || response?.user?._id || teachers.length + 1,
          firstName: response?.firstName || newTeacher.firstName,
          lastName: response?.lastName || newTeacher.lastName,
          email: response?.email || newTeacher.email,
          school: response?.school || newTeacher.school,
          county: response?.county || newTeacher.county,
          students: 0,
          active: true,
          lastLogin: "Never",
          createdAt: new Date().toISOString().split("T")[0],
        }

        setTeachers([...teachers, teacher])
        setNewTeacher({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          school: "",
          county: "",
        })
        setShowAddTeacher(false)
      } catch (e) {
        console.error("Failed to add teacher:", e)
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300">Loading teachers...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Teacher Management
                </CardTitle>
                <CardDescription>Manage teacher accounts and monitor their activity</CardDescription>
              </div>
              <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>Create a new teacher account for your school.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teacher-firstname">First Name</Label>
                        <Input
                          id="teacher-firstname"
                          placeholder="John"
                          value={newTeacher.firstName}
                          onChange={(e) => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teacher-lastname">Last Name</Label>
                        <Input
                          id="teacher-lastname"
                          placeholder="Doe"
                          value={newTeacher.lastName}
                          onChange={(e) => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher-email">Email</Label>
                      <Input
                        id="teacher-email"
                        type="email"
                        placeholder="teacher@school.co.ke"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher-password">Password</Label>
                      <Input
                        id="teacher-password"
                        type="password"
                        placeholder="Enter password"
                        value={newTeacher.password}
                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher-school">School Name</Label>
                      <Input
                        id="teacher-school"
                        placeholder="Nairobi Primary School"
                        value={newTeacher.school}
                        onChange={(e) => setNewTeacher({ ...newTeacher, school: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher-county">County</Label>
                      <Select
                        value={newTeacher.county}
                        onValueChange={(value) => setNewTeacher({ ...newTeacher, county: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                        <SelectContent>
                          {kenyanCounties.map((county) => (
                            <SelectItem key={county} value={county}>
                              {county}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowAddTeacher(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTeacher}>Add Teacher</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Search teachers by name, email, or school..." className="pl-10" />
              </div>
            </div>
            <div className="rounded-md border dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>School & Location</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium dark:text-white">
                            {teacher.firstName} {teacher.lastName}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="w-3 h-3 mr-1" />
                            {teacher.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center text-sm font-medium dark:text-white">
                            <School className="w-3 h-3 mr-1" />
                            {teacher.school}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            {teacher.county}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{teacher.students} students</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            teacher.active
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }
                        >
                          {teacher.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">{teacher.lastLogin}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">{teacher.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default Teachers;
