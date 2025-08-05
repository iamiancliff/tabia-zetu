import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "admin"],
      default: "teacher",
    },
    school: {
      type: String,
      required: function () {
        return this.role === "teacher"
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  console.log("🔵 [USER MODEL] Pre-save hook triggered")
  console.log("🔵 [USER MODEL] Password modified:", this.isModified("password"))
  
  if (!this.isModified("password")) {
    console.log("🔵 [USER MODEL] Password not modified, skipping hashing")
    return next()
  }
  
  try {
    console.log("🔵 [USER MODEL] Generating salt...")
    const salt = await bcrypt.genSalt(10)
    console.log("🔵 [USER MODEL] Salt generated, hashing password...")
    this.password = await bcrypt.hash(this.password, salt)
    console.log("✅ [USER MODEL] Password hashed successfully")
    next()
  } catch (error) {
    console.log("❌ [USER MODEL] Error hashing password:", error.message)
    next(error)
  }
})

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("🔵 [USER MODEL] matchPassword called")
  console.log("🔵 [USER MODEL] Comparing passwords...")
  
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password)
    console.log("🔵 [USER MODEL] Password comparison result:", isMatch)
    return isMatch
  } catch (error) {
    console.log("❌ [USER MODEL] Error comparing passwords:", error.message)
    throw error
  }
}

const User = mongoose.model("User", userSchema)

export default User;
