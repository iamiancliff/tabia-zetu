/**
 * Generates a suggestion based on student's behavior patterns.
 * This is a simplified example. In a real application, this could involve
 * more complex AI/ML models or rule-based systems.
 *
 * @param {Object} student - The student object.
 * @param {Array<Object>} behaviorLogs - Recent behavior logs for the student.
 * @returns {Object} An object containing behaviorPattern, suggestionText, category, and priority.
 */
const generateSuggestion = (student, behaviorLogs) => {
  let behaviorPattern = "No clear pattern identified from recent logs."
  let suggestionText = "Continue to monitor behavior and provide consistent support."
  let category = "general"
  let priority = "low"

  const negativeBehaviors = behaviorLogs.filter((log) => log.behaviorType === "negative")
  const positiveBehaviors = behaviorLogs.filter((log) => log.behaviorType === "positive")

  if (negativeBehaviors.length > 0) {
    const commonNegativeBehavior = negativeBehaviors.reduce((acc, log) => {
      acc[log.notes] = (acc[log.notes] || 0) + 1
      return acc
    }, {})

    const sortedBehaviors = Object.entries(commonNegativeBehavior).sort(([, a], [, b]) => b - a)
    if (sortedBehaviors.length > 0) {
      behaviorPattern = `Frequent occurrence of "${sortedBehaviors[0][0]}" behavior.`
      priority = "high"
      category = "behavioral"

      if (sortedBehaviors[0][0].toLowerCase().includes("disruptive")) {
        suggestionText = `Implement a clear behavior management plan focusing on classroom rules and positive reinforcement for ${student.name}. Consider a quiet space for de-escalation.`
      } else if (sortedBehaviors[0][0].toLowerCase().includes("attention")) {
        suggestionText = `Increase positive attention and specific praise for ${student.name} when engaged in appropriate tasks. Explore strategies to meet attention needs constructively.`
      } else if (sortedBehaviors[0][0].toLowerCase().includes("academic")) {
        suggestionText = `Provide targeted academic support and break down tasks into smaller, manageable steps for ${student.name}. Check for understanding frequently.`
        category = "academic"
      } else {
        suggestionText = `Address the specific negative behavior: "${sortedBehaviors[0][0]}". Implement consistent consequences and teach alternative behaviors.`
      }
    }
  } else if (positiveBehaviors.length > 0) {
    behaviorPattern = "Consistent positive engagement and participation."
    suggestionText = `Continue to reinforce positive behaviors for ${student.name} through praise and recognition. Encourage peer mentorship.`
    category = "social"
    priority = "low"
  }

  // Example of time-based pattern
  const morningNegative = negativeBehaviors.filter((log) => log.timeOfDay === "morning").length
  if (morningNegative > negativeBehaviors.length / 2 && negativeBehaviors.length > 2) {
    behaviorPattern += " (More prevalent in mornings)."
    suggestionText += ` Consider adjusting morning routines or providing a calm start to the day for ${student.name}.`
    priority = "medium"
  }

  return { behaviorPattern, suggestionText, category, priority }
}

export default generateSuggestion;
