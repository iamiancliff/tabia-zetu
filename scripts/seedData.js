import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Student from "../models/Student.js"
import BehaviorLog from "../models/BehaviorLog.js"
import Suggestion from "../models/Suggestion.js"
import generateSuggestion from "../utils/generateSuggestion.js"

dotenv.config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected for Seeding: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error connecting to DB for seeding: ${error.message}`)
    process.exit(1)
  }
}

const seedData = async () => {
  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany({})
    await Student.deleteMany({})
    await BehaviorLog.deleteMany({})
    await Suggestion.deleteMany({})
    console.log("Existing data cleared!")

    // Create Admin User
    const adminPassword = await bcrypt.hash("admin123", 10)
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@tabiazetu.co.ke",
      password: adminPassword,
      role: "admin",
      isActive: true,
    })
    console.log("Admin user created!")

    // Create Teacher Users
    const teacherPassword = await bcrypt.hash("teacher123", 10)
    const teachers = await User.insertMany([
      {
        firstName: "Mary",
        lastName: "Wanjiku",
        email: "mary.wanjiku@school.co.ke",
        password: teacherPassword,
        role: "teacher",
        school: "Greenwood Academy",
        isActive: true,
      },
      {
        firstName: "John",
        lastName: "Kamau",
        email: "john.kamau@school.co.ke",
        password: teacherPassword,
        role: "teacher",
        school: "Greenwood Academy",
        isActive: true,
      },
      {
        firstName: "Sarah",
        lastName: "Adhiambo",
        email: "sarah.adhiambo@school.co.ke",
        password: teacherPassword,
        role: "teacher",
        school: "Riverside Primary",
        isActive: true,
      },
    ])
    console.log("Teacher users created!")

    const mary = teachers[0]
    const john = teachers[1]
    const sarah = teachers[2]

    // Create Students
    const students = await Student.insertMany([
      {
        name: "Alice Mumbi",
        stream: "Grade 5A",
        age: 10,
        subjects: ["Math", "Science"],
        teacher: mary._id,
        school: mary.school,
        parentContact: "0712345678",
      },
      {
        name: "Bob Otieno",
        stream: "Grade 5A",
        age: 10,
        subjects: ["English", "Social Studies"],
        teacher: mary._id,
        school: mary.school,
        parentContact: "0723456789",
      },
      {
        name: "Charlie Kimani",
        stream: "Grade 5B",
        age: 11,
        subjects: ["Math", "English"],
        teacher: john._id,
        school: john.school,
        parentContact: "0734567890",
      },
      {
        name: "Diana Chebet",
        stream: "Grade 5B",
        age: 10,
        subjects: ["Science", "Art"],
        teacher: john._id,
        school: john.school,
        parentContact: "0745678901",
      },
      {
        name: "Eve Wanjiru",
        stream: "Grade 4A",
        age: 9,
        subjects: ["Math", "English"],
        teacher: sarah._id,
        school: sarah.school,
        parentContact: "0756789012",
      },
      {
        name: "Frank Mwangi",
        stream: "Grade 5A",
        age: 10,
        subjects: ["Math", "Science"],
        teacher: mary._id,
        school: mary.school,
        parentContact: "0712345679",
      },
      {
        name: "Grace Njeri",
        stream: "Grade 5A",
        age: 10,
        subjects: ["English", "Social Studies"],
        teacher: mary._id,
        school: mary.school,
        parentContact: "0723456780",
      },
      {
        name: "Henry Omondi",
        stream: "Grade 5B",
        age: 11,
        subjects: ["Math", "English"],
        teacher: john._id,
        school: john.school,
        parentContact: "0734567891",
      },
      {
        name: "Ivy Akinyi",
        stream: "Grade 5B",
        age: 10,
        subjects: ["Science", "Art"],
        teacher: john._id,
        school: john.school,
        parentContact: "0745678902",
      },
      {
        name: "Jackline Moraa",
        stream: "Grade 4A",
        age: 9,
        subjects: ["Math", "English"],
        teacher: sarah._id,
        school: sarah.school,
        parentContact: "0756789013",
      },
    ])
    console.log("Students created!")

    const alice = students[0]
    const bob = students[1]
    const charlie = students[2]
    const eve = students[4]

    // Create Behavior Logs
    const behaviorLogs = []
    const today = new Date()

    // Alice's behaviors (Mary's student)
    behaviorLogs.push(
      {
        student: alice._id,
        teacher: mary._id,
        behaviorType: "positive",
        subject: "Math",
        timeOfDay: "morning",
        severity: "low",
        notes: "Actively participated in group work.",
        date: new Date(today.setDate(today.getDate() - 5)),
      },
      {
        student: alice._id,
        teacher: mary._id,
        behaviorType: "negative",
        subject: "English",
        timeOfDay: "afternoon",
        severity: "medium",
        notes: "Difficulty staying focused during reading time.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
      {
        student: alice._id,
        teacher: mary._id,
        behaviorType: "negative",
        subject: "Science",
        timeOfDay: "morning",
        severity: "high",
        notes: "Disrupted class during experiment, refused to follow instructions.",
        date: new Date(today.setDate(today.getDate() + 2)),
      },
      {
        student: alice._id,
        teacher: mary._id,
        behaviorType: "positive",
        subject: "Art",
        timeOfDay: "afternoon",
        severity: "low",
        notes: "Showed great creativity in art class.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
      {
        student: alice._id,
        teacher: mary._id,
        behaviorType: "negative",
        subject: "Math",
        timeOfDay: "morning",
        severity: "medium",
        notes: "Struggled with problem-solving, became frustrated easily.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
    )

    // Bob's behaviors (Mary's student)
    behaviorLogs.push(
      {
        student: bob._id,
        teacher: mary._id,
        behaviorType: "positive",
        subject: "English",
        timeOfDay: "morning",
        severity: "low",
        notes: "Helped a classmate with a task.",
        date: new Date(today.setDate(today.getDate() - 3)),
      },
      {
        student: bob._id,
        teacher: mary._id,
        behaviorType: "negative",
        subject: "Social Studies",
        timeOfDay: "afternoon",
        severity: "low",
        notes: "Talked out of turn during discussion.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
      {
        student: bob._id,
        teacher: mary._id,
        behaviorType: "positive",
        subject: "PE",
        timeOfDay: "morning",
        severity: "low",
        notes: "Excellent sportsmanship during games.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
    )

    // Charlie's behaviors (John's student)
    behaviorLogs.push(
      {
        student: charlie._id,
        teacher: john._id,
        behaviorType: "negative",
        subject: "Math",
        timeOfDay: "morning",
        severity: "high",
        notes: "Refused to complete assignment, became defiant.",
        date: new Date(today.setDate(today.getDate() - 7)),
      },
      {
        student: charlie._id,
        teacher: john._id,
        behaviorType: "negative",
        subject: "English",
        timeOfDay: "afternoon",
        severity: "medium",
        notes: "Frequent off-task behavior during independent work.",
        date: new Date(today.setDate(today.getDate() + 2)),
      },
      {
        student: charlie._id,
        teacher: john._id,
        behaviorType: "positive",
        subject: "Science",
        timeOfDay: "morning",
        severity: "low",
        notes: "Showed curiosity and asked good questions.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
    )

    // Eve's behaviors (Sarah's student)
    behaviorLogs.push(
      {
        student: eve._id,
        teacher: sarah._id,
        behaviorType: "positive",
        subject: "Math",
        timeOfDay: "morning",
        severity: "low",
        notes: "Quickly grasped new concepts.",
        date: new Date(today.setDate(today.getDate() - 2)),
      },
      {
        student: eve._id,
        teacher: sarah._id,
        behaviorType: "negative",
        subject: "English",
        timeOfDay: "afternoon",
        severity: "low",
        notes: "Shy to participate in class discussions.",
        date: new Date(today.setDate(today.getDate() + 1)),
      },
    )

    await BehaviorLog.insertMany(behaviorLogs)
    console.log("Behavior logs created!")

    // Generate initial suggestions for some students
    for (const student of students) {
      const logs = await BehaviorLog.find({ student: student._id, teacher: student.teacher })
        .sort({ date: -1 })
        .limit(10)
      if (logs.length > 0) {
        const { behaviorPattern, suggestionText, category, priority } = generateSuggestion(student, logs)
        await Suggestion.create({
          student: student._id,
          teacher: student.teacher,
          behaviorPattern,
          suggestion: suggestionText,
          category,
          priority,
        })
      }
    }
    console.log("Initial suggestions generated!")

    console.log("Data seeding complete!")
    process.exit()
  } catch (error) {
    console.error(`Error during data seeding: ${error.message}`)
    process.exit(1)
  }
}

seedData()
