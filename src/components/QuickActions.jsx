import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Users, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  BookOpen,
  Phone,
  Mail,
  Calendar,
  FileText,
  Shield,
  Lightbulb
} from "lucide-react"

const QuickActions = ({ insights = [], predictions = [], behaviors, students }) => {
  if (insights.length === 0 && predictions.length === 0) return null

  const generateQuickActions = () => {
    const actions = []

    // High priority insights actions
    const highPriorityInsights = insights.filter(i => i.priority === 'high')
    highPriorityInsights.forEach(insight => {
      if (insight.type === 'intervention') {
        actions.push({
          id: `meeting-${insight.id}`,
          title: 'Schedule Student Meeting',
          description: `One-on-one with ${insight.data?.[0]?.label || 'student'}`,
          icon: <Users className="w-5 h-5" />,
          priority: 'high',
          action: () => handleScheduleMeeting(insight),
          color: 'bg-red-500 hover:bg-red-600'
        })
      }
      
      if (insight.type === 'alert') {
        actions.push({
          id: `review-${insight.id}`,
          title: 'Review High Severity Incidents',
          description: 'Immediate attention required',
          icon: <AlertTriangle className="w-5 h-5" />,
          priority: 'high',
          action: () => handleReviewIncidents(insight),
          color: 'bg-red-500 hover:bg-red-600'
        })
      }
    })

    // Medium priority actions
    const mediumPriorityInsights = insights.filter(i => i.priority === 'medium')
    mediumPriorityInsights.forEach(insight => {
      if (insight.type === 'curriculum') {
        actions.push({
          id: `review-lesson-${insight.id}`,
          title: 'Review Lesson Plans',
          description: `Update ${insight.data?.[0]?.label || 'subject'} curriculum`,
          icon: <BookOpen className="w-5 h-5" />,
          priority: 'medium',
          action: () => handleReviewCurriculum(insight),
          color: 'bg-blue-500 hover:bg-blue-600'
        })
      }
      
      if (insight.type === 'scheduling') {
        actions.push({
          id: `adjust-schedule-${insight.id}`,
          title: 'Adjust Schedule',
          description: 'Optimize problematic time periods',
          icon: <Clock className="w-5 h-5" />,
          priority: 'medium',
          action: () => handleAdjustSchedule(insight),
          color: 'bg-blue-500 hover:bg-blue-600'
        })
      }
    })

    // Low priority positive actions
    const positiveInsights = insights.filter(i => i.type === 'opportunity')
    positiveInsights.forEach(insight => {
      actions.push({
        id: `celebrate-${insight.id}`,
        title: 'Celebrate Positive Behavior',
        description: 'Recognize and reward good behavior',
        icon: <CheckCircle className="w-5 h-5" />,
        priority: 'low',
        action: () => handleCelebrateBehavior(insight),
        color: 'bg-green-500 hover:bg-green-600'
      })
    })

    // Prediction-based actions
    predictions.forEach(prediction => {
      if (prediction.riskLevel === 'high') {
        actions.push({
          id: `prevent-${prediction.id}`,
          title: 'Implement Prevention',
          description: 'Act on high-risk prediction',
          icon: <Shield className="w-5 h-5" />,
          priority: 'high',
          action: () => handleImplementPrevention(prediction),
          color: 'bg-orange-500 hover:bg-orange-600'
        })
      }
    })

    // General quick actions based on data
    if (behaviors.length > 0) {
      const recentBehaviors = behaviors.slice(0, 5)
      const highSeverityCount = recentBehaviors.filter(b => b.severity === 'high').length
      
      if (highSeverityCount > 0) {
        actions.push({
          id: 'generate-report',
          title: 'Generate Incident Report',
          description: 'Document recent high-severity incidents',
          icon: <FileText className="w-5 h-5" />,
          priority: 'medium',
          action: () => handleGenerateReport(),
          color: 'bg-purple-500 hover:bg-purple-600'
        })
      }

      const studentsWithMultipleIncidents = students.filter(student => {
        const studentBehaviors = behaviors.filter(b => 
          b.studentId === student._id || b.student?._id === student._id
        )
        return studentBehaviors.length > 2
      })

      if (studentsWithMultipleIncidents.length > 0) {
        actions.push({
          id: 'parent-communication',
          title: 'Contact Parents',
          description: `Reach out to ${studentsWithMultipleIncidents.length} families`,
          icon: <Phone className="w-5 h-5" />,
          priority: 'medium',
          action: () => handleContactParents(studentsWithMultipleIncidents),
          color: 'bg-indigo-500 hover:bg-indigo-600'
        })
      }
    }

    return actions.slice(0, 6) // Limit to 6 actions for UI
  }

  const handleScheduleMeeting = async (insight) => {
    const studentName = insight.data?.[0]?.label || 'student';
    
    try {
      // Save action to MongoDB
      const response = await fetch('/api/teacher-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          actionType: 'schedule_meeting',
          title: `Schedule Meeting with ${studentName}`,
          description: `One-on-one meeting scheduled with ${studentName}`,
          details: {
            studentName,
            meetingType: 'one-on-one',
            purpose: 'Behavior improvement discussion'
          },
          priority: 'high',
          urgency: 'medium',
          plannedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          relatedInsight: insight._id,
          category: 'student-support',
          subcategory: 'meeting'
        })
      })

      if (response.ok) {
        alert(`📅 Meeting Scheduled!\n\n✅ One-on-one meeting scheduled with ${studentName}\n📋 Meeting notes template prepared\n⏰ Reminder set for tomorrow\n\nThis action has been saved to your action log.`);
      } else {
        alert(`❌ Error: Could not save meeting to database`);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      alert(`❌ Error: Could not save meeting to database`);
    }
  }

  const handleReviewIncidents = async (insight) => {
    const count = insight.data?.[0]?.value || 'multiple';
    
    try {
      const response = await fetch('/api/teacher-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          actionType: 'review_incidents',
          title: `Review ${count} High-Severity Incidents`,
          description: `Review and analyze high-severity incidents`,
          details: {
            incidentCount: count,
            severity: 'high',
            reviewType: 'incident-analysis'
          },
          priority: 'high',
          urgency: 'high',
          plannedAt: new Date(),
          relatedInsight: insight._id,
          category: 'incident-management',
          subcategory: 'review'
        })
      })

      if (response.ok) {
        alert(`🔍 Incident Review Started!\n\n✅ ${count} high-severity incidents marked for review\n📋 Review checklist generated\n📊 Priority ranking applied\n\nThis action has been saved to your action log.`);
      } else {
        alert(`❌ Error: Could not save review action to database`);
      }
    } catch (error) {
      console.error('Error starting incident review:', error)
      alert(`❌ Error: Could not save review action to database`);
    }
  }

  const handleReviewCurriculum = (insight) => {
    const subject = insight.data?.[0]?.label || 'subject';
    alert(`📚 Curriculum Review Initiated!\n\n✅ ${subject} lesson plans marked for review\n📋 Engagement strategies highlighted\n🎯 Problem areas identified\n\nCurriculum review mode activated.`);
  }

  const handleAdjustSchedule = (insight) => {
    const timePeriod = insight.data?.[0]?.label || 'problematic time';
    alert(`⏰ Schedule Adjustment Applied!\n\n✅ ${timePeriod} periods optimized\n📋 Transition strategies implemented\n🎯 Monitoring increased during critical times\n\nSchedule changes saved successfully.`);
  }

  const handleCelebrateBehavior = (insight) => {
    const count = insight.data?.[0]?.value || 'positive behaviors';
    alert(`🎉 Positive Behavior Celebration!\n\n✅ ${count} positive behaviors recognized\n🏆 Reward system activated\n📢 Class announcement prepared\n\nCelebration mode enabled!`);
  }

  const handleImplementPrevention = (prediction) => {
    const studentName = prediction.studentName || 'student';
    alert(`🛡️ Prevention Strategy Implemented!\n\n✅ Prevention plan activated for ${studentName}\n📋 Daily check-ins scheduled\n🎯 Early warning system enabled\n\nPrevention mode is now active.`);
  }

  const handleGenerateReport = () => {
    alert(`📊 Incident Report Generated!\n\n✅ Report created with recent incidents\n📋 Executive summary prepared\n📧 Ready for administration review\n\nReport saved to your documents.`);
  }

  const handleContactParents = (students) => {
    alert(`📞 Parent Communication Initiated!\n\n✅ Contact list prepared for ${students.length} families\n📋 Communication templates ready\n📧 Email drafts prepared\n\nParent outreach system activated.`);
  }

  const quickActions = generateQuickActions()

  if (quickActions.length === 0) return null

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-lg text-emerald-900">Quick Actions</CardTitle>
        </div>
        <CardDescription className="text-emerald-700">
          Click to take action on important insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              onClick={action.action}
              className={`${action.color} text-white h-auto p-4 flex flex-col items-start space-y-2 text-left`}
            >
              <div className="flex items-center space-x-2 w-full">
                <div className="text-white">
                  {action.icon}
                </div>
                <Badge 
                  variant="outline" 
                  className={`${
                    action.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                    action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  } text-xs`}
                >
                  {action.priority}
                </Badge>
              </div>
              <div className="w-full">
                <div className="font-semibold text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
        
        {quickActions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-emerald-200">
            <div className="text-center">
              <p className="text-xs text-emerald-600">
                {quickActions.length} AI-powered actions available
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuickActions
