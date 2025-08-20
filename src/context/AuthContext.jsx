import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"

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
  const [loading, setLoading] = useState(true) // Start with loading true
  const [token, setToken] = useState(null)

  // Memoize user object to prevent unnecessary re-renders
  const memoizedUser = useMemo(() => {
    if (!user) return null
    
    // Create a stable reference for user object
    return {
      ...user,
      // Ensure streams is always an array
      streams: Array.isArray(user.streams) ? user.streams : [],
      // Ensure dates are properly formatted
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }, [user?.id, user?.email, user?.firstName, user?.lastName, user?.school, user?.county, user?.bio, user?.streams, user?.profileImage])

  // Restore session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const restored = restoreSession()
      if (restored) {
        // Refresh user data from server to ensure we have the latest profile data
        await refreshUserData()
      } else {
        setLoading(false)
      }
    }
    
    initializeSession()
  }, []) // Keep empty dependencies to avoid circular issues

  const login = async (email, password) => {
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
      
      // Ensure we have the complete user profile data
      if (data.profileImage || data.bio || data.streams) {
        // Dispatch event to update sidebar and other components
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: data }))
      }
      
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: "Unable to reach the server" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    try {
      setLoading(true)
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.school) {
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
        setLoading(false) // Ensure loading is set to false
        return true
      } catch (error) {
        console.error("❌ [AUTH CONTEXT] Error parsing stored user data:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setLoading(false)
        return false
      }
    }

    // Clean up any mock/invalid tokens
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setLoading(false)
    return false
  }

  const refreshUserData = useCallback(async () => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      return false
    }

    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        setLoading(false)
        return true
      } else {
        // Token might be expired, clear it
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        setToken(null)
        setLoading(false)
        return false
      }
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error refreshing user data:", error)
      setLoading(false)
      return false
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const updateUser = useCallback((updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
    
    // Dispatch event to update sidebar and other components
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedUser }))
    
    return { success: true, user: updatedUser }
  }, [user])

  const updateProfileImage = useCallback((imageData) => {
    const updatedUser = { ...user, profileImage: imageData }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
    
    // Dispatch event to update sidebar and other components
    window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedUser }))
    
    return { success: true, user: updatedUser }
  }, [user])

  const value = {
    user: memoizedUser,
    login,
    signup,
    logout,
    loading,
    restoreSession,
    updateUser,
    updateProfileImage,
    isAuthenticated: !!memoizedUser,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
