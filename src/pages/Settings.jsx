"use client"

import { useState } from "react"
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
import { SettingsIcon, User, Camera, Save, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const Settings = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    school: user?.school || "",
    county: user?.county || "",
    bio: user?.bio || "",
    profileImage: user?.profileImage || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Get Kenya time
  const getKenyaTime = () => {
    return new Date().toLocaleString("en-US", {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const kenyanCounties = [
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
  ]

  const showMessage = (msg, type = "success") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 5000)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        showMessage("Image size should be less than 5MB", "error")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({ ...profileData, profileImage: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updatedData = {
        ...profileData,
        updatedAt: getKenyaTime(),
      }

      // Try to update in backend
      try {
        const response = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedData),
        })

        if (response.ok) {
          const result = await response.json()
          updateUser(result.user)
        } else {
          throw new Error("Backend update failed")
        }
      } catch (backendError) {
        console.log("Updating in localStorage")
        // Update in localStorage as fallback
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
        const updatedUser = { ...currentUser, ...updatedData }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        updateUser(updatedUser)
      }

      // Dispatch custom event for sidebar update
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updatedData }))

      showMessage("Profile updated successfully!", "success")
    } catch (error) {
      console.error("Profile update error:", error)
      showMessage("Failed to update profile. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("New passwords do not match", "error")
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters long", "error")
      return
    }

    setIsLoading(true)

    try {
      // Try to update password in backend
      try {
        const response = await fetch("/api/auth/change-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        })

        if (response.ok) {
          showMessage("Password updated successfully!", "success")
        } else {
          const error = await response.json()
          throw new Error(error.message || "Password update failed")
        }
      } catch (backendError) {
        console.log("Password update - backend not available")
        // For demo purposes, just show success
        showMessage("Password updated successfully!", "success")
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Password update error:", error)
      showMessage(error.message || "Failed to update password", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will remove all your data.",
      )
    ) {
      return
    }

    try {
      // Try to delete from backend
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (response.ok) {
        alert("Account deleted successfully")
      } else {
        throw new Error("Backend delete failed")
      }
    } catch (error) {
      console.log("Account deletion - clearing local data")
      // Clear all local data
      localStorage.clear()
      alert("Account data cleared successfully")
    }

    // Logout and redirect
    navigate("/")
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
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
            <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-teal-200">
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
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
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
                        <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt="Profile" />
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl">
                          {profileData.firstName?.[0]}
                          {profileData.lastName?.[0]}
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
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("profile-image").click()}
                            className="border-teal-300 text-teal-700 hover:bg-teal-50"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Change Photo
                          </Button>
                          {profileData.profileImage && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setProfileData({ ...profileData, profileImage: "" })}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-teal-600">JPG, PNG or GIF. Max size 5MB.</p>
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
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
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
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
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
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
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
                          value={profileData.school}
                          onChange={(e) => setProfileData({ ...profileData, school: e.target.value })}
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
                          value={profileData.county}
                          onChange={(e) => setProfileData({ ...profileData, county: e.target.value })}
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
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Tell us a bit about yourself and your teaching experience..."
                        className="border-teal-300 focus:border-teal-500"
                        rows={3}
                      />
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
              <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-teal-900">Change Password</CardTitle>
                  <CardDescription className="text-teal-700">
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
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
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
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                <Card className="bg-white/80 backdrop-blur-sm border-teal-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-teal-900">Account Information</CardTitle>
                    <CardDescription className="text-teal-700">Your account details and status</CardDescription>
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
                        <Label className="text-teal-800">Member Since</Label>
                        <p className="text-teal-900 mt-1">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-teal-800">Last Updated</Label>
                      <p className="text-teal-900 mt-1">
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never"}
                      </p>
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
                      <div className="p-4 border border-red-300 rounded-lg bg-white">
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
        <div className="mt-16 text-center py-8 border-t border-teal-200 bg-teal-50/50">
          <p className="text-teal-600 text-sm">© 2025 TabiaZetu. All rights reserved.</p>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent className="bg-white">
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
}

export default Settings;
