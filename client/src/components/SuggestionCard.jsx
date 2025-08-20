import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, CheckCircle, Clock, AlertTriangle } from "lucide-react"

const SuggestionCard = ({ suggestion = {} }) => {
  // Provide default values to prevent errors
  const {
    id = "default",
    title = "No suggestions available",
    description = "Check back later for personalized recommendations.",
    priority = "medium",
    category = "general",
    actions = [],
    estimatedTime = "5 minutes",
    difficulty = "easy",
  } = suggestion

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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "hard":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-600" />
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <Badge variant="outline" className={getPriorityColor(priority)}>
              {priority} priority
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            {getDifficultyIcon(difficulty)}
            <span>{estimatedTime}</span>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category:</span>
            <Badge variant="secondary" className="capitalize">
              {category}
            </Badge>
          </div>

          {/* Action Steps */}
          {actions && actions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recommended Actions:</h4>
              <ul className="space-y-1">
                {actions.map((action, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
              Apply Suggestion
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SuggestionCard;
