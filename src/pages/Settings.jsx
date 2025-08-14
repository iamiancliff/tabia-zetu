import React, { useState, useEffect, useCallback, useMemo } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings as SettingsIcon, User, Camera, Save, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const Settings = React.memo(() => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  // Add loading state check
  if (!user) {
    return (
      <DashboardSidebar>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300">Loading user data...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  // Initialize profile data once when component mounts or user changes
  const [profileData, setProfileData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    school: user?.school || "",
    county: user?.county || "",
    bio: user?.bio || "",
    streams: Array.isArray(user?.streams) ? user.streams : [],
    profileImage: user?.profileImage || "",
  }))

  // Update profileData when user data changes - only run when user actually changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        school: user.school || "",
        county: user.county || "",
        bio: user.bio || "",
        streams: Array.isArray(user.streams) ? user.streams : [],
        profileImage: user.profileImage || "",
      })
    }
  }, [user?.id]) // Only depend on user ID to prevent infinite loops

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setMessage("")
      setIsLoading(false)
    }
  }, [])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Memoize Kenya counties to prevent recreation on every render
  const kenyanCounties = useMemo(() => [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Machakos",
    "Meru",
    "Nyeri",
    "Kericho",
    "Embu",
  ], [])

  // Get Kenya time - memoized to prevent recreation
  const getKenyaTime = useCallback(() => {
    return new Date().toLocaleString("en-US", {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }, [])

  const showMessage = useCallback((msg, type = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }, [])

  // Optimized image upload handler with debouncing
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size should be less than 5MB", "error")
      return
    }

    // Show loading state
    setIsLoading(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          // Process image for consistent dimensions and quality
          const processedImageData = await processImage(e.target.result)
          
          // Upload to backend
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
          const response = await fetch(`${apiUrl}/auth/upload-image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              imageData: processedImageData,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            
            // Update local state
            setProfileData(prev => ({ ...prev, profileImage: processedImageData }))
            
            // Update user context
            const updatedUser = { ...user, profileImage: processedImageData }
            updateUser(updatedUser)
            
            // Update localStorage
            localStorage.setItem("user", JSON.stringify(updatedUser))
            
            showMessage("Profile picture updated successfully!", "success")
          } else {
            const error = await response.json().catch(() => null)
            throw new Error((error && error.message) || "Failed to upload image")
          }
        } catch (error) {
          showMessage(error.message || "Failed to upload image", "error")
        } finally {
          setIsLoading(false)
        }
      }
      
      reader.onerror = () => {
        showMessage("Failed to read image file", "error")
        setIsLoading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      showMessage("Failed to upload image", "error")
      setIsLoading(false)
    }
  }, [showMessage, user, updateUser])

  // Separate function to process image to prevent blocking
  const processImage = useCallback((dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        try {
          const maxDim = 256
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          
          // Calculate dimensions maintaining aspect ratio
          let { width, height } = img
          if (width > height) {
            if (width > maxDim) {
              height = (height * maxDim) / width
              width = maxDim
            }
          } else {
            if (height > maxDim) {
              width = (width * maxDim) / height
              height = maxDim
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to high-quality PNG with consistent quality
          const processedDataUrl = canvas.toDataURL("image/png", 0.9)
          
          resolve(processedDataUrl)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }
      
      img.src = dataUrl
    })
  }, [])


  const handleProfileUpdate = useCallback(async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updatedData = {
        ...profileData,
        updatedAt: getKenyaTime(),
      }

      // Try to update in backend
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        
        const response = await fetch(`${apiUrl}/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedData),
        })

        if (response.ok) {
          const result = await response.json()
          
          const userPayload = {
            ...user,
            ...result,
            updatedAt: new Date().toISOString(),
            token: result.token || localStorage.getItem("token"),
          }
          
          localStorage.setItem("user", JSON.stringify(userPayload))
          updateUser(userPayload)
          
          // Dispatch profile update event for dashboard
          window.dispatchEvent(new CustomEvent("profileUpdated", { detail: userPayload }))
          
          showMessage("Profile updated successfully!", "success")
        } else {
          const error = await response.json().catch(() => null)
          throw new Error((error && error.message) || "Backend update failed")
        }
      } catch (backendError) {
        console.error("Backend update failed:", backendError)
        // Update in localStorage as fallback
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
        const updatedUser = { ...currentUser, ...updatedData }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        updateUser(updatedUser)
        
        // Dispatch profile update event for dashboard
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedUser }))
        
        showMessage("Profile updated locally (backend unavailable)", "success")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      showMessage("Failed to update profile. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }, [profileData, getKenyaTime, user, updateUser, showMessage])



  const handlePasswordUpdate = useCallback(async (e) => {
    e.preventDefault()

    // Get current password data from the form
    const formData = new FormData(e.target)
    const currentPassword = formData.get('currentPassword') || passwordData.currentPassword
    const newPassword = formData.get('newPassword') || passwordData.newPassword
    const confirmPassword = formData.get('confirmPassword') || passwordData.confirmPassword

    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match", "error")
      return
    }

    if (newPassword.length < 6) {
      showMessage("Password must be at least 6 characters long", "error")
      return
    }

    setIsLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update token if new one is provided
        if (result.token) {
          localStorage.setItem("token", result.token)
        }
        showMessage("Password updated successfully!", "success")
        
        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const error = await response.json().catch(() => null)
        throw new Error((error && error.message) || "Password update failed")
      }
    } catch (error) {
      console.error("Password update error:", error)
      showMessage(error.message || "Failed to update password", "error")
    } finally {
      setIsLoading(false)
    }
  }, [showMessage]) // Removed passwordData dependency to prevent infinite loops

  const handleDeleteAccount = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will remove all your data.",
      )
    ) {
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      const response = await fetch(`${apiUrl}/auth/delete-account`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
      })

      if (response.ok) {
        showMessage("Account deleted successfully", "success")
        // Clear all local data and redirect
        localStorage.clear()
        setTimeout(() => {
          navigate("/")
        }, 2000)
      } else {
        const error = await response.json().catch(() => null)
        throw new Error((error && error.message) || "Failed to delete account")
      }
    } catch (error) {
      console.error("Account deletion error:", error)
      showMessage(error.message || "Failed to delete account", "error")
    }
  }, [showMessage, navigate])

  const exportProfileData = useCallback(() => {
    const data = [
      ["Field", "Value"],
      ["First Name", user?.firstName || "N/A"],
      ["Last Name", user?.lastName || "N/A"],
      ["Email", user?.email || "N/A"],
      ["School", user?.school || "N/A"],
      ["County", user?.county || "N/A"],
      ["Bio", user?.bio || "N/A"],
      ["Classes/Streams", (user?.streams || []).join(", ") || "N/A"],
      ["Member Since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"],
      ["Last Updated", user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"],
    ];

    // Convert to CSV format
    const csvContent = data.map(row => row.map(field => `"${field}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user?.firstName || "user"}-${user?.lastName || "profile"}-data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("Profile data exported successfully as CSV!", "success");
  }, [user, showMessage]);

  const exportAccountSummary = useCallback(() => {
    const data = [
      ["Account Information", ""],
      ["Account Type", user?.email === "admin@tabiazetu.co.ke" ? "Administrator" : "Teacher"],
      ["Account Status", "Active"],
      ["Member Since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"],
      ["Last Updated", user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never"],
      ["Email", user?.email || "N/A"],
      ["School", user?.school || "N/A"],
      ["Bio", user?.bio || "N/A"],
      ["Classes/Streams", (user?.streams || []).join(", ") || "N/A"],
      ["", ""],
      ["Export Date", new Date().toLocaleDateString()],
      ["Export Time", new Date().toLocaleTimeString()],
    ];

    // Convert to CSV format
    const csvContent = data.map(row => row.map(field => `"${field}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user?.firstName || "user"}-${user?.lastName || "account"}-summary.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("Account summary exported successfully as CSV!", "success");
  }, [user, showMessage]);


  // Memoized input handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback((field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handlePasswordInputChange = useCallback((field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleStreamsChange = useCallback((stream, checked) => {
    setProfileData(prev => {
      const currentStreams = prev.streams || [];
      if (checked && !currentStreams.includes(stream)) {
        return {
          ...prev,
          streams: [...currentStreams, stream]
        }
      } else if (!checked && currentStreams.includes(stream)) {
        return {
          ...prev,
          streams: currentStreams.filter(s => s !== stream)
        }
      }
      return prev;
    })
  }, []) // Removed profileData.streams dependency to prevent infinite loops

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 dark:bg-teal-700/50 rounded-2xl flex items-center justify-center transition-colors duration-200">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-teal-100 text-lg">Manage your account and preferences</p>
              </div>
            </div>
          </div>

          {message && (
            <Alert
              className={`${messageType === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
            >
              {messageType === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription className={messageType === "success" ? "text-green-700" : "text-red-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-teal-800/80 border border-teal-200 dark:border-teal-600 transition-colors duration-200">
              <TabsTrigger value="profile" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Profile Settings
              </TabsTrigger>
              <TabsTrigger value="password" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Change Password
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                Account Management
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                <CardHeader>
                  <CardTitle className="text-teal-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-teal-700">
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-24 h-24 border-4 border-teal-200">
                        {profileData.profileImage && 
                         profileData.profileImage !== "" && 
                         profileData.profileImage !== "undefined" && 
                         profileData.profileImage !== "null" ? (
                          <AvatarImage 
                            src={profileData.profileImage} 
                            alt="Profile" 
                            className="object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : null}
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-semibold">
                          {(profileData.firstName || "")[0] || ""}
                          {(profileData.lastName || "")[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Label className="text-teal-800">Profile Picture</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="profile-image"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("profile-image").click()}
                            className="border-teal-300 text-teal-700 hover:bg-teal-50"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4 mr-2" />
                                Change Photo
                              </>
                            )}
                          </Button>
                          {profileData.profileImage && profileData.profileImage !== "" && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setProfileData({ ...profileData, profileImage: "" })
                                // Also update user context and localStorage
                                const updatedUser = { ...user, profileImage: "" }
                                updateUser(updatedUser)
                                localStorage.setItem("user", JSON.stringify(updatedUser))
                              }}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                              disabled={isLoading}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-teal-600">
                          {isLoading ? "Processing image..." : "JPG, PNG or GIF. Max size 5MB. Will be resized to 256x256 for consistency."}
                        </p>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-teal-800">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName || ""}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="border-teal-300 focus:border-teal-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-teal-800">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName || ""}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="border-teal-300 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-teal-800">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="border-teal-300 focus:border-teal-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="school" className="text-teal-800">
                          School Name
                        </Label>
                        <Input
                          id="school"
                          value={profileData.school || ""}
                          onChange={(e) => handleInputChange("school", e.target.value)}
                          className="border-teal-300 focus:border-teal-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="county" className="text-teal-800">
                          County
                        </Label>
                        <select
                          id="county"
                          value={profileData.county || ""}
                          onChange={(e) => handleInputChange("county", e.target.value)}
                          className="w-full px-3 py-2 border border-teal-300 rounded-md focus:border-teal-500 focus:outline-none"
                        >
                          <option value="">Select County</option>
                          {kenyanCounties.map((county) => (
                            <option key={county} value={county}>
                              {county}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-teal-800">
                        Bio (Optional)
                      </Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio || ""}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        placeholder="Tell us a bit about yourself and your teaching experience..."
                        className="border-teal-300 focus:border-teal-500"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="streams" className="text-teal-800">
                        Classes/Streams You Teach
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"].map((stream) => (
                          <label key={stream} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.streams && profileData.streams.includes(stream)}
                              onChange={(e) => handleStreamsChange(stream, e.target.checked)}
                              className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-teal-700">{stream}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-teal-600">Select all the classes you currently teach</p>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Settings */}
            <TabsContent value="password">
              <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                <CardHeader>
                  <CardTitle className="text-teal-900 dark:text-teal-100">Change Password</CardTitle>
                  <CardDescription className="text-teal-700 dark:text-teal-300">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-teal-800">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                        className="border-teal-300 focus:border-teal-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-teal-800">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                        className="border-teal-300 focus:border-teal-500"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-teal-800">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                        className="border-teal-300 focus:border-teal-500"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Management */}
            <TabsContent value="account">
              <div className="space-y-6">
                {/* Account Info */}
                <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                  <CardHeader>
                    <CardTitle className="text-teal-900 dark:text-teal-100">Account Information</CardTitle>
                    <CardDescription className="text-teal-700 dark:text-teal-300">Your account details and status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-teal-800">Account Type</Label>
                        <div className="mt-1">
                          <Badge className="bg-teal-100 text-teal-800">
                            {user?.email === "admin@tabiazetu.co.ke" ? "Administrator" : "Teacher"}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-teal-800">Account Status</Label>
                        <div className="mt-1">
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-teal-800">Member Since</Label>
                        <p className="text-teal-900 mt-1">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-teal-800">Last Updated</Label>
                        <p className="text-teal-900 mt-1">
                          {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-teal-800">Email</Label>
                        <p className="text-teal-900 mt-1">{user?.email || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-teal-800">School</Label>
                        <p className="text-teal-900 mt-1">{user?.school || "N/A"}</p>
                      </div>
                    </div>
                    {user?.bio && (
                      <div>
                        <Label className="text-teal-800">Bio</Label>
                        <p className="text-teal-900 mt-1 bg-teal-50 p-3 rounded-md">{user.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Data Export */}
                <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                  <CardHeader>
                    <CardTitle className="text-teal-900 dark:text-teal-100">Data Export</CardTitle>
                    <CardDescription className="text-teal-700 dark:text-teal-300">Export your data for backup or analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-teal-300 rounded-lg bg-teal-50">
                        <h4 className="font-medium text-teal-900 mb-2">Export Profile Data</h4>
                        <p className="text-teal-700 text-sm mb-4">
                          Download your profile information, settings, and preferences.
                        </p>
                        <Button
                          onClick={() => exportProfileData()}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Export Profile
                        </Button>
                      </div>
                      <div className="p-4 border border-teal-300 rounded-lg bg-teal-50">
                        <h4 className="font-medium text-teal-900 mb-2">Export Account Summary</h4>
                        <p className="text-teal-700 text-sm mb-4">
                          Get a comprehensive summary of your account activity and data.
                        </p>
                        <Button
                          onClick={() => exportAccountSummary()}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Export Summary
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-red-50 border-red-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-red-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-700">Irreversible and destructive actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-red-300 rounded-lg bg-white dark:bg-red-900/20 transition-colors duration-200">
                        <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                        <p className="text-red-700 text-sm mb-4">
                          Once you delete your account, there is no going back. This will permanently delete your
                          account and remove all your data from our servers.
                        </p>
                        <Button
                          onClick={() => setShowDeleteAccount(true)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-teal-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-lg font-semibold text-teal-800">TabiaZetu</span>
            </div>
            <p className="text-sm text-teal-600 mb-2">Track. Understand. Improve.</p>
            <p className="text-xs text-teal-500">© 2025 TabiaZetu. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="bg-white dark:bg-teal-800 transition-colors duration-200">
          <DialogHeader>
            <DialogTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-red-700">
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Your profile and account information</li>
                <li>• All student records and behavior logs</li>
                <li>• Generated reports and analytics</li>
                <li>• Settings and preferences</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAccount(false)}
                className="border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardSidebar>
  )
})

export default Settings;
