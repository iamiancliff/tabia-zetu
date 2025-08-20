import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  Activity,
  Shield,
  Target,
  Lightbulb,
  BarChart3
} from "lucide-react"

const AIDashboardStatus = ({ behaviors, students, insights, predictions }) => {
  if (behaviors.length === 0) return null

  // Calculate system health metrics
  const totalBehaviors = behaviors.length
  const totalStudents = students.length
  
  // Behavior distribution
  const positiveBehaviors = behaviors.filter(b => 
    ['excellent_work', 'class_participation', 'helping_others', 'leadership', 'creativity', 'respectful', 'organized', 'teamwork'].includes(b.behaviorType)
  ).length
  
  const negativeBehaviors = behaviors.filter(b => 
    ['fighting', 'bullying', 'disrupting_class', 'using_phone', 'not_listening'].includes(b.behaviorType)
  ).length
  
  const neutralBehaviors = totalBehaviors - positiveBehaviors - negativeBehaviors

  // AI system metrics
  const totalInsights = insights.length
  const totalPredictions = predictions.length
  const highPriorityItems = insights.filter(i => i.priority === 'high').length + 
                           predictions.filter(p => p.riskLevel === 'high').length
  
  const aiConfidence = totalInsights + totalPredictions > 0 ? 
    Math.round(((insights.reduce((sum, i) => sum + (i.confidence || 0), 0) + 
                 predictions.reduce((sum, p) => sum + (p.confidence || 0), 0)) / 
                (totalInsights + totalPredictions))) : 0

  // System health score
  const systemHealthScore = Math.min(100, Math.max(0, 
    (positiveBehaviors / Math.max(totalBehaviors, 1)) * 40 + 
    (totalInsights / Math.max(totalBehaviors, 1)) * 30 + 
    (totalPredictions / Math.max(totalBehaviors, 1)) * 30
  ))

  // Recent activity (last 7 days)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentBehaviors = behaviors.filter(b => {
    const date = new Date(b.date || b.createdAt)
    return date >= weekAgo
  }).length

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthStatus = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  const getHealthBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-slate-600" />
            <CardTitle className="text-lg text-slate-900">AI System Status</CardTitle>
          </div>
          <Badge variant="outline" className={getHealthBadgeColor(systemHealthScore)}>
            {getHealthStatus(systemHealthScore)}
          </Badge>
        </div>
        <CardDescription className="text-slate-700">
          System health and performance overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Health Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800">System Health</h4>
            <span className={`text-lg font-bold ${getHealthColor(systemHealthScore)}`}>
              {Math.round(systemHealthScore)}%
            </span>
          </div>
          <Progress value={systemHealthScore} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-slate-700">Data Quality</div>
              <div className="text-slate-500">{totalBehaviors > 0 ? 'Good' : 'None'}</div>
            </div>
            <div>
              <div className="font-medium text-slate-700">AI Analysis</div>
              <div className="text-slate-500">{totalInsights > 0 ? 'Active' : 'Idle'}</div>
            </div>
            <div>
              <div className="font-medium text-slate-700">Predictions</div>
              <div className="text-slate-500">{totalPredictions > 0 ? 'Active' : 'Idle'}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-600">{totalBehaviors}</div>
            <div className="text-xs text-slate-500">Total Behaviors</div>
            <div className="flex justify-center space-x-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-600">{totalStudents}</div>
            <div className="text-xs text-slate-500">Students</div>
            <Users className="w-4 h-4 mx-auto mt-1 text-slate-400" />
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-600">{totalInsights}</div>
            <div className="text-xs text-slate-500">AI Insights</div>
            <Lightbulb className="w-4 h-4 mx-auto mt-1 text-slate-400" />
          </div>

          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-2xl font-bold text-slate-600">{totalPredictions}</div>
            <div className="text-xs text-slate-500">Predictions</div>
            <Target className="w-4 h-4 mx-auto mt-1 text-slate-400" />
          </div>
        </div>

        {/* Behavior Distribution */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">Behavior Distribution</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-slate-600">Positive</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-800">{positiveBehaviors}</span>
                <span className="text-slate-500">({Math.round((positiveBehaviors / Math.max(totalBehaviors, 1)) * 100)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-slate-600">Negative</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-800">{negativeBehaviors}</span>
                <span className="text-slate-500">({Math.round((negativeBehaviors / Math.max(totalBehaviors, 1)) * 100)}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-slate-600">Neutral</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-800">{neutralBehaviors}</span>
                <span className="text-slate-500">({Math.round((neutralBehaviors / Math.max(totalBehaviors, 1)) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Metrics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">AI Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800">{aiConfidence}%</div>
                <div className="text-xs text-slate-500">Confidence</div>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800">{highPriorityItems}</div>
                <div className="text-xs text-slate-500">High Priority</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">Recent Activity</h4>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Last 7 days</span>
              </div>
              <span className="font-medium text-slate-800">{recentBehaviors} behaviors</span>
            </div>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Data Collection:</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-700 font-medium">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">AI Analysis:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${totalInsights > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className={`font-medium ${totalInsights > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                  {totalInsights > 0 ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Predictions:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${totalPredictions > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className={`font-medium ${totalPredictions > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                  {totalPredictions > 0 ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Recommendations:</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${totalInsights + totalPredictions > 0 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className={`font-medium ${totalInsights + totalPredictions > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                  {totalInsights + totalPredictions > 0 ? 'Available' : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIDashboardStatus
