import axios from "axios"

// Determine API base URL for different environments
const resolveApiBaseUrl = () => {
  // Highest priority: explicit env var at build time
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  // If running in the browser on a hosted domain, default to Render API
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    // Vercel (production/preview) frontends
    if (host.includes("vercel.app")) {
      return "https://tabia-zetu-api.onrender.com/api"
    }
  }

  // Local development fallback
  return "http://localhost:5000/api"
}

export const API_BASE_URL = resolveApiBaseUrl()

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
        }
        return Promise.reject(error.response?.data || error.message)
      },
    )
  }

  // Auth endpoints
  async login(credentials) {
    return this.api.post("/auth/login", credentials)
  }

  async register(userData) {
    return this.api.post("/auth/register", userData)
  }

  async getCurrentUser() {
    return this.api.get("/auth/me")
  }

  async updatePushSubscription(subscription) {
    return this.api.post("/auth/push-subscription", { subscription })
  }

  // Student endpoints
  async getStudents() {
    return this.api.get("/students")
  }

  async createStudent(studentData) {
    return this.api.post("/students", studentData)
  }

  async updateStudent(id, studentData) {
    return this.api.put(`/students/${id}`, studentData)
  }

  async deleteStudent(id) {
    return this.api.delete(`/students/${id}`)
  }

  // Behavior endpoints
  async getBehaviors(params = {}) {
    return this.api.get("/behaviors", { params })
  }

  async createBehavior(behaviorData) {
    return this.api.post("/behaviors", behaviorData)
  }

  async updateBehavior(id, behaviorData) {
    return this.api.put(`/behaviors/${id}`, behaviorData)
  }

  async deleteBehavior(id) {
    return this.api.delete(`/behaviors/${id}`)
  }

  async getBehaviorAnalytics(params = {}) {
    return this.api.get("/behaviors/analytics", { params })
  }

  // Reports endpoints
  async getComprehensiveReport(params = {}) {
    return this.api.get("/reports/comprehensive", { params })
  }

  async getStudentReport(studentId, params = {}) {
    return this.api.get(`/reports/student/${studentId}`, { params })
  }

  async downloadReport(format, params = {}) {
    const response = await this.api.get("/reports/comprehensive", {
      params: { ...params, format },
      responseType: "blob",
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `tabiazetu-report.${format}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  // Suggestions endpoints
  async getSuggestions(studentId) {
    return this.api.get(`/suggestions/${studentId}`)
  }

  async provideFeedback(suggestionId, feedback) {
    return this.api.post(`/suggestions/${suggestionId}/feedback`, { feedback })
  }

  // Notifications endpoints
  async getNotifications() {
    return this.api.get("/notifications")
  }

  async markNotificationAsRead(id) {
    return this.api.put(`/notifications/${id}/read`)
  }
}

export default new ApiService()
