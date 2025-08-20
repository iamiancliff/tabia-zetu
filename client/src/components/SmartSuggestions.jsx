import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Zap, Target, Clock, Users, BookOpen, TrendingUp } from "lucide-react"

const SmartSuggestions = ({ currentBehavior, behaviors, students }) => {
  const [suggestions, setSuggestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (currentBehavior && behaviors.length > 0) {
      generateContextualSuggestions()
    }
  }, [currentBehavior, behaviors])

  const generateContextualSuggestions = () => {
    setIsGenerating(true)
    
    // Simulate AI processing
    setTimeout(() => {
      const newSuggestions = analyzeContextAndGenerateSuggestions()
      setSuggestions(newSuggestions)
      setIsGenerating(false)
    }, 800)
  }

  const analyzeContextAndGenerateSuggestions = () => {
    if (!currentBehavior) return []

    const suggestions = []
    const behaviorType = currentBehavior.behaviorType
    const studentId = currentBehavior.studentId
    const subject = currentBehavior.subject
    const severity = currentBehavior.severity

    // Get student's behavior history
    const studentBehaviors = behaviors.filter(b => 
      b.studentId === studentId || b.student?.id === studentId
    )
    const student = students.find(s => s._id === studentId)
    const studentName = student ? student.name : 'Unknown Student'

    // Suggestion 1: Immediate Response Actions
    if (['fighting', 'bullying', 'disrupting_class'].includes(behaviorType)) {
      suggestions.push({
        id: 'immediate-response',
        type: 'urgent',
        title: 'Immediate Response Required',
        description: `This ${behaviorType.replace(/_/g, ' ')} incident requires immediate intervention`,
        priority: 'critical',
        icon: <Zap className="w-5 h-5" />,
        actions: [
          'Separate students now',
          'Write report',
          'Call admin if needed'
        ],
        timeframe: 'Immediate',
        confidence: 95
      })
    }

    // Suggestion 2: Student-Specific Patterns
    if (studentBehaviors.length > 1) {
      const recentBehaviors = studentBehaviors.slice(0, 5)
      const negativeCount = recentBehaviors.filter(b => 
        ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
      ).length
      
      if (negativeCount >= 2) {
        suggestions.push({
          id: 'student-pattern',
          type: 'intervention',
          title: 'Student Behavior Pattern Detected',
          description: `${studentName} has ${negativeCount} negative incidents recently`,
          priority: 'high',
          icon: <Users className="w-5 h-5" />,
          actions: [
            'Meet with student',
            'Check past reports',
            'Make improvement plan'
          ],
          timeframe: 'This week',
          confidence: 85
        })
      }
    }

    // Suggestion 3: Subject-Specific Strategies
    if (subject && subject !== 'No Subject') {
      const subjectBehaviors = behaviors.filter(b => b.subject === subject)
      const subjectNegativeCount = subjectBehaviors.filter(b => 
        ['fighting', 'bullying', 'disrupting_class', 'using_phone'].includes(b.behaviorType)
      ).length
      
      if (subjectNegativeCount > 2) {
        suggestions.push({
          id: 'subject-strategy',
          type: 'curriculum',
          title: 'Subject-Specific Behavior Management',
          description: `${subject} shows higher incident rates - consider curriculum adjustments`,
          priority: 'medium',
          icon: <BookOpen className="w-5 h-5" />,
          actions: [
            'Add more activities',
            'Use group work',
            'Give extra support'
          ],
          timeframe: 'Next lesson',
          confidence: 75
        })
      }
    }

    // Suggestion 4: Severity-Based Escalation
    if (severity === 'high') {
      suggestions.push({
        id: 'severity-escalation',
        type: 'safety',
        title: 'High Severity Incident Protocol',
        description: 'This high-severity incident requires escalation and documentation',
        priority: 'critical',
        icon: <Target className="w-5 h-5" />,
        actions: [
          'Complete report now',
          'Notify admin',
          'Contact parents'
        ],
        timeframe: 'Within 2 hours',
        confidence: 90
      })
    }

    // Suggestion 5: Positive Behavior Reinforcement
    if (['excellent_work', 'class_participation', 'helping_others', 'leadership'].includes(behaviorType)) {
      suggestions.push({
        id: 'positive-reinforcement',
        type: 'opportunity',
        title: 'Positive Behavior Recognition',
        description: `Celebrate ${studentName}'s positive behavior to encourage more`,
        priority: 'low',
        icon: <TrendingUp className="w-5 h-5" />,
        actions: [
          'Praise student',
          'Give reward',
          'Share with class'
        ],
        timeframe: 'This class period',
        confidence: 80
      })
    }

    // Suggestion 6: Time-Based Management
    const timeOfDay = currentBehavior.timeOfDay
    if (timeOfDay) {
      const timeBehaviors = behaviors.filter(b => b.timeOfDay === timeOfDay)
      const timeNegativeCount = timeBehaviors.filter(b => 
        ['fighting', 'bullying', 'disrupting_class'].includes(b.behaviorType)
      ).length
      
      if (timeNegativeCount > 1) {
        suggestions.push({
          id: 'time-management',
          type: 'scheduling',
          title: 'Time-Based Behavior Management',
          description: `${timeOfDay} periods show increased behavioral challenges`,
          priority: 'medium',
          icon: <Clock className="w-5 h-5" />,
          actions: [
            'Watch closely',
            'Add structure',
            'Give support'
          ],
          timeframe: 'Ongoing',
          confidence: 70
        })
      }
    }

    // Suggestion 7: Prevention Strategies
    if (studentBehaviors.length > 0) {
      const lastIncident = studentBehaviors[0]
      const daysSinceLastIncident = Math.floor(
        (new Date() - new Date(lastIncident.date || lastIncident.createdAt)) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceLastIncident < 3) {
        suggestions.push({
          id: 'prevention-strategy',
          type: 'prevention',
          title: 'Preventive Intervention Needed',
          description: `${studentName} has incidents within 3 days - implement prevention`,
          priority: 'high',
          icon: <Lightbulb className="w-5 h-5" />,
          actions: [
            'Check in daily',
            'Set behavior goals',
            'Give rewards'
          ],
          timeframe: 'Daily',
          confidence: 80
        })
      }
    }

    return suggestions
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "intervention":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "curriculum":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "safety":
        return "bg-red-100 text-red-800 border-red-200"
      case "opportunity":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduling":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "prevention":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (!currentBehavior) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg text-purple-900">Smart Suggestions</CardTitle>
          </div>
          <CardDescription className="text-purple-700">
            Contextual recommendations will appear here when logging behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <p className="text-purple-600">Start logging a behavior to get smart suggestions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg text-purple-900">Smart Suggestions</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={generateContextualSuggestions}
            disabled={isGenerating}
            className="border-purple-300 text-purple-700 hover:bg-purple-200"
          >
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
        <CardDescription className="text-purple-700">
          Quick tips based on what you're logging right now
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-purple-600 mt-2">Analyzing context and generating suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-4">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <p className="text-purple-600">No specific suggestions for this behavior</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-purple-600">
                      {suggestion.icon}
                    </div>
                    <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(suggestion.type)}>
                      {suggestion.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-600">Confidence</div>
                    <div className="text-sm font-medium text-purple-800">{suggestion.confidence}%</div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-purple-900 mb-2">{suggestion.title}</h4>
                <p className="text-sm text-purple-700 mb-3">{suggestion.description}</p>
                
                {/* Action steps */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-purple-800">Recommended Actions:</h5>
                  <ul className="space-y-1">
                    {suggestion.actions.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-purple-700">
                        <span className="w-4 h-4 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs text-purple-600 mb-2">
                    <span>Timeframe: {suggestion.timeframe}</span>
                    <span>Confidence: {suggestion.confidence}%</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      // Apply the top action from the suggestion
                      const topAction = suggestion.actions[0];
                      if (topAction) {
                        // Show success message and highlight the action
                        alert(`✅ Applied: ${topAction}\n\nThis action has been highlighted for immediate implementation.`);
                      }
                    }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Apply Top Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SmartSuggestions
