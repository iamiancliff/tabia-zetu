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
    console.log("🔵 [FRONTEND LOGIN] Starting login process...")
    console.log("🔵 [FRONTEND LOGIN] Email:", email)
    console.log("🔵 [FRONTEND LOGIN] Password length:", password?.length || 0)
    
    try {
      setLoading(true)
      console.log("🔵 [FRONTEND LOGIN] Loading state set to true")

      // Check for admin auto-login
      if (email === "admin@tabiazetu.co.ke" && password === "admin123") {
        console.log("🔵 [FRONTEND LOGIN] Admin login detected, using mock admin")
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

        console.log("✅ [FRONTEND LOGIN] Admin login successful")
        return { success: true, user: adminUser }
      }

      // Try backend authentication first
      console.log("🔵 [FRONTEND LOGIN] Attempting backend authentication...")
      console.log("🔵 [FRONTEND LOGIN] API URL:", import.meta.env.VITE_API_URL || "http://localhost:5000/api")
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        const loginUrl = `${apiUrl}/auth/login`
        
        console.log("🔵 [FRONTEND LOGIN] Making request to:", loginUrl)
        console.log("🔵 [FRONTEND LOGIN] Request payload:", { email, password: "***" })
        
        const response = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        console.log("🔵 [FRONTEND LOGIN] Response status:", response.status)
        console.log("🔵 [FRONTEND LOGIN] Response headers:", Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const data = await response.json()
          console.log("✅ [FRONTEND LOGIN] Backend login successful")
          console.log("✅ [FRONTEND LOGIN] User data:", { ...data, token: "***" })
          
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data))
          setToken(data.token)
          setUser(data)
          return { success: true, user: data }
        } else {
          const errorData = await response.text()
          console.log("❌ [FRONTEND LOGIN] Backend login failed")
          console.log("❌ [FRONTEND LOGIN] Error response:", errorData)
          throw new Error(`Backend login failed: ${response.status} - ${errorData}`)
        }
      } catch (backendError) {
        console.log("❌ [FRONTEND LOGIN] Backend error:", backendError.message)
        console.log("🔵 [FRONTEND LOGIN] Falling back to mock authentication")
      }

      // Fallback to mock authentication
      console.log("🔵 [FRONTEND LOGIN] Using mock authentication")
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

      console.log("✅ [FRONTEND LOGIN] Mock login successful")
      return { success: true, user: mockUser }
    } catch (error) {
      console.error("❌ [FRONTEND LOGIN] Login error:", error)
      return { success: false, error: "Login failed. Please try again." }
    } finally {
      setLoading(false)
      console.log("🔵 [FRONTEND LOGIN] Loading state set to false")
    }
  }

  const signup = async (userData) => {
    console.log("🔵 [FRONTEND SIGNUP] Starting signup process...")
    console.log("🔵 [FRONTEND SIGNUP] User data:", { ...userData, password: "***" })
    
    try {
      setLoading(true)
      console.log("🔵 [FRONTEND SIGNUP] Loading state set to true")

      // Validate required fields
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.school) {
        console.log("❌ [FRONTEND SIGNUP] Validation failed - missing required fields")
        throw new Error("Please fill in all required fields")
      }

      console.log("✅ [FRONTEND SIGNUP] Validation passed")

      // Try backend registration first
      console.log("🔵 [FRONTEND SIGNUP] Attempting backend registration...")
      console.log("🔵 [FRONTEND SIGNUP] API URL:", import.meta.env.VITE_API_URL || "http://localhost:5000/api")
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        const registerUrl = `${apiUrl}/auth/register`
        
        console.log("🔵 [FRONTEND SIGNUP] Making request to:", registerUrl)
        console.log("🔵 [FRONTEND SIGNUP] Request payload:", { ...userData, password: "***" })
        
        const response = await fetch(registerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        console.log("🔵 [FRONTEND SIGNUP] Response status:", response.status)
        console.log("🔵 [FRONTEND SIGNUP] Response headers:", Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const data = await response.json()
          console.log("✅ [FRONTEND SIGNUP] Backend registration successful")
          console.log("✅ [FRONTEND SIGNUP] User data:", { ...data, token: "***" })
          
          localStorage.setItem("token", data.token)
          localStorage.setItem("user", JSON.stringify(data))
          setToken(data.token)
          setUser(data)
          return { success: true, user: data }
        } else {
          const errorData = await response.text()
          console.log("❌ [FRONTEND SIGNUP] Backend registration failed")
          console.log("❌ [FRONTEND SIGNUP] Error response:", errorData)
          throw new Error(`Backend registration failed: ${response.status} - ${errorData}`)
        }
      } catch (backendError) {
        console.log("❌ [FRONTEND SIGNUP] Backend error:", backendError.message)
        console.log("🔵 [FRONTEND SIGNUP] Falling back to mock registration")
      }

      // Fallback to mock registration
      console.log("🔵 [FRONTEND SIGNUP] Using mock registration")
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      if (existingUsers.some((user) => user.email === userData.email)) {
        console.log("❌ [FRONTEND SIGNUP] User already exists in mock storage")
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

      console.log("✅ [FRONTEND SIGNUP] Mock registration successful")
      return { success: true, user: newUser }
    } catch (error) {
      console.error("❌ [FRONTEND SIGNUP] Signup error:", error)
      return { success: false, error: error.message || "Signup failed. Please try again." }
    } finally {
      setLoading(false)
      console.log("🔵 [FRONTEND SIGNUP] Loading state set to false")
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
