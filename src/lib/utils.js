import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

// Behavior-specific utilities
export function getBehaviorColor(behaviorType) {
  const colors = {
    // Positive behaviors - green shades
    excellent_work: "bg-green-100 text-green-800",
    class_participation: "bg-green-100 text-green-800",
    helping_others: "bg-green-100 text-green-800",
    leadership: "bg-green-100 text-green-800",
    creativity: "bg-green-100 text-green-800",
    respectful: "bg-green-100 text-green-800",
    organized: "bg-green-100 text-green-800",
    teamwork: "bg-green-100 text-green-800",
    
    // Neutral behaviors - blue shades
    late_to_class: "bg-blue-100 text-blue-800",
    absent: "bg-blue-100 text-blue-800",
    incomplete_work: "bg-blue-100 text-blue-800",
    
    // Negative behaviors - red/orange shades
    talking_in_class: "bg-yellow-100 text-yellow-800",
    not_listening: "bg-yellow-100 text-yellow-800",
    disrupting_class: "bg-orange-100 text-orange-800",
    using_phone: "bg-orange-100 text-orange-800",
    fighting: "bg-red-100 text-red-800",
    bullying: "bg-red-100 text-red-800",
    
    // Legacy support
    positive: "bg-green-100 text-green-800",
    participation: "bg-blue-100 text-blue-800",
    helpful: "bg-purple-100 text-purple-800",
    disruptive: "bg-yellow-100 text-yellow-800",
    aggressive: "bg-red-100 text-red-800",
    late: "bg-orange-100 text-orange-800",
  }
  return colors[behaviorType] || "bg-gray-100 text-gray-800"
}

export function calculatePositiveRate(behaviors) {
  if (!behaviors.length) return 0
  
  const positiveBehaviors = behaviors.filter(b => {
    const type = b.behaviorType || b.type
    return [
      'excellent_work', 'class_participation', 'helping_others', 
      'leadership', 'creativity', 'respectful', 'organized', 'teamwork',
      'positive', 'participation', 'helpful' // legacy support
    ].includes(type)
  })
  
  return Math.round((positiveBehaviors.length / behaviors.length) * 100)
}

export function groupBehaviorsByWeek(behaviors) {
  const groups = {}
  behaviors.forEach((behavior) => {
    const date = new Date(behavior.date)
    const week = getWeekNumber(date)
    const key = `${date.getFullYear()}-W${week}`

    if (!groups[key]) {
      groups[key] = { positive: 0, negative: 0, total: 0 }
    }

    if (["positive", "participation", "helpful"].includes(behavior.behaviorType)) {
      groups[key].positive++
    } else {
      groups[key].negative++
    }
    groups[key].total++
  })

  return Object.entries(groups).map(([key, data]) => ({
    week: key,
    ...data,
  }))
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}
