"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

const BehaviorForm = ({ students = [], onSubmit, onCancel }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    student: "",
    behaviorType: "",
    subject: "",
    timeOfDay: "",
    severity: "medium",
    description: "",
    outcome: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const behaviorTypes = [
    { value: "positive", label: "Positive Behavior" },
    { value: "participation", label: "Active Participation" },
    { value: "helpful", label: "Helpful to Others" },
    { value: "disruptive", label: "Disruptive Behavior" },
    { value: "aggressive", label: "Aggressive Behavior" },
    { value: "late", label: "Late to Class" },
    { value: "absent", label: "Absent" },
  ]

  const subjects = [
    "Mathematics",
    "English",
    "Kiswahili",
    "Science",
    "Social Studies",
    "Religious Education",
    "Physical Education",
    "Art & Craft",
    "Music",
    "Life Skills",
    "Break Time",
    "Assembly",
  ]

  const timePeriods = [
    "Morning (8:00 - 10:00 AM)",
    "Mid-Morning (10:00 AM - 12:00 PM)",
    "Afternoon (12:00 - 2:00 PM)",
    "Late Afternoon (2:00 - 4:00 PM)",
  ]

  const severityLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.student || !formData.behaviorType || !formData.subject || !formData.timeOfDay) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        student: "",
        behaviorType: "",
        subject: "",
        timeOfDay: "",
        severity: "medium",
        description: "",
        outcome: "",
      })
    } catch (error) {
      setError("Failed to log behavior. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If no students exist, show message to add students first
  if (students.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            No Students Registered
          </CardTitle>
          <CardDescription className="text-yellow-700">
            You need to register students before you can log their behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-yellow-500" />
            <p className="text-yellow-800">
              Please add students to your classroom first, then you can start logging their behaviors.
            </p>
            <Button onClick={() => navigate("/students")} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Students
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student" className="text-teal-800">
            Student *
          </Label>
          <Select value={formData.student} onValueChange={(value) => setFormData({ ...formData, student: value })}>
            <SelectTrigger className="border-teal-300">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.name}>
                  {student.name} ({student.class})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="behaviorType" className="text-teal-800">
            Behavior Type *
          </Label>
          <Select
            value={formData.behaviorType}
            onValueChange={(value) => setFormData({ ...formData, behaviorType: value })}
          >
            <SelectTrigger className="border-teal-300">
              <SelectValue placeholder="Select behavior type" />
            </SelectTrigger>
            <SelectContent>
              {behaviorTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-teal-800">
            Subject *
          </Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger className="border-teal-300">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeOfDay" className="text-teal-800">
            Time of Day *
          </Label>
          <Select value={formData.timeOfDay} onValueChange={(value) => setFormData({ ...formData, timeOfDay: value })}>
            <SelectTrigger className="border-teal-300">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity" className="text-teal-800">
          Severity Level
        </Label>
        <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
          <SelectTrigger className="border-teal-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {severityLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-teal-800">
          Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what happened in detail..."
          className="border-teal-300 focus:border-teal-500"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outcome" className="text-teal-800">
          Action Taken / Outcome
        </Label>
        <Textarea
          id="outcome"
          value={formData.outcome}
          onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
          placeholder="What action was taken or what was the outcome?"
          className="border-teal-300 focus:border-teal-500"
          rows={2}
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-teal-300 text-teal-700 bg-transparent"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
          {isSubmitting ? "Logging..." : "Log Behavior"}
        </Button>
      </div>
    </form>
  )
}

export default BehaviorForm;
