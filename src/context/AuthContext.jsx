"use client"

import { createContext, useContext, useState } from "react"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(null)

  const login = async (email, password) => {
    try {
      setLoading(true)

      // Check for admin auto-login
      if (email === "admin@tabiazetu.co.ke" && password === "admin123") {
        const adminUser = {
          id: "admin-1",
          email: "admin@tabiazetu.co.ke",
          firstName: "System",
          lastName: "Administrator",
          role: "admin",
          school: "TabiaZetu System",
          county: "Nairobi",
        }

        const mockToken = "admin-jwt-token-" + Date.now()

        localStorage.setItem("token", mockToken)
        localStorage.setItem("user", JSON.stringify(adminUser))

        setToken(mockToken)
        setUser(adminUser)

        return { success: true, user: adminUser }
      }

      // Try backend authentication first
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data.user))
          setToken(data.token)
          setUser(data.user)
          return { success: true, user: data.user }
        }
      } catch (backendError) {
        console.log("Backend not available, using mock authentication")
      }

      // Fallback to mock authentication
      const mockUser = {
        id: Date.now().toString(),
        email,
        firstName: email.split("@")[0].split(".")[0] || "Teacher",
        lastName: email.split("@")[0].split(".")[1] || "User",
        role: email.includes("admin") ? "admin" : "teacher",
        school: "Demo Primary School",
        county: "Nairobi",
      }

      const mockToken = "mock-jwt-token-" + Date.now()

      localStorage.setItem("token", mockToken)
      localStorage.setItem("user", JSON.stringify(mockUser))

      setToken(mockToken)
      setUser(mockUser)

      return { success: true, user: mockUser }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setLoading(true)

      // Validate required fields
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.school) {
        throw new Error("Please fill in all required fields")
      }

      // Try backend registration first
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data.user))
          setToken(data.token)
          setUser(data.user)
          return { success: true, user: data.user }
        }
      } catch (backendError) {
        console.log("Backend not available, using mock registration")
      }

      // Fallback to mock registration
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      if (existingUsers.some((user) => user.email === userData.email)) {
        throw new Error("An account with this email already exists")
      }

      const newUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        school: userData.school,
        county: userData.county || "",
        phoneNumber: userData.phoneNumber || "",
        teachingExperience: userData.teachingExperience || "",
        subjects: userData.subjects || [],
        role: "teacher",
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      existingUsers.push(newUser)
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

      const mockToken = "mock-jwt-token-" + Date.now()

      localStorage.setItem("token", mockToken)
      localStorage.setItem("user", JSON.stringify(newUser))

      setToken(mockToken)
      setUser(newUser)

      return { success: true, user: newUser }
    } catch (error) {
      console.error("Signup error:", error)
      return { success: false, error: error.message || "Signup failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const restoreSession = () => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
        return true
      } catch (error) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return false
      }
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    restoreSession,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
