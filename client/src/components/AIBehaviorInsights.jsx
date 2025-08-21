import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, TrendingUp, AlertTriangle, Users, Clock, Target, Brain, Sparkles } from "lucide-react"
import { API_BASE_URL } from "../utils/api"

const AIBehaviorInsights = ({ behaviors, students, onInsightsGenerated }) => {
  const [insights, setInsights] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (behaviors.length > 0 && students.length > 0) {
      generateInsights()
    }
  }, [behaviors, students])

  useEffect(() => {
    if (onInsightsGenerated && insights.length > 0) {
      onInsightsGenerated(insights)
    }
  }, [insights, onInsightsGenerated])

  const generateInsights = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis delay
      setTimeout(async () => {
        const newInsights = analyzeBehaviorPatterns()
        
        // Save insights to MongoDB
        const savedInsights = await saveInsightsToDatabase(newInsights)
        
        setInsights(savedInsights)
        setIsAnalyzing(false)
      }, 1000)
    } catch (error) {
      console.error('Error generating insights:', error)
      setIsAnalyzing(false)
    }
  }

  const saveInsightsToDatabase = async (insights) => {
    try {
      const savedInsights = []
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No authentication token found, insights will not be saved to database')
        return insights
      }
      
      const apiUrl = API_BASE_URL
      
      for (const insight of insights) {
        const insightData = {
          title: insight.title,
          description: insight.description,
          type: insight.type,
          priority: insight.priority,
          category: insight.category,
          confidence: 85, // Default confidence
          actions: insight.actions,
          data: insight.data,
          relatedBehaviors: behaviors.map(b => b._id || b.id),
          relatedStudents: students.map(s => s._id || s.id),
          analysisVersion: '1.0',
          dataSnapshot: {
            totalBehaviors: behaviors.length,
            totalStudents: students.length,
            timeRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              end: new Date()
            }
          }
        }

        try {
          const response = await fetch(`${apiUrl}/ai-insights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(insightData)
        })

        if (response.ok) {
          const savedInsight = await response.json()
          savedInsights.push(savedInsight)
            console.log('✅ Insight saved to database:', savedInsight._id)
          } else {
            console.error('❌ Failed to save insight:', response.status, response.statusText)
            // Add the insight locally if database save fails
            savedInsights.push({
              ...insight,
              _id: `local_${Date.now()}_${Math.random()}`,
              isLocal: true
            })
          }
        } catch (fetchError) {
          console.error('❌ Network error saving insight:', fetchError)
          // Add the insight locally if network fails
          savedInsights.push({
            ...insight,
            _id: `local_${Date.now()}_${Math.random()}`,
            isLocal: true
          })
        }
      }
      
      return savedInsights
    } catch (error) {
      console.error('❌ Error saving insights to database:', error)
      return insights // Return original insights if saving fails
    }
  }

  const analyzeBehaviorPatterns = () => {
    if (behaviors.length === 0) return []

    const insights = []
    
    // Analyze behavior frequency patterns
    const behaviorFrequency = {}
    const studentBehaviorCount = {}
    const subjectBehaviorPatterns = {}
    const timePatterns = {}
    const severityDistribution = {}

    behaviors.forEach(behavior => {
      // Count behavior types
      const type = behavior.behaviorType || 'other'
      behaviorFrequency[type] = (behaviorFrequency[type] || 0) + 1
      
      // Count per student
      const studentId = behavior.studentId || behavior.student?._id
      if (studentId) {
        studentBehaviorCount[studentId] = (studentBehaviorCount[studentId] || 0) + 1
      }
      
      // Subject patterns
      const subject = behavior.subject || 'No Subject'
      if (!subjectBehaviorPatterns[subject]) {
        subjectBehaviorPatterns[subject] = { positive: 0, negative: 0, neutral: 0 }
      }
      
      // Categorize behavior types
      if (['excellent_work', 'class_participation', 'helping_others', 'leadership', 'creativity', 'respectful', 'organized', 'teamwork'].includes(type)) {
        subjectBehaviorPatterns[subject].positive++
      } else if (['fighting', 'bullying', 'disrupting_class', 'using_phone'].includes(type)) {
        subjectBehaviorPatterns[subject].negative++
      } else {
        subjectBehaviorPatterns[subject].neutral++
      }
      
      // Time patterns
      const timeOfDay = behavior.timeOfDay || 'Unknown'
      timePatterns[timeOfDay] = (timePatterns[timeOfDay] || 0) + 1
      
      // Severity distribution
      const severity = behavior.severity || 'low'
      severityDistribution[severity] = (severityDistribution[severity] || 0) + 1
    })

    // Generate insights based on patterns
    const totalBehaviors = behaviors.length
    const totalStudents = students.length

    // Insight 1: High-frequency behavior types
    const topBehaviors = Object.entries(behaviorFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    if (topBehaviors.length > 0) {
      insights.push({
        id: 'behavior-frequency',
        type: 'pattern',
        title: 'Most Common Behavior Patterns',
        description: `Focus on the most frequent behaviors to improve classroom management`,
        priority: topBehaviors[0][1] > totalBehaviors * 0.3 ? 'high' : 'medium',
        category: 'behavior-analysis',
        icon: <TrendingUp className="w-5 h-5" />,
        actions: [
          `Address ${topBehaviors[0][0].replace(/_/g, ' ')} behaviors first`,
          'Create prevention strategies',
          'Set up monitoring system'
        ],
        data: topBehaviors.map(([type, count]) => ({
          label: type.replace(/_/g, ' '),
          value: count,
          percentage: Math.round((count / totalBehaviors) * 100)
        }))
      })
    }

    // Insight 2: Students with multiple incidents
    const studentsWithMultipleIncidents = Object.entries(studentBehaviorCount)
      .filter(([, count]) => count > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
    
    if (studentsWithMultipleIncidents.length > 0) {
      const studentNames = studentsWithMultipleIncidents.map(([id, count]) => {
        const student = students.find(s => s._id === id)
        return student ? student.name : 'Unknown Student'
      })
      
      insights.push({
        id: 'student-focus',
        type: 'intervention',
        title: 'Students Needing Attention',
        description: `These students have multiple behavior incidents and may need additional support`,
        priority: 'high',
        category: 'student-support',
        icon: <Users className="w-5 h-5" />,
        actions: [
          `Meet with ${studentNames[0]} this week`,
          'Create improvement plan',
          'Contact parents if needed'
        ],
        data: studentsWithMultipleIncidents.map(([id, count]) => {
          const student = students.find(s => s._id === id)
          return {
            label: student ? student.name : 'Unknown',
            value: count,
            type: 'incidents'
          }
        })
      })
    }

    // Insight 3: Subject-specific patterns
    const subjectsWithIssues = Object.entries(subjectBehaviorPatterns)
      .filter(([, patterns]) => patterns.negative > patterns.positive)
      .sort(([,a], [,b]) => b.negative - a.negative)
    
    if (subjectsWithIssues.length > 0) {
      insights.push({
        id: 'subject-patterns',
        type: 'curriculum',
        title: 'Subject-Specific Behavior Challenges',
        description: `Certain subjects show higher negative behavior rates`,
        priority: 'medium',
        category: 'curriculum-adjustment',
        icon: <Target className="w-5 h-5" />,
        actions: [
          `Review ${subjectsWithIssues[0][0]} lessons`,
          'Add more activities',
          'Increase support during class'
        ],
        data: subjectsWithIssues.map(([subject, patterns]) => ({
          label: subject,
          positive: patterns.positive,
          negative: patterns.negative,
          neutral: patterns.neutral
        }))
      })
    }

    // Insight 4: Time-based patterns
    const mostProblematicTime = Object.entries(timePatterns)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (mostProblematicTime) {
      insights.push({
        id: 'time-patterns',
        type: 'scheduling',
        title: 'Time-Based Behavior Patterns',
        description: `Behaviors tend to cluster around specific times of day`,
        priority: 'medium',
        category: 'scheduling-optimization',
        icon: <Clock className="w-5 h-5" />,
        actions: [
          `Watch ${mostProblematicTime[0]} periods closely`,
          'Adjust activities if needed',
          'Add transition time'
        ],
        data: [{
          label: mostProblematicTime[0],
          value: mostProblematicTime[1],
          percentage: Math.round((mostProblematicTime[1] / totalBehaviors) * 100)
        }]
      })
    }

    // Insight 5: Severity distribution
    const highSeverityCount = severityDistribution.high || 0
    if (highSeverityCount > 0) {
      insights.push({
        id: 'severity-alert',
        type: 'alert',
        title: 'High Severity Incidents Detected',
        description: `${highSeverityCount} high-severity incidents require immediate attention`,
        priority: 'high',
        category: 'safety',
        icon: <AlertTriangle className="w-5 h-5" />,
        actions: [
          'Review incidents today',
          'Monitor students closely',
          'Contact admin if needed'
        ],
        data: [{
          label: 'High Severity',
          value: highSeverityCount,
          type: 'critical'
        }]
      })
    }

    // Insight 6: Positive behavior opportunities
    const positiveBehaviors = Object.entries(behaviorFrequency)
      .filter(([type]) => ['excellent_work', 'class_participation', 'helping_others', 'leadership', 'creativity', 'respectful', 'organized', 'teamwork'].includes(type))
      .reduce((sum, [, count]) => sum + count, 0)
    
    if (positiveBehaviors > 0) {
      insights.push({
        id: 'positive-reinforcement',
        type: 'opportunity',
        title: 'Positive Behavior Recognition',
        description: `Celebrate and reinforce positive behaviors to encourage more`,
        priority: 'low',
        category: 'positive-reinforcement',
        icon: <Sparkles className="w-5 h-5" />,
        actions: [
          `Celebrate ${positiveBehaviors} good behaviors`,
          'Give rewards',
          'Share with class'
        ],
        data: [{
          label: 'Positive Behaviors',
          value: positiveBehaviors,
          percentage: Math.round((positiveBehaviors / totalBehaviors) * 100)
        }]
      })
    }

    return insights
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
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
      case "pattern":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "intervention":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "curriculum":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "scheduling":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "alert":
        return "bg-red-100 text-red-800 border-red-200"
      case "opportunity":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (behaviors.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-lg text-teal-900">AI Behavior Insights</CardTitle>
          </div>
          <CardDescription className="text-teal-700">
            Start logging behaviors to receive AI-powered insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-teal-400" />
            <p className="text-teal-600">No data available for analysis yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-lg text-teal-900">AI Behavior Insights</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={generateInsights}
            disabled={isAnalyzing}
            className="border-teal-300 text-teal-700 hover:bg-teal-200"
          >
            {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </Button>
        </div>
        <CardDescription className="text-teal-700">
          Simple, actionable insights to help manage your classroom
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-teal-600 mt-2">AI is analyzing behavior patterns...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-4">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-teal-400" />
            <p className="text-teal-600">No specific insights available at this time</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white rounded-lg p-4 border border-teal-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-teal-600">
                      {insight.icon}
                    </div>
                    <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                      {insight.priority} priority
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                  </div>
                </div>
                
                <h4 className="font-semibold text-teal-900 mb-2">{insight.title}</h4>
                <p className="text-sm text-teal-700 mb-3">{insight.description}</p>
                
                {/* Data visualization */}
                {insight.data && insight.data.length > 0 && (
                  <div className="mb-3 p-3 bg-teal-50 rounded-md">
                    <div className="text-xs font-medium text-teal-700 mb-2">Key Metrics:</div>
                    <div className="flex flex-wrap gap-2">
                      {insight.data.map((item, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs">
                          <span className="font-medium text-teal-800">{item.label}:</span>
                          <span className="text-teal-600">{item.value}</span>
                          {item.percentage && (
                            <span className="text-teal-500">({item.percentage}%)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action steps */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-teal-800">Recommended Actions:</h5>
                  <ul className="space-y-1">
                    {insight.actions.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-teal-700">
                        <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-teal-200">
                  <Button 
                    size="sm" 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={async () => {
                      // Apply the top recommendation to help teachers
                      const topAction = insight.actions[0];
                      if (topAction) {
                        try {
                          // Save the action to MongoDB
                          const response = await fetch(`/api/ai-insights/${insight._id}/apply`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                              appliedAction: topAction,
                              feedback: {
                                rating: 5,
                                comment: 'Applied top recommendation'
                              }
                            })
                          })

                          if (response.ok) {
                            const result = await response.json()
                            alert(`✅ Applied: ${topAction}\n\nThis action has been saved to your action log and marked as implemented.`);
                            
                            // Update the insight to show it's been applied
                            insight.isApplied = true;
                            setInsights([...insights]); // Trigger re-render
                          } else {
                            alert(`❌ Error: Could not save action to database`);
                          }
                        } catch (error) {
                          console.error('Error applying insight:', error)
                          alert(`❌ Error: Could not save action to database`);
                        }
                      }
                    }}
                  >
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

export default AIBehaviorInsights

