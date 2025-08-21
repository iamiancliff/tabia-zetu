import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import studentRoutes from "./routes/students.js"
import behaviorRoutes from "./routes/behaviors.js"
import adminRoutes from "./routes/admin.js"
import reportRoutes from "./routes/reports.js"
import suggestionRoutes from "./routes/suggestions.js"
import aiInsightRoutes from "./routes/ai-insights.js"
import behaviorPredictionRoutes from "./routes/behavior-predictions.js"
import teacherActionRoutes from "./routes/teacher-actions.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tabiazetu", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1) // Exit process with failure
  })

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log("🔵 [SERVER] Incoming request:", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })
  next()
})

// Middleware
// CORS with flexible origin check to support Vercel previews
app.use(
  cors({
    origin: (origin, callback) => {
      const staticAllowed = [
        process.env.CLIENT_URL || "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://tabia-zetu.vercel.app",
        "https://tabia-zetu-git-main-iamiancliffs-projects.vercel.app",
        process.env.FRONTEND_URL,
      ].filter(Boolean)

      const allowedPatterns = [/\.vercel\.app$/]

      // Allow non-browser requests (no origin header)
      if (!origin) return callback(null, true)

      const isAllowed =
        staticAllowed.includes(origin) ||
        allowedPatterns.some((re) => {
          try { return re.test(new URL(origin).hostname) } catch { return false }
        })

      if (isAllowed) {
        callback(null, true)
      } else {
        console.warn("⚠️ [CORS] Blocked origin:", origin)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes with error handling
try {
  console.log("Attempting to load auth routes...")
  app.use("/api/auth", authRoutes)
  console.log("✅ Auth routes loaded")

  console.log("Attempting to load student routes...")
  app.use("/api/students", studentRoutes)
  console.log("✅ Student routes loaded")

  console.log("Attempting to load behavior routes...")
  app.use("/api/behaviors", behaviorRoutes)
  console.log("✅ Behavior routes loaded")

  console.log("Attempting to load admin routes...")
  app.use("/api/admin", adminRoutes)
  console.log("✅ Admin routes loaded")

  console.log("Attempting to load report routes...")
  app.use("/api/reports", reportRoutes)
  console.log("✅ Report routes loaded")

  console.log("Attempting to load suggestion routes...")
  app.use("/api/suggestions", suggestionRoutes)
  console.log("✅ Suggestion routes loaded")

  console.log("Attempting to load AI insight routes...")
  app.use("/api/ai-insights", aiInsightRoutes)
  console.log("✅ AI insight routes loaded")

  console.log("Attempting to load behavior prediction routes...")
  app.use("/api/behavior-predictions", behaviorPredictionRoutes)
  console.log("✅ Behavior prediction routes loaded")

  console.log("Attempting to load teacher action routes...")
  app.use("/api/teacher-actions", teacherActionRoutes)
  console.log("✅ Teacher action routes loaded")
} catch (error) {
  console.error("❌ Error during route loading:", error.message)
  process.exit(1)
}

// Health check
app.get("/api/health", (req, res) => {
  console.log("🔵 [SERVER] Health check requested")
  res.json({
    success: true,
    message: "TabiaZetu API is running",
    timestamp: new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
    environment: process.env.NODE_ENV || "development",
  })
})

// Root route - helpful for uptime pings and human visits
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    success: true,
    message: "TabiaZetu API is live",
    health: "/api/health",
    docs: "",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ [SERVER] Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  })
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler - Changed from app.use("*", ...)
app.use((req, res) => {
  console.log("❌ [SERVER] 404 - Route not found:", req.originalUrl)
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 TabiaZetu server running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌍 Timezone: Africa/Nairobi (UTC+3)`)
  console.log(`Access it at http://localhost:${PORT}`)
})
