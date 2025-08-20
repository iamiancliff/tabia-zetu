import DashboardSidebar from "../components/DashboardSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Lightbulb, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Phone, 
  MessageCircle,
  FileText,
  Download,
  ExternalLink
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

const Help = () => {
  const { user } = useAuth()

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 pb-20 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full mb-4 transition-colors duration-200">
              <HelpCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h1 className="text-4xl font-bold text-teal-900 dark:text-teal-100 mb-2">Help & Support</h1>
            <p className="text-lg text-teal-600 dark:text-teal-400">Everything you need to know about TabiaZetu</p>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                  <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-teal-900 dark:text-teal-100">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-teal-700 dark:text-teal-300 mb-4">New to TabiaZetu? Get up and running in minutes.</p>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-200">
                  <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Live Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-700 dark:text-blue-300 mb-4">Get instant help from our support team.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Help Content */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-teal-200 dark:border-gray-600 shadow-lg transition-colors duration-200">
            <CardHeader>
              <CardTitle className="text-teal-900 dark:text-teal-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Help Center
              </CardTitle>
              <CardDescription className="text-teal-700 dark:text-teal-300">
                Comprehensive guides and tutorials for every feature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="getting-started" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-teal-50 dark:bg-teal-900/20 transition-colors duration-200">
                  <TabsTrigger value="getting-started" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                    Getting Started
                  </TabsTrigger>
                  <TabsTrigger value="features" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                    Contact
                  </TabsTrigger>
                </TabsList>

                {/* Getting Started Tab */}
                <TabsContent value="getting-started" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-teal-800 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        First Steps
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-teal-600 text-sm font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-teal-900">Complete Your Profile</h4>
                            <p className="text-sm text-teal-700">Add your school, county, and teaching subjects in Settings.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-teal-600 text-sm font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-teal-900">Add Your Students</h4>
                            <p className="text-sm text-teal-700">Register students in your classes with their details.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-teal-600 text-sm font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-teal-900">Start Logging Behaviors</h4>
                            <p className="text-sm text-teal-700">Record positive behaviors and areas for improvement.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-teal-800 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Pro Tips
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                          <p className="text-sm text-teal-800">
                            <strong>Consistency is key:</strong> Log behaviors regularly to get better insights and patterns.
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Use detailed notes:</strong> The more specific your observations, the better your reports will be.
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Review weekly:</strong> Check your reports regularly to identify trends and adjust strategies.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-teal-800">Core Features</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                          <Users className="w-5 h-5 text-teal-600" />
                          <div>
                            <h4 className="font-medium text-teal-900">Student Management</h4>
                            <p className="text-sm text-teal-700">Register and organize students by class</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-blue-900">Behavior Logging</h4>
                            <p className="text-sm text-blue-700">Track positive and concerning behaviors</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-green-900">Analytics & Reports</h4>
                            <p className="text-sm text-green-700">Visual insights and trend analysis</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-teal-800">Advanced Features</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-purple-600" />
                          <div>
                            <h4 className="font-medium text-purple-900">AI Suggestions</h4>
                            <p className="text-sm text-purple-700">Personalized recommendations based on data</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Download className="w-5 h-5 text-orange-600" />
                          <div>
                            <h4 className="font-medium text-orange-900">Export & Share</h4>
                            <p className="text-sm text-orange-700">Generate PDF reports and share with parents</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                          <Settings className="w-5 h-5 text-indigo-600" />
                          <div>
                            <h4 className="font-medium text-indigo-900">Customization</h4>
                            <p className="text-sm text-indigo-700">Personalize your dashboard and preferences</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-teal-800">Get in Touch</h3>
                      <p className="text-teal-700">Our support team is here to help you succeed with TabiaZetu.</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                          <Mail className="w-5 h-5 text-teal-600" />
                          <div>
                            <h4 className="font-medium text-teal-900">Email Support</h4>
                            <p className="text-sm text-teal-700">support@tabiazetu.co.ke</p>
                            <p className="text-xs text-teal-600">Response within 24 hours</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium text-blue-900">Phone Support</h4>
                            <p className="text-sm text-blue-700">+254 792 156 702</p>
                            <p className="text-xs text-blue-600">Mon-Fri, 8 AM - 6 PM EAT</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-teal-800">Additional Resources</h3>
                      
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start border-teal-200 text-teal-700 hover:bg-teal-50">
                          <FileText className="w-4 h-4 mr-2" />
                          User Manual (PDF)
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-teal-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-lg font-semibold text-teal-800">TabiaZetu</span>
              </div>
              <p className="text-sm text-teal-600 mb-2">Track. Understand. Improve.</p>
              <p className="text-xs text-teal-500">© 2025 TabiaZetu. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}

export default Help
