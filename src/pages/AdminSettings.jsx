import { useState, useEffect } from "react"
import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../context/AuthContext"
import {
  Settings,
  User,
  Shield,
  Building,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Database,
  Users,
  School,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

const AdminSettings = () => {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  // Update adminProfile when user data changes
  useEffect(() => {
    if (user) {
      setAdminProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        organization: user.organization || "TabiaZetu Administration",
        position: user.position || "System Administrator",
        bio: user.bio || "",
        streams: user.streams || [],
        location: user.location || "Nairobi, Kenya",
      })
      setImagePreview(user.profileImage || "")
    }
  }, [user])

  const [adminProfile, setAdminProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    position: "System Administrator",
    bio: "",
    streams: [],
    location: "",
  })

  const [systemSettings, setSystemSettings] = useState({
    allowTeacherRegistration: true,
    requireSchoolApproval: false,
    enableNotifications: true,
    enableDataExport: true,
    maintenanceMode: false,
    backupFrequency: "daily",
  })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target.result
        setImagePreview(imageData)
        
        // Update user context immediately for better persistence
        updateUser({ profileImage: imageData })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const updatedData = {
        ...adminProfile,
        profileImage: imagePreview,
        updatedAt: new Date().toLocaleString("en-US", {
          timeZone: "Africa/Nairobi",
        }),
      }

      const result = await updateUser(updatedData)
      if (result.success) {
        setMessage("Admin profile updated successfully!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Failed to update profile. Please try again.")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      setMessage("An error occurred while updating your profile.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSystemSettingsUpdate = async () => {
    setIsLoading(true)
    try {
      // Save system settings to backend or localStorage
      localStorage.setItem("systemSettings", JSON.stringify(systemSettings))
      setMessage("System settings updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("System settings update error:", error)
      setMessage("Failed to update system settings.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-teal-900 dark:via-teal-800 dark:to-teal-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 rounded-2xl p-6 text-white shadow-lg transition-colors duration-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 dark:bg-teal-700/50 rounded-2xl flex items-center justify-center transition-colors duration-200">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Administrator Settings</h1>
                <p className="text-teal-100 dark:text-teal-200 text-lg">Manage your profile and system configuration</p>
              </div>
            </div>
          </div>

          {message && (
            <Alert
              className={message.includes("success") ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}
            >
              <AlertDescription className={message.includes("success") ? "text-green-700" : "text-red-700"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin Profile */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-900 dark:text-teal-100">
                    <User className="w-5 h-5" />
                    Administrator Profile
                  </CardTitle>
                  <CardDescription className="text-teal-700 dark:text-teal-300">
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-24 h-24 border-4 border-teal-200">
                        <AvatarImage 
                          src={imagePreview && imagePreview !== "" && imagePreview !== "undefined" && imagePreview !== "null" ? imagePreview : undefined} 
                          alt="Profile" 
                          className="object-cover"
                          onError={(e) => {
                            console.log("Admin settings profile image failed to load, using fallback")
                            e.target.style.display = 'none'
                          }}
                        />
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-semibold">
                          {adminProfile.firstName?.[0]}
                          {adminProfile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="profile-image" className="text-teal-800 font-medium">
                          Profile Picture
                        </Label>
                        <div className="mt-2">
                          <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("profile-image").click()}
                            className="border-teal-300 text-teal-700 hover:bg-teal-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
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
                          value={adminProfile.firstName}
                          onChange={(e) => setAdminProfile({ ...adminProfile, firstName: e.target.value })}
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
                          value={adminProfile.lastName}
                          onChange={(e) => setAdminProfile({ ...adminProfile, lastName: e.target.value })}
                          className="border-teal-300 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-teal-800">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-teal-500" />
                        <Input
                          id="email"
                          type="email"
                          value={adminProfile.email}
                          onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                          className="pl-10 border-teal-300 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-teal-800">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-teal-500" />
                        <Input
                          id="phone"
                          value={adminProfile.phone}
                          onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                          className="pl-10 border-teal-300 focus:border-teal-500"
                          placeholder="+254 700 000 000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-teal-800">
                        Organization
                      </Label>
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-3 text-teal-500" />
                        <Input
                          id="organization"
                          value={adminProfile.organization}
                          onChange={(e) => setAdminProfile({ ...adminProfile, organization: e.target.value })}
                          className="pl-10 border-teal-300 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-teal-800">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-teal-500" />
                        <Input
                          id="location"
                          value={adminProfile.location}
                          onChange={(e) => setAdminProfile({ ...adminProfile, location: e.target.value })}
                          className="pl-10 border-teal-300 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-teal-800">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={adminProfile.bio}
                        onChange={(e) => setAdminProfile({ ...adminProfile, bio: e.target.value })}
                        className="border-teal-300 focus:border-teal-500"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="streams" className="text-teal-800">
                        Classes/Streams You Manage
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8"].map((stream) => (
                          <label key={stream} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={adminProfile.streams.includes(stream)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAdminProfile({
                                    ...adminProfile,
                                    streams: [...adminProfile.streams, stream]
                                  })
                                } else {
                                  setAdminProfile({
                                    ...adminProfile,
                                    streams: adminProfile.streams.filter(s => s !== stream)
                                  })
                                }
                              }}
                              className="rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm text-teal-700">{stream}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-sm text-teal-600">Select all the classes you currently manage</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isLoading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* System Settings */}
            <div className="space-y-6">
              <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-900 dark:text-teal-100">
                    <Settings className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription className="text-teal-700 dark:text-teal-300">Configure system-wide preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-teal-800">Teacher Registration</Label>
                      <p className="text-sm text-teal-600">Allow new teachers to register</p>
                    </div>
                    <Switch
                      checked={systemSettings.allowTeacherRegistration}
                      onCheckedChange={(checked) =>
                        setSystemSettings({ ...systemSettings, allowTeacherRegistration: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-teal-800">School Approval</Label>
                      <p className="text-sm text-teal-600">Require admin approval for schools</p>
                    </div>
                    <Switch
                      checked={systemSettings.requireSchoolApproval}
                      onCheckedChange={(checked) =>
                        setSystemSettings({ ...systemSettings, requireSchoolApproval: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-teal-800">Notifications</Label>
                      <p className="text-sm text-teal-600">Enable system notifications</p>
                    </div>
                    <Switch
                      checked={systemSettings.enableNotifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings({ ...systemSettings, enableNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-teal-800">Data Export</Label>
                      <p className="text-sm text-teal-600">Allow data export features</p>
                    </div>
                    <Switch
                      checked={systemSettings.enableDataExport}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enableDataExport: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-teal-800">Maintenance Mode</Label>
                      <p className="text-sm text-teal-600">Enable maintenance mode</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                    />
                  </div>

                  <Button
                    onClick={handleSystemSettingsUpdate}
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-white/80 dark:bg-teal-800/80 backdrop-blur-sm border-teal-200 dark:border-teal-600 shadow-lg transition-colors duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-900 dark:text-teal-100">
                    <Database className="w-5 h-5" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span className="text-teal-800">Total Teachers</span>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <School className="w-4 h-4 text-teal-600" />
                      <span className="text-teal-800">Total Schools</span>
                    </div>
                    <Badge className="bg-teal-100 text-teal-800">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-teal-600" />
                      <span className="text-teal-800">System Status</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default AdminSettings;
