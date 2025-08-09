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

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      const loginUrl = `${apiUrl}/auth/login`

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const message = await response.text().catch(() => "Login failed")
        return { success: false, error: message || "Invalid email or password" }
      }

      const data = await response.json()
      // Expect a real JWT
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data))
      setToken(data.token)
      setUser(data)
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: "Unable to reach the server" }
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
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.school) {
        console.log("❌ [FRONTEND SIGNUP] Validation failed - missing required fields")
        throw new Error("Please fill in all required fields")
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      const registerUrl = `${apiUrl}/auth/register`

      const response = await fetch(registerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const message = await response.text().catch(() => "Signup failed")
        return { success: false, error: message || "Signup failed" }
      }

      const data = await response.json()
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: error.message || "Signup failed. Please try again." }
    } finally {
      setLoading(false)
      console.log("🔵 [FRONTEND SIGNUP] Loading state set to false")
    }
  }

  const restoreSession = () => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    // Basic JWT shape validation: three segments separated by dots
    const looksLikeJwt = typeof storedToken === "string" && storedToken.split(".").length === 3

    if (looksLikeJwt && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
        return true
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return false
      }
    }

    // Clean up any mock/invalid tokens
    localStorage.removeItem("token")
    localStorage.removeItem("user")
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
