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

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
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
} catch (error) {
  console.error("❌ Error during route loading:", error.message)
  process.exit(1)
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TabiaZetu API is running",
    timestamp: new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }),
    environment: process.env.NODE_ENV || "development",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler - Changed from app.use("*", ...)
app.use((req, res) => {
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
