"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

const ReportChart = ({ type = "line", data = [], title = "Chart", className = "" }) => {
  const [isExporting, setIsExporting] = useState(false)

  // Calculate insights from data
  const calculateInsights = () => {
    if (!data || data.length === 0) return null

    const totalPositive = data.reduce((sum, item) => sum + (item.positive || 0), 0)
    const totalNegative = data.reduce((sum, item) => sum + (item.negative || 0), 0)
    const totalBehaviors = totalPositive + totalNegative
    const positiveRate = totalBehaviors > 0 ? Math.round((totalPositive / totalBehaviors) * 100) : 0

    // Trend analysis (comparing first half vs second half)
    const midPoint = Math.floor(data.length / 2)
    const firstHalf = data.slice(0, midPoint)
    const secondHalf = data.slice(midPoint)

    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + (item.positive || 0), 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + (item.positive || 0), 0) / secondHalf.length

    const trend = secondHalfAvg > firstHalfAvg ? "improving" : secondHalfAvg < firstHalfAvg ? "declining" : "stable"
    const trendPercentage = firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0

    return {
      totalBehaviors,
      totalPositive,
      totalNegative,
      positiveRate,
      trend,
      trendPercentage: Math.abs(trendPercentage),
    }
  }

  const insights = calculateInsights()

  // Export to CSV function
  const exportToCSV = async () => {
    setIsExporting(true)

    try {
      // Prepare CSV data
      const headers = Object.keys(data[0] || {}).join(",")
      const rows = data.map((row) => Object.values(row).join(",")).join("\n")
      const csvContent = `${headers}\n${rows}`

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `${title.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`,
      )
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Export to PNG function (placeholder)
  const exportToPNG = () => {
    alert("PNG export feature coming soon! For now, you can use your browser's screenshot feature.")
  }

  const renderChart = () => {
    if (type === "bar") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend />
            <Bar dataKey="positive" fill="#10b981" name="Positive Behaviors" radius={[2, 2, 0, 0]} />
            <Bar dataKey="negative" fill="#ef4444" name="Negative Behaviors" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#10b981"
            strokeWidth={3}
            name="Positive Behaviors"
            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="#ef4444"
            strokeWidth={3}
            name="Negative Behaviors"
            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Available</h3>
          <p className="text-slate-500">Start logging behaviors to see insights here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${className}`}>
      {/* Chart Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={isExporting}>
              {isExporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "CSV"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPNG}>
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
          </div>
        </div>

        {/* Insights */}
        {insights && (
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-slate-50">
              📊 {insights.totalBehaviors} Total Behaviors
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ {insights.positiveRate}% Positive
            </Badge>
            {insights.trend !== "stable" && (
              <Badge
                variant="outline"
                className={`${
                  insights.trend === "improving"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-orange-50 text-orange-700 border-orange-200"
                }`}
              >
                {insights.trend === "improving" ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {insights.trend === "improving" ? "+" : "-"}
                {insights.trendPercentage}% this period
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="p-6">{renderChart()}</div>

      {/* Insight Summary */}
      {insights && insights.trend !== "stable" && (
        <div className="px-6 pb-6">
          <div
            className={`p-4 rounded-lg ${
              insights.trend === "improving"
                ? "bg-green-50 border border-green-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  insights.trend === "improving" ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                {insights.trend === "improving" ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    insights.trend === "improving" ? "text-green-800" : "text-orange-800"
                  }`}
                >
                  📈 Insight:{" "}
                  {insights.trend === "improving" ? "Positive behaviors increased" : "Needs attention decreased"} by{" "}
                  {insights.trendPercentage}% this period.
                </p>
                <p className={`text-xs mt-1 ${insights.trend === "improving" ? "text-green-600" : "text-orange-600"}`}>
                  {insights.trend === "improving"
                    ? "Keep up the great work! Your strategies are showing positive results."
                    : "Consider reviewing recent classroom management strategies and implementing new approaches."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportChart
