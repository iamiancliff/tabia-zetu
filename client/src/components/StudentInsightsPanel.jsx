import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, CheckCircle2 } from "lucide-react"

const confidenceToBadge = (confidence) => {
  if (confidence >= 75) return { label: "High", cls: "bg-green-100 text-green-800 border-green-200" }
  if (confidence >= 50) return { label: "Medium", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  return { label: "Low", cls: "bg-gray-100 text-gray-800 border-gray-200" }
}

const getStudentId = (b) => b.studentId || b.student?._id || b.student

const buildStudentInsights = (behaviors = [], students = []) => {
  const byStudent = new Map()
  behaviors.forEach((b) => {
    const sid = getStudentId(b)
    if (!sid) return
    if (!byStudent.has(sid)) byStudent.set(sid, [])
    byStudent.get(sid).push(b)
  })

  const results = []
  for (const [sid, logs] of byStudent.entries()) {
    const student = students.find((s) => (s._id || s.id) === sid) || {}
    const name = student?.name || logs[0]?.studentDisplayName || "Unknown Student"

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recent = logs.filter((l) => new Date(l.date || l.createdAt) >= weekAgo)
    let positives = 0
    let negatives = 0
    recent.forEach((l) => {
      const t = l.behaviorType
      if (["excellent_work","class_participation","helping_others","leadership","creativity","respectful","organized","teamwork"].includes(t)) positives++
      else if (["fighting","bullying","disrupting_class","using_phone","not_listening","talking_in_class"].includes(t)) negatives++
    })

    const trendUp = positives >= negatives
    const predictedTrend = trendUp ? "Improving participation and positive behavior" : "Risk of continued distractions"

    const total = recent.length
    const confidence = Math.min(90, Math.round((total >= 4 ? 60 : 40) + (trendUp ? positives : negatives) * 8))

    const actions = trendUp
      ? [
          "Encourage group participation",
          "Reward consistency",
          "Offer a leadership role in activities",
        ]
      : [
          "Schedule a one-on-one check-in",
          "Set clear, achievable behavior goals",
          "Use short, structured tasks during lessons",
        ]

    results.push({
      studentId: sid,
      name,
      predictedTrend,
      actions,
      confidence,
      recentCount: total,
      positives,
      negatives,
    })
  }

  return results.sort((a, b) => b.recentCount - a.recentCount)
}

const StudentInsightsPanel = ({ behaviors = [], students = [] }) => {
  const insights = useMemo(() => buildStudentInsights(behaviors, students), [behaviors, students])

  if (!behaviors?.length || !students?.length) return null

  return (
    <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          <CardTitle className="text-lg text-teal-900 dark:text-teal-100">Personalized Insights</CardTitle>
        </div>
        <CardDescription className="text-teal-700 dark:text-teal-300">
          Clear, actionable predictions and suggestions per student
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.length === 0 ? (
          <div className="text-teal-700 text-sm">No recent behavior data to analyze.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {insights.map((s) => {
              const conf = confidenceToBadge(s.confidence)
              return (
                <div key={s.studentId} className="rounded-lg border border-teal-200 dark:border-teal-600 bg-white dark:bg-teal-900/40 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-teal-900 dark:text-teal-100 font-semibold">{s.name}</div>
                      <div className="text-xs text-teal-600 dark:text-teal-300">{s.recentCount} recent logs</div>
                    </div>
                    <Badge variant="outline" className={`${conf.cls} capitalize`}>Confidence: {conf.label}</Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span className="font-medium">Predicted Trend:</span>
                    <span className="text-teal-700 dark:text-teal-300">{s.predictedTrend}</span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">Suggested Action:</span>
                    </div>
                    <ul className="space-y-1">
                      {s.actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-teal-700 dark:text-teal-300">
                          <span className="w-4 h-4 rounded-full bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] mt-0.5">{i + 1}</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-teal-600 dark:text-teal-300">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">+{s.positives} positive</Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">-{s.negatives} challenging</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentInsightsPanel


