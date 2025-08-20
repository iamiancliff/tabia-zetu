import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Users, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

const BehaviorForm = ({ students = [], onSubmit, onCancel, onFormChange }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    student: "",
    behaviorType: "",
    subject: "",
    timeOfDay: "",
    severity: "medium",
    notes: "",
    outcome: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const behaviorTypes = [
    { value: "excellent_work", label: "Excellent Academic Work" },
    { value: "class_participation", label: "Active Class Participation" },
    { value: "helping_others", label: "Helping Other Students" },
    { value: "leadership", label: "Showing Leadership" },
    { value: "creativity", label: "Creative Thinking" },
    { value: "talking_in_class", label: "Talking During Class" },
    { value: "not_listening", label: "Not Paying Attention" },
    { value: "disrupting_class", label: "Disrupting Class Activities" },
    { value: "bullying", label: "Bullying Behavior" },
    { value: "late_to_class", label: "Late to Class" },
    { value: "absent", label: "Absent from Class" },
    { value: "incomplete_work", label: "Incomplete Homework/Classwork" },
    { value: "using_phone", label: "Using Phone in Class" },
    { value: "fighting", label: "Fighting with Peers" },
    { value: "respectful", label: "Showing Respect to Teachers" },
    { value: "organized", label: "Well Organized" },
    { value: "teamwork", label: "Good Teamwork" },
  ]

  const subjects = [
    "Mathematics",
    "English",
    "Kiswahili",
    "Science",
    "Social Studies",
    "Religious Education",
    "Creative Arts",
    "Physical Education",
    "Life Skills",
    "Agriculture",
    "Home Science",
    "Computer Studies",
    "Business Studies",
    "French",
    "German",
    "Arabic",
    "Indigenous Languages",
    "Sign Language",
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

  const handleFormChange = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Call onFormChange callback if provided
    if (onFormChange) {
      // Only call if we have enough data to make meaningful suggestions
      if (newFormData.student && newFormData.behaviorType) {
        onFormChange(newFormData)
      } else {
        onFormChange(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Check all required fields including notes
    if (!formData.student || !formData.behaviorType || !formData.subject || !formData.timeOfDay || !formData.notes) {
      setError("Please fill in all required fields including the description")
      return
    }

    // Additional validation for notes content
    if (formData.notes.trim().length < 10) {
      setError("Please provide a detailed description (at least 10 characters)")
      return
    }

    setIsSubmitting(true)

    try {
      // Map form data to backend payload - use notes instead of description
      const payload = {
        studentId: formData.student,
        behaviorType: formData.behaviorType,
        subject: formData.subject,
        timeOfDay: formData.timeOfDay,
        severity: formData.severity,
        notes: formData.notes.trim(),
        outcome: formData.outcome,
      }

      console.log("🔍 [BehaviorForm] Sending payload:", payload)
      await onSubmit(payload)
      
      // Reset form
      setFormData({
        student: "",
        behaviorType: "",
        subject: "",
        timeOfDay: "",
        severity: "medium",
        notes: "",
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="student" className="text-teal-800 font-medium">
            Student *
          </Label>
          <Select value={formData.student} onValueChange={(value) => handleFormChange('student', value)}>
            <SelectTrigger className="border-teal-300 h-11">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student._id || student.id} value={student._id || student.id}>
                  {student.name} {student.class ? `(${student.class})` : student.stream ? `(${student.stream})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="behaviorType" className="text-teal-800 font-medium">
            Behavior Type *
          </Label>
          <Select
            value={formData.behaviorType}
            onValueChange={(value) => handleFormChange('behaviorType', value)}
          >
            <SelectTrigger className="border-teal-300 h-11">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="subject" className="text-teal-800 font-medium">
            Subject *
          </Label>
          <Select value={formData.subject} onValueChange={(value) => handleFormChange('subject', value)}>
            <SelectTrigger className="border-teal-300 h-11">
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

        <div className="space-y-3">
          <Label htmlFor="timeOfDay" className="text-teal-800 font-medium">
            Time of Day *
          </Label>
          <Select value={formData.timeOfDay} onValueChange={(value) => handleFormChange('timeOfDay', value)}>
            <SelectTrigger className="border-teal-300 h-11">
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

      <div className="space-y-3">
        <Label htmlFor="severity" className="text-teal-800 font-medium">
          Severity Level
        </Label>
                  <Select value={formData.severity} onValueChange={(value) => handleFormChange('severity', value)}>
          <SelectTrigger className="border-teal-300 h-11">
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

      <div className="space-y-3">
        <Label htmlFor="description" className="text-teal-800 font-medium">
          Description *
        </Label>
        <Textarea
          id="description"
          value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
          placeholder="Describe what happened in detail..."
          className="border-teal-300 focus:border-teal-500 min-h-[80px] resize-y"
          rows={4}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="outcome" className="text-teal-800 font-medium">
          Action Taken / Outcome
        </Label>
        <Textarea
          id="outcome"
          value={formData.outcome}
                      onChange={(e) => handleFormChange('outcome', e.target.value)}
          placeholder="What action was taken or what was the outcome?"
          className="border-teal-300 focus:border-teal-500 min-h-[60px] resize-y"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-teal-300 text-teal-700 bg-transparent hover:bg-teal-50 px-6 py-2"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
        >
          {isSubmitting ? "Logging..." : "Log Behavior"}
        </Button>
      </div>
    </form>
  )
}

export default BehaviorForm;
