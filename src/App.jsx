"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext" // Keep useAuth import

import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import Students from "./pages/Students"
import BehaviorLog from "./pages/BehaviorLog"
import Reports from "./pages/Reports"
import Teachers from "./pages/Teachers"
import Settings from "./pages/Settings"
import AdminSettings from "./pages/AdminSettings"
import AdminDashboard from "./pages/AdminDashboard"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

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

// Help Page Component
const HelpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-teal-200 rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-teal-900 mb-6">Help & Support</h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-teal-800 mb-3">Getting Started</h2>
              <p className="text-teal-700">
                Welcome to TabiaZetu! This platform helps you track and understand student behavior patterns. Start by
                adding your students and logging their behaviors during class.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-teal-800 mb-3">Logging Behaviors</h2>
              <p className="text-teal-700">
                Use the Behavior Log section to record positive behaviors, concerns, and observations. The more detailed
                your logs, the better insights you'll receive.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-teal-800 mb-3">Understanding Reports</h2>
              <p className="text-teal-700">
                The Reports section provides visual analytics of behavior patterns over time. Use these insights to
                identify trends and adjust your teaching strategies.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-teal-800 mb-3">Contact Support</h2>
              <p className="text-teal-700">
                Need help? Contact us at support@tabiazetu.co.ke or call +254 700 000 000. We're here to help you
                succeed!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
            <Settings />
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
            <HelpPage />
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
