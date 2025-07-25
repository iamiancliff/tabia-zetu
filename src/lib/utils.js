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
  const positive = behaviors.filter((b) => ["positive", "participation", "helpful"].includes(b.behaviorType)).length
  return Math.round((positive / behaviors.length) * 100)
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
