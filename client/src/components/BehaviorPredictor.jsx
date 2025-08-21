import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, Clock, Target, Users, Zap, Eye, Shield } from "lucide-react"
import { API_BASE_URL } from "../utils/api"

const BehaviorPredictor = ({ behaviors, students, onPredictionsGenerated }) => {
  const [predictions, setPredictions] = useState([])
  const [riskLevels, setRiskLevels] = useState({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (behaviors.length > 0 && students.length > 0) {
      generatePredictions()
    }
  }, [behaviors, students])

  useEffect(() => {
    if (onPredictionsGenerated && predictions.length > 0) {
      onPredictionsGenerated(predictions)
    }
  }, [predictions, onPredictionsGenerated])

  const generatePredictions = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI prediction analysis
      setTimeout(async () => {
        const newPredictions = analyzeBehaviorTrends()
        const newRiskLevels = calculateRiskLevels()
        
        // Save predictions to database
        const savedPredictions = await savePredictionsToDatabase(newPredictions)
        
        setPredictions(savedPredictions)
        setRiskLevels(newRiskLevels)
        setIsAnalyzing(false)
      }, 1500)
    } catch (error) {
      console.error('Error generating predictions:', error)
      setIsAnalyzing(false)
    }
  }

  const savePredictionsToDatabase = async (predictions) => {
    try {
      const savedPredictions = []
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No authentication token found, predictions will not be saved to database')
        return predictions
      }
      
      const apiUrl = API_BASE_URL
      
      for (const prediction of predictions) {
        const predictionData = {
          student: prediction.studentId || (students[0]?._id || students[0]?.id),
          riskLevel: prediction.riskLevel,
          riskScore: prediction.confidence,
          confidence: prediction.confidence,
          predictedBehavior: prediction.title,
          likelihood: prediction.confidence,
          timeframe: prediction.timeframe === '1-2 weeks' ? 'within_week' : 'within_month',
          riskFactors: prediction.preventiveActions.map(action => ({
            factor: action,
            weight: 1,
            description: action
          })),
          preventionStrategies: prediction.preventiveActions.map(action => ({
            strategy: action,
            priority: prediction.riskLevel === 'high' ? 'high' : 'medium',
            description: action,
            expectedOutcome: 'Reduced risk of negative behavior'
          })),
          analysisVersion: '1.0',
          dataSnapshot: {
            totalBehaviors: behaviors.length,
            recentBehaviors: behaviors.filter(b => {
              const date = new Date(b.date || b.createdAt)
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              return date >= weekAgo
            }).length,
            behaviorPatterns: [prediction.type],
            timeRange: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              end: new Date()
            }
          }
        }

        try {
          const response = await fetch(`${apiUrl}/behavior-predictions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(predictionData)
          })

          if (response.ok) {
            const savedPrediction = await response.json()
            savedPredictions.push({
              ...prediction,
              _id: savedPrediction._id,
              isSaved: true
            })
            console.log('✅ Prediction saved to database:', savedPrediction._id)
          } else {
            console.error('❌ Failed to save prediction:', response.status, response.statusText)
            // Add the prediction locally if database save fails
            savedPredictions.push({
              ...prediction,
              _id: `local_${Date.now()}_${Math.random()}`,
              isLocal: true
            })
          }
        } catch (fetchError) {
          console.error('❌ Network error saving prediction:', fetchError)
          // Add the prediction locally if network fails
          savedPredictions.push({
            ...prediction,
            _id: `local_${Date.now()}_${Math.random()}`,
            isLocal: true
          })
        }
      }
      
      return savedPredictions
    } catch (error) {
      console.error('❌ Error saving predictions to database:', error)
      return predictions // Return original predictions if saving fails
    }
  }

  const analyzeBehaviorTrends = () => {
    if (behaviors.length === 0) return []

    const predictions = []
    
    // Analyze recent behavior trends (last 7 days vs previous 7 days)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    
    const recentBehaviors = behaviors.filter(b => {
      const date = new Date(b.date || b.createdAt)
      return date >= weekAgo
    })
    
    const previousBehaviors = behaviors.filter(b => {
      const date = new Date(b.date || b.createdAt)
      return date >= twoWeeksAgo && date < weekAgo
    })

    // Prediction 1: Escalating behavior patterns
    const recentNegativeCount = recentBehaviors.filter(b => 
      ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
    ).length
    
    const previousNegativeCount = previousBehaviors.filter(b => 
      ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
    ).length
    
    if (recentNegativeCount > previousNegativeCount) {
      const increase = ((recentNegativeCount - previousNegativeCount) / Math.max(previousNegativeCount, 1)) * 100
      predictions.push({
        id: 'escalating-behaviors',
        type: 'warning',
        title: 'Escalating Negative Behaviors',
        description: `Negative behaviors have increased by ${Math.round(increase)}% in the last week`,
        confidence: Math.min(85, 60 + (increase * 0.5)),
        riskLevel: increase > 50 ? 'high' : 'medium',
        timeframe: '1-2 weeks',
        icon: <TrendingUp className="w-5 h-5" />,
        preventiveActions: [
          'Implement stricter classroom management protocols',
          'Increase positive reinforcement for good behavior',
          'Schedule individual student check-ins',
          'Consider parent-teacher conferences for repeat offenders'
        ],
        data: {
          recent: recentNegativeCount,
          previous: previousNegativeCount,
          increase: Math.round(increase)
        }
      })
    }

    // Prediction 2: Time-based risk patterns
    const timeAnalysis = {}
    recentBehaviors.forEach(b => {
      const timeOfDay = b.timeOfDay || 'Unknown'
      if (!timeAnalysis[timeOfDay]) {
        timeAnalysis[timeOfDay] = { total: 0, negative: 0 }
      }
      timeAnalysis[timeOfDay].total++
      if (['fighting', 'bullying', 'disrupting_class', 'using_phone'].includes(b.behaviorType)) {
        timeAnalysis[timeOfDay].negative++
      }
    })
    
    const highRiskTimes = Object.entries(timeAnalysis)
      .filter(([, data]) => data.total >= 3 && (data.negative / data.total) > 0.6)
      .sort(([,a], [,b]) => (b.negative / b.total) - (a.negative / a.total))
    
    if (highRiskTimes.length > 0) {
      predictions.push({
        id: 'time-based-risks',
        type: 'scheduling',
        title: 'High-Risk Time Periods Identified',
        description: `Certain times of day show significantly higher risk of negative behaviors`,
        confidence: 75,
        riskLevel: 'medium',
        timeframe: 'Ongoing',
        icon: <Clock className="w-5 h-5" />,
        preventiveActions: [
          `Increase supervision during ${highRiskTimes[0][0]} periods`,
          'Implement structured activities during high-risk times',
          'Consider schedule adjustments for challenging subjects',
          'Add transition activities between periods'
        ],
        data: {
          highRiskTimes: highRiskTimes.map(([time, data]) => ({
            time,
            riskPercentage: Math.round((data.negative / data.total) * 100),
            totalIncidents: data.total
          }))
        }
      })
    }

    // Prediction 3: Student-specific risk assessment
    const studentRiskScores = {}
    students.forEach(student => {
      const studentBehaviors = recentBehaviors.filter(b => 
        b.studentId === student._id || b.student?._id === student._id
      )
      
      if (studentBehaviors.length > 0) {
        let riskScore = 0
        let negativeCount = 0
        
        studentBehaviors.forEach(b => {
          if (['fighting', 'bullying', 'disrupting_class'].includes(b.behaviorType)) {
            riskScore += 3
            negativeCount++
          } else if (['using_phone', 'not_listening', 'talking_in_class'].includes(b.behaviorType)) {
            riskScore += 2
            negativeCount++
          } else if (['late_to_class', 'incomplete_work'].includes(b.behaviorType)) {
            riskScore += 1
          }
        })
        
        // Factor in frequency and recency
        const daysSinceLastIncident = studentBehaviors.length > 0 ? 
          Math.floor((now - new Date(Math.max(...studentBehaviors.map(b => new Date(b.date || b.createdAt))))) / (1000 * 60 * 60 * 24)) : 7
        
        if (daysSinceLastIncident < 3) riskScore += 2
        if (daysSinceLastIncident < 1) riskScore += 3
        
        studentRiskScores[student._id] = {
          name: student.name,
          riskScore,
          negativeCount,
          totalBehaviors: studentBehaviors.length,
          daysSinceLastIncident
        }
      }
    })
    
    const highRiskStudents = Object.entries(studentRiskScores)
      .filter(([, data]) => data.riskScore >= 5)
      .sort(([,a], [,b]) => b.riskScore - a.riskScore)
      .slice(0, 3)
    
    if (highRiskStudents.length > 0) {
      predictions.push({
        id: 'student-risk-assessment',
        type: 'intervention',
        title: 'Students at High Risk',
        description: `${highRiskStudents.length} students show elevated risk of future behavioral issues`,
        confidence: 80,
        riskLevel: 'high',
        timeframe: 'Immediate',
        icon: <Users className="w-5 h-5" />,
        preventiveActions: [
          'Schedule immediate one-on-one meetings',
          'Develop personalized behavior contracts',
          'Implement daily check-ins and progress tracking',
          'Coordinate with school counselors and parents',
          'Consider alternative learning arrangements if necessary'
        ],
        data: {
          highRiskStudents: highRiskStudents.map(([id, data]) => ({
            name: data.name,
            riskScore: data.riskScore,
            negativeCount: data.negativeCount,
            daysSinceLastIncident: data.daysSinceLastIncident
          }))
        }
      })
    }

    // Prediction 4: Subject-specific behavior forecasting
    const subjectAnalysis = {}
    recentBehaviors.forEach(b => {
      const subject = b.subject || 'No Subject'
      if (!subjectAnalysis[subject]) {
        subjectAnalysis[subject] = { total: 0, negative: 0, positive: 0 }
      }
      subjectAnalysis[subject].total++
      
      if (['excellent_work', 'class_participation', 'helping_others'].includes(b.behaviorType)) {
        subjectAnalysis[subject].positive++
      } else if (['fighting', 'bullying', 'disrupting_class', 'using_phone'].includes(b.behaviorType)) {
        subjectAnalysis[subject].negative++
      }
    })
    
    const problematicSubjects = Object.entries(subjectAnalysis)
      .filter(([, data]) => data.total >= 3 && (data.negative / data.total) > 0.4)
      .sort(([,a], [,b]) => (b.negative / b.total) - (a.negative / a.total))
    
    if (problematicSubjects.length > 0) {
      predictions.push({
        id: 'subject-behavior-forecast',
        type: 'curriculum',
        title: 'Subject-Specific Behavior Forecast',
        description: `Certain subjects may experience increased behavioral challenges`,
        confidence: 70,
        riskLevel: 'medium',
        timeframe: '2-4 weeks',
        icon: <Target className="w-5 h-5" />,
        preventiveActions: [
          `Review and revise ${problematicSubjects[0][0]} lesson plans`,
          'Increase engagement through interactive activities',
          'Provide additional support and resources',
          'Consider team-teaching or co-teaching approaches',
          'Implement differentiated instruction strategies'
        ],
        data: {
          problematicSubjects: problematicSubjects.map(([subject, data]) => ({
            subject,
            negativeRate: Math.round((data.negative / data.total) * 100),
            totalIncidents: data.total
          }))
        }
      })
    }

    return predictions
  }

  const calculateRiskLevels = () => {
    if (behaviors.length === 0) return {}
    
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentBehaviors = behaviors.filter(b => {
      const date = new Date(b.date || b.createdAt)
      return date >= weekAgo
    })
    
    const totalRisk = recentBehaviors.reduce((sum, b) => {
      if (['fighting', 'bullying'].includes(b.behaviorType)) return sum + 5
      if (['disrupting_class', 'using_phone'].includes(b.behaviorType)) return sum + 3
      if (['not_listening', 'talking_in_class'].includes(b.behaviorType)) return sum + 2
      if (['late_to_class', 'incomplete_work'].includes(b.behaviorType)) return sum + 1
      return sum
    }, 0)
    
    const maxPossibleRisk = recentBehaviors.length * 5
    const riskPercentage = Math.min(100, (totalRisk / Math.max(maxPossibleRisk, 1)) * 100)
    
    let overallRisk = 'low'
    if (riskPercentage > 60) overallRisk = 'high'
    else if (riskPercentage > 30) overallRisk = 'medium'
    
    return {
      overall: overallRisk,
      percentage: riskPercentage,
      totalIncidents: recentBehaviors.length,
      highSeverityCount: recentBehaviors.filter(b => b.severity === 'high').length
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
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
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "scheduling":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "intervention":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "curriculum":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleActOnPrediction = async (prediction) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please log in to perform this action')
        window.location.href = '/login'
        return
      }

      // Create a teacher action based on the prediction
      const actionData = {
        actionType: 'preventive_intervention',
        title: `Preventive Action: ${prediction.title}`,
        description: `Implementing preventive measures based on AI prediction: ${prediction.description}`,
        priority: prediction.riskLevel === 'high' || prediction.riskLevel === 'critical' ? 'high' : 'medium',
        urgency: prediction.riskLevel === 'critical' ? 'critical' : 'high',
        details: {
          predictionId: prediction.id,
          riskLevel: prediction.riskLevel,
          confidence: prediction.confidence,
          preventiveActions: prediction.preventiveActions,
          timeframe: prediction.timeframe
        },
        plannedAt: new Date().toISOString()
      }

      const response = await fetch(`${API_BASE_URL}/teacher-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(actionData)
      })

      if (response.ok) {
        try {
          const result = await response.json()
          alert('Preventive action created successfully!')
          console.log('Created teacher action:', result)
          // Optionally refresh the data or update the UI
        } catch (parseError) {
          console.error('Error parsing response:', parseError)
          alert('Action created but response parsing failed')
        }
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.')
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else {
        let errorMessage = 'Failed to create action'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch {
          // If we can't parse the error, use the status text
          errorMessage = `${errorMessage}: ${response.statusText}`
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error creating preventive action:', error)
      alert('Failed to create preventive action. Please try again.')
    }
  }

  if (behaviors.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-900">Behavior Predictor</CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            Start logging behaviors to enable AI-powered predictions and risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Shield className="w-12 h-12 mx-auto mb-3 text-orange-400" />
            <p className="text-orange-600">No data available for prediction analysis yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-900">Behavior Predictor</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={generatePredictions}
            disabled={isAnalyzing}
            className="border-orange-300 text-orange-700 hover:bg-orange-200"
          >
            {isAnalyzing ? 'Analyzing...' : 'Refresh Predictions'}
          </Button>
        </div>
        <CardDescription className="text-orange-700">
          AI-powered predictions and risk assessment for proactive behavior management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Risk Assessment */}
        {Object.keys(riskLevels).length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-orange-900">Overall Risk Assessment</h4>
              <Badge variant="outline" className={getRiskColor(riskLevels.overall)}>
                {riskLevels.overall} risk
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-700">Risk Level:</span>
                <span className="font-medium text-orange-800">{riskLevels.percentage}%</span>
              </div>
              <Progress value={riskLevels.percentage} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-600">Total Incidents:</span>
                  <span className="ml-2 font-medium text-orange-800">{riskLevels.totalIncidents}</span>
                </div>
                <div>
                  <span className="text-orange-600">High Severity:</span>
                  <span className="ml-2 font-medium text-orange-800">{riskLevels.highSeverityCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-orange-600 mt-2">AI is analyzing behavior patterns and generating predictions...</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-4">
            <Shield className="w-12 h-12 mx-auto mb-3 text-orange-400" />
            <p className="text-orange-600">No specific predictions available at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-white rounded-lg p-4 border border-orange-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-orange-600">
                      {prediction.icon}
                    </div>
                    <Badge variant="outline" className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel} risk
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(prediction.type)}>
                      {prediction.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-orange-600">Confidence</div>
                    <div className="text-sm font-medium text-orange-800">{prediction.confidence}%</div>
                  </div>
                </div>
                
                <h4 className="font-semibold text-orange-900 mb-2">{prediction.title}</h4>
                <p className="text-sm text-orange-700 mb-3">{prediction.description}</p>
                
                {/* Prediction data */}
                {prediction.data && (
                  <div className="mb-3 p-3 bg-orange-50 rounded-md">
                    <div className="text-xs font-medium text-orange-700 mb-2">Prediction Details:</div>
                    {prediction.id === 'escalating-behaviors' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-600">Recent incidents:</span>
                        <span className="font-medium text-orange-800">{prediction.data.recent}</span>
                        <span className="text-orange-600">Previous:</span>
                        <span className="font-medium text-orange-800">{prediction.data.previous}</span>
                        <span className="text-orange-600">Increase:</span>
                        <span className="font-medium text-orange-800">{prediction.data.increase}%</span>
                      </div>
                    )}
                    {prediction.id === 'student-risk-assessment' && (
                      <div className="space-y-2">
                        {prediction.data.highRiskStudents.map((student, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-orange-600">{student.name}:</span>
                            <span className="font-medium text-orange-800">Risk Score {student.riskScore}</span>
                            <span className="text-orange-500">({student.negativeCount} incidents)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Preventive actions */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-orange-800">Preventive Actions:</h5>
                  <ul className="space-y-1">
                    {prediction.preventiveActions.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-orange-700">
                        <span className="w-4 h-4 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-orange-200">
                  <div className="flex items-center justify-between text-xs text-orange-600 mb-2">
                    <span>Timeframe: {prediction.timeframe}</span>
                    <span>Confidence: {prediction.confidence}%</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => handleActOnPrediction(prediction)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Act on Prediction
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

export default BehaviorPredictor

