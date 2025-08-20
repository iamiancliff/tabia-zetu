import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react"

const AIAnalysisSummary = ({ behaviors, students, insights = [], predictions = [] }) => {
  if (behaviors.length === 0) return null

  // Calculate quick metrics
  const totalBehaviors = behaviors.length
  const positiveBehaviors = behaviors.filter(b => 
    ['excellent_work', 'class_participation', 'helping_others', 'leadership', 'creativity', 'respectful', 'organized', 'teamwork'].includes(b.behaviorType)
  ).length
  const negativeBehaviors = behaviors.filter(b => 
    ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
  ).length
  const neutralBehaviors = totalBehaviors - positiveBehaviors - negativeBehaviors

  // Calculate behavior trends (last 7 days vs previous 7 days)
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

  const recentNegativeCount = recentBehaviors.filter(b => 
    ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
  ).length
  
  const previousNegativeCount = previousBehaviors.filter(b => 
    ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
  ).length

  const trendDirection = recentNegativeCount > previousNegativeCount ? 'up' : 'down'
  const trendPercentage = previousNegativeCount > 0 ? 
    Math.abs(Math.round(((recentNegativeCount - previousNegativeCount) / previousNegativeCount) * 100)) : 0

  // Count high-priority insights and predictions
  const highPriorityInsights = insights.filter(i => i.priority === 'high').length
  const highPriorityPredictions = predictions.filter(p => p.riskLevel === 'high').length
  const totalRecommendations = insights.length + predictions.length

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-lg text-indigo-900">AI Analysis Summary</CardTitle>
        </div>
        <CardDescription className="text-indigo-700">
          Quick overview of your classroom behavior data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Behavior Distribution */}
          <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-600">{totalBehaviors}</div>
            <div className="text-xs text-indigo-600">Total Behaviors</div>
            <div className="flex justify-center space-x-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
          </div>

          {/* Behavior Trend */}
          <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className={`w-4 h-4 ${trendDirection === 'up' ? 'text-red-500' : 'text-green-500'}`} />
              <span className={`text-lg font-bold ${trendDirection === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                {trendPercentage}%
              </span>
            </div>
            <div className="text-xs text-indigo-600">Negative Trend</div>
            <div className="text-xs text-indigo-500 mt-1">
              {trendDirection === 'up' ? 'Increasing' : 'Decreasing'}
            </div>
          </div>

          {/* High Priority Items */}
          <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-red-600">
              {highPriorityInsights + highPriorityPredictions}
            </div>
            <div className="text-xs text-indigo-600">High Priority</div>
            <div className="text-xs text-red-500 mt-1">Requires Attention</div>
          </div>

          {/* Total Recommendations */}
          <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-600">{totalRecommendations}</div>
            <div className="text-xs text-indigo-600">AI Recommendations</div>
            <div className="text-xs text-indigo-500 mt-1">Available</div>
          </div>
        </div>

        {/* Quick Status Indicators */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700">Analysis Status:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-700 font-medium">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700">Data Quality:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-700 font-medium">Good</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-indigo-700">Recommendations:</span>
            <div className="flex items-center space-x-2">
              {totalRecommendations > 0 ? (
                <>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-700 font-medium">{totalRecommendations} Available</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-700">None Yet</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {totalRecommendations > 0 && (
          <div className="mt-4 pt-3 border-t border-indigo-200">
            <div className="text-xs font-medium text-indigo-700 mb-2">Quick Actions:</div>
            <div className="flex flex-wrap gap-2">
              {highPriorityInsights > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {highPriorityInsights} High Priority Insights
                </Badge>
              )}
              {highPriorityPredictions > 0 && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {highPriorityPredictions} High Risk Predictions
                </Badge>
              )}
              {positiveBehaviors > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {positiveBehaviors} Positive Behaviors
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIAnalysisSummary
