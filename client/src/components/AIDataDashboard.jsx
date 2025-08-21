import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Shield,
  LogIn
} from "lucide-react"
import { API_BASE_URL } from "../utils/api"

const AIDataDashboard = () => {
  const [activeTab, setActiveTab] = useState("insights")
  const [insights, setInsights] = useState([])
  const [predictions, setPredictions] = useState([])
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('No authentication token found - user needs to login')
        setInsights([])
        setPredictions([])
        setActions([])
        setStats({})
        return
      }
      
      // Load insights
      const insightsResponse = await fetch(`${API_BASE_URL}/ai-insights?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (insightsResponse.ok) {
        try {
          const insightsData = await insightsResponse.json()
          setInsights(insightsData.insights || [])
        } catch (parseError) {
          console.error('Error parsing insights response:', parseError)
          setInsights([])
        }
      } else if (insightsResponse.status === 401) {
        console.log('Token expired or invalid - user needs to re-login')
        localStorage.removeItem('token')
        setInsights([])
        setPredictions([])
        setActions([])
        setStats({})
        return
      } else {
        console.error('Insights response not ok:', insightsResponse.status)
        setInsights([])
      }

      // Load predictions
      const predictionsResponse = await fetch(`${API_BASE_URL}/behavior-predictions?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (predictionsResponse.ok) {
        try {
          const predictionsData = await predictionsResponse.json()
          setPredictions(predictionsData.predictions || [])
        } catch (parseError) {
          console.error('Error parsing predictions response:', parseError)
          setPredictions([])
        }
      } else if (predictionsResponse.status === 401) {
        console.log('Token expired or invalid - user needs to re-login')
        localStorage.removeItem('token')
        setInsights([])
        setPredictions([])
        setActions([])
        setStats({})
        return
      } else {
        console.error('Predictions response not ok:', predictionsResponse.status)
        setPredictions([])
      }

      // Load actions
      const actionsResponse = await fetch(`${API_BASE_URL}/teacher-actions?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (actionsResponse.ok) {
        try {
          const actionsData = await actionsResponse.json()
          setActions(actionsData.actions || [])
        } catch (parseError) {
          console.error('Error parsing actions response:', parseError)
          setActions([])
        }
      } else if (actionsResponse.status === 401) {
        console.log('Token expired or invalid - user needs to re-login')
        localStorage.removeItem('token')
        setInsights([])
        setPredictions([])
        setActions([])
        setStats({})
        return
      } else {
        console.error('Actions response not ok:', actionsResponse.status)
        setActions([])
      }

      // Load statistics
      await loadStats()
    } catch (error) {
      console.error('Error loading AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('No authentication token found for stats')
        return
      }
      
      const [insightsStats, predictionsStats, actionsStats] = await Promise.all([
        fetch(`${API_BASE_URL}/ai-insights/stats/overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/behavior-predictions/stats/overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/teacher-actions/stats/overview`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      const statsData = {
        insights: {},
        predictions: {},
        actions: {}
      }

      if (insightsStats.ok) {
        try {
          statsData.insights = await insightsStats.json()
        } catch (parseError) {
          console.error('Error parsing insights stats:', parseError)
        }
      }

      if (predictionsStats.ok) {
        try {
          statsData.predictions = await predictionsStats.json()
        } catch (parseError) {
          console.error('Error parsing predictions stats:', parseError)
        }
      }

      if (actionsStats.ok) {
        try {
          statsData.actions = await actionsStats.json()
        } catch (parseError) {
          console.error('Error parsing actions stats:', parseError)
        }
      }

      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "planned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-blue-600">Loading AI data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token')
  if (!token) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">AI Data Dashboard</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            View and manage your AI-generated insights, predictions, and actions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-blue-600 mb-4">
            <Shield className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-medium">Authentication Required</p>
            <p className="text-sm">Please log in to view AI data and insights</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">AI Data Dashboard</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            className="border-blue-300 text-blue-700 hover:bg-blue-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          View and manage your AI-generated insights, predictions, and actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">AI Insights ({insights.length})</TabsTrigger>
            <TabsTrigger value="predictions">Predictions ({predictions.length})</TabsTrigger>
            <TabsTrigger value="actions">Actions ({actions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.insights?.overview?.totalInsights || 0}
                </div>
                <div className="text-sm text-blue-600">Total Insights</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.insights?.overview?.appliedInsights || 0}
                </div>
                <div className="text-sm text-green-600">Applied</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.insights?.overview?.highPriorityInsights || 0}
                </div>
                <div className="text-sm text-red-600">High Priority</div>
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight._id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {insight.type}
                      </Badge>
                      {insight.isApplied && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(insight.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {insight.actions?.slice(0, 3).map((action, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {insights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No AI insights generated yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.predictions?.overview?.totalPredictions || 0}
                </div>
                <div className="text-sm text-blue-600">Total Predictions</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.predictions?.overview?.implementedPredictions || 0}
                </div>
                <div className="text-sm text-green-600">Implemented</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.predictions?.overview?.highRiskPredictions || 0}
                </div>
                <div className="text-sm text-red-600">High Risk</div>
              </div>
            </div>

            <div className="space-y-3">
              {predictions.map((prediction) => (
                <div key={prediction._id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(prediction.riskLevel)}>
                        {prediction.riskLevel}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                        Risk: {prediction.riskScore}%
                      </Badge>
                      {prediction.isImplemented && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Implemented
                        </Badge>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(prediction.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {prediction.predictedBehavior}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Student: {prediction.student?.name || 'Unknown'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {prediction.preventionStrategies?.slice(0, 3).map((strategy, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {strategy.strategy}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
              
              {predictions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No behavior predictions generated yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.actions?.overview?.totalActions || 0}
                </div>
                <div className="text-sm text-blue-600">Total Actions</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.actions?.overview?.completedActions || 0}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.actions?.overview?.inProgressActions || 0}
                </div>
                <div className="text-sm text-yellow-600">In Progress</div>
              </div>
            </div>

            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action._id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(action.status)}>
                        {action.status}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        {action.actionType}
                      </Badge>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(action.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{action.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                  
                  {action.details && (
                    <div className="text-xs text-gray-600 mb-2">
                      Details: {JSON.stringify(action.details)}
                    </div>
                  )}
                  
                  {action.outcome && (
                    <div className="text-xs">
                      <span className={`font-medium ${
                        action.outcome.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Outcome: {action.outcome.impact}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              
              {actions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No teacher actions recorded yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AIDataDashboard