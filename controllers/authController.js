import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import generateToken from "../utils/generateToken.js"

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  console.log("🔵 [BACKEND REGISTER] ===== REGISTRATION START =====")
  console.log("🔵 [BACKEND REGISTER] Request received:", {
    body: req.body,
    headers: req.headers,
    method: req.method,
    url: req.url,
    ip: req.ip
  })

  const { firstName, lastName, email, password, role, school } = req.body

  console.log("🔵 [BACKEND REGISTER] Extracted data:", {
    firstName,
    lastName,
    email,
    password: password ? "***" : "MISSING",
    role,
    school,
    county: req.body.county
  })

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    console.log("❌ [BACKEND REGISTER] Validation failed - missing required fields")
    console.log("❌ [BACKEND REGISTER] Missing fields:", {
      firstName: !firstName,
      lastName: !lastName,
      email: !email,
      password: !password
    })
    res.status(400)
    throw new Error("Please enter all required fields")
  }

  console.log("✅ [BACKEND REGISTER] Basic validation passed")

  // Check if user exists
  console.log("🔍 [BACKEND REGISTER] Checking if user exists with email:", email)
  try {
  const userExists = await User.findOne({ email })
    console.log("🔍 [BACKEND REGISTER] User exists check result:", userExists ? "EXISTS" : "NOT FOUND")
    
  if (userExists) {
      console.log("❌ [BACKEND REGISTER] User already exists:", email)
    res.status(400)
    throw new Error("User already exists")
    }
  } catch (dbError) {
    console.log("❌ [BACKEND REGISTER] Database error during user check:", dbError.message)
    throw dbError
  }

  console.log("✅ [BACKEND REGISTER] User does not exist, proceeding to create")

  // Create user
  const userData = {
    firstName,
    lastName,
    email,
    password,
    role: role || "teacher", // Explicitly set role
    school: school, // Always include school field
    county: req.body.county || "default-county", // Optional county field
  }

  console.log("🔵 [BACKEND REGISTER] Attempting to create user with data:", {
    ...userData,
    password: "***"
  })

  try {
    console.log("🔵 [BACKEND REGISTER] Calling User.create()...")
    const user = await User.create(userData)
    console.log("✅ [BACKEND REGISTER] User.create() completed successfully")
    console.log("✅ [BACKEND REGISTER] User created successfully:", {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      school: user.school
    })

    if (user) {
      console.log("✅ [BACKEND REGISTER] User object is valid, generating token...")
      const token = generateToken(user._id)
      console.log("✅ [BACKEND REGISTER] Token generated successfully")
      
      console.log("✅ [BACKEND REGISTER] Sending success response")
      const responseData = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        county: user.county,
        school: user.school,
        bio: user.bio,
        streams: user.streams,
        profileImage: user.profileImage,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: token,
      }
      console.log("✅ [BACKEND REGISTER] Response data:", { 
        ...responseData, 
        token: "***",
        hasProfileImage: !!user.profileImage,
        hasBio: !!user.bio,
        streams: user.streams
      })
      
      res.status(201).json(responseData)
      console.log("✅ [BACKEND REGISTER] ===== REGISTRATION SUCCESS =====")
    } else {
      console.log("❌ [BACKEND REGISTER] User creation returned null/undefined")
      res.status(400)
      throw new Error("Invalid user data")
    }
  } catch (error) {
    console.log("❌ [BACKEND REGISTER] Error creating user:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    })
    console.log("❌ [BACKEND REGISTER] ===== REGISTRATION FAILED =====")
    throw error
  }
})

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  console.log("🔵 [BACKEND LOGIN] ===== LOGIN START =====")
  console.log("🔵 [BACKEND LOGIN] Request received:", {
    body: { ...req.body, password: req.body.password ? "***" : "MISSING" },
    method: req.method,
    url: req.url,
    ip: req.ip
  })

  const { email, password } = req.body

  console.log("🔍 [BACKEND LOGIN] Looking for user with email:", email)

  // Check for user email
  try {
    console.log("🔍 [BACKEND LOGIN] Calling User.findOne()...")
  const user = await User.findOne({ email })
    console.log("🔍 [BACKEND LOGIN] User.findOne() completed")

  if (user) {
      console.log("✅ [BACKEND LOGIN] User found:", {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      })
      
      console.log("🔍 [BACKEND LOGIN] Calling user.matchPassword()...")
      const isPasswordValid = await user.matchPassword(password)
      console.log("🔍 [BACKEND LOGIN] Password validation result:", isPasswordValid)

      if (isPasswordValid) {
        console.log("✅ [BACKEND LOGIN] Password is valid, generating token...")
        const token = generateToken(user._id)
        console.log("✅ [BACKEND LOGIN] Token generated successfully")
        
        console.log("✅ [BACKEND LOGIN] Login successful, sending response")
        const responseData = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          county: user.county,
          school: user.school,
          bio: user.bio,
          streams: user.streams,
          profileImage: user.profileImage,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          token: token,
        }
        console.log("✅ [BACKEND LOGIN] Response data:", { 
          ...responseData, 
          token: "***",
          hasProfileImage: !!user.profileImage,
          hasBio: !!user.bio,
          streams: user.streams
        })
        
        res.json(responseData)
        console.log("✅ [BACKEND LOGIN] ===== LOGIN SUCCESS =====")
      } else {
        console.log("❌ [BACKEND LOGIN] Invalid password for user:", email)
        res.status(401)
        throw new Error("Invalid email or password")
      }
    } else {
      console.log("❌ [BACKEND LOGIN] User not found with email:", email)
      res.status(401)
      throw new Error("Invalid email or password")
    }
  } catch (dbError) {
    console.log("❌ [BACKEND LOGIN] Database error:", dbError.message)
    console.log("❌ [BACKEND LOGIN] ===== LOGIN FAILED =====")
    throw dbError
  }
})

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password")
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      school: user.school,
      county: user.county,
      bio: user.bio,
      streams: user.streams,
      profileImage: user.profileImage,
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Upload profile image
// @route   POST /api/auth/upload-image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  // Check if image data is provided
  if (!req.body.imageData) {
    res.status(400)
    throw new Error("No image data provided")
  }

  try {
    // Update user's profile image
    user.profileImage = req.body.imageData
    await user.save()

    res.json({
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage,
      token: generateToken(user._id),
    })
  } catch (error) {
    res.status(500)
    throw new Error("Failed to upload profile image")
  }
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.email = req.body.email || user.email
    user.school = req.body.school || user.school
    user.county = req.body.county || user.county
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio
    user.streams = req.body.streams || user.streams
    // Only update profile image if it's provided and different
    if (req.body.profileImage && req.body.profileImage !== user.profileImage) {
      user.profileImage = req.body.profileImage
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      county: updatedUser.county,
      school: updatedUser.school,
      bio: updatedUser.bio,
      streams: updatedUser.streams,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    res.status(400)
    throw new Error("Please provide both current and new password")
  }

  if (newPassword.length < 6) {
    res.status(400)
    throw new Error("New password must be at least 6 characters long")
  }

  const user = await User.findById(req.user._id)

  if (user) {
    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword)
    if (!isPasswordValid) {
      res.status(401)
      throw new Error("Current password is incorrect")
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      message: "Password updated successfully",
      token: generateToken(user._id),
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    // Delete the user
    await User.findByIdAndDelete(req.user._id)
    
    res.json({
      message: "Account deleted successfully"
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
})

export { registerUser, loginUser, getMe, updateProfile, changePassword, deleteAccount, uploadProfileImage }
