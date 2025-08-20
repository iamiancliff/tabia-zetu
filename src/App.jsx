import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Keep useAuth import
import { lazy, Suspense } from "react"
import React from "react" // Added for ErrorBoundary
import { AlertTriangle } from "lucide-react" // Added for ErrorBoundary

import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import Students from "./pages/Students"
import BehaviorLog from "./pages/BehaviorLog"
import Reports from "./pages/Reports"
import Teachers from "./pages/Teachers"
import AdminSettings from "./pages/AdminSettings"
import AdminDashboard from "./pages/AdminDashboard"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Help from "./pages/Help"

// Lazy load Settings component to improve performance
const Settings = lazy(() => import("./pages/Settings"))

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-teal-700">Loading...</p>
    </div>
  </div>
)

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">
              We encountered an error while loading this page. Please try refreshing or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-teal-700">Loading...</p>
        </div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/" replace />
}

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-teal-700">Loading...</p>
        </div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  // Check if user is admin
  const isAdmin = user?.role === "admin" // Use user.role from backend
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}



function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/behavior-log"
        element={
          <ProtectedRoute>
            <BehaviorLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

// Dashboard Router Component to handle admin vs teacher dashboard
const DashboardRouter = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin" // Use user.role from backend
  return isAdmin ? <AdminDashboard /> : <Dashboard />
}

export default App
