
# 🧠 TabiaZetu – Behavior Tracking Tool for Kenyan Classrooms

TabiaZetu is an innovative, data-driven classroom behavior management tool designed specifically for Kenyan teachers. Built with a focus on simplifying the process of tracking student behavior and providing actionable insights, TabiaZetu empowers educators to create more effective learning environments. By offering real-time analytics, personalized suggestions, and a user-friendly interface, the tool helps teachers make better-informed decisions and foster positive student development.

Whether used in the Competency-Based Curriculum (CBC) or the traditional 8-4-4 system, TabiaZetu is designed to support teachers across a range of educational settings and academic subjects, enhancing the learning experience for both educators and students.

---

## 🚀 Project Overview

TabiaZetu addresses a common challenge faced by teachers in Kenya and across Africa: the lack of easy-to-use, effective tools for tracking and analyzing student behavior over time. While traditional methods of behavior tracking often involve manual record-keeping, TabiaZetu introduces a digital solution that automates and simplifies this process.

The tool allows teachers to:

- Log a variety of student behaviors across different contexts, streamlining the documentation process.
- Visualize trends and generate reports to help identify patterns of behavior and learning needs.
- Receive contextual, rules-based suggestions that help adjust classroom strategies for improved student outcomes.
- Scale to support multiple classes, subjects, and teaching structures, including the CBC and 8-4-4 systems.

In short, TabiaZetu is designed to augment the teacher's ability to manage student behavior efficiently without burdening them with extra administrative work. The tool ensures that the focus remains on teaching and student development.

---

## 📦 Tech Stack

### Frontend
- **React (Vite)** – Fast and modular setup
- **Tailwind CSS + Shadcn UI** – Clean, responsive design
- **Axios** – API requests
- **Recharts** – Data visualization (behavior trends)

### Backend
- **Node.js + Express** – REST API & server logic
- **MongoDB (via Atlas)** – Flexible NoSQL database
- **JWT (JSON Web Token)** – Secure authentication
- **Mongoose** – Schema definitions

---

## ⚙️ Core Features

- ✅ **Teacher Auth (JWT)**
- ✅ **Student CRUD (Create, Read, Update, Delete)**
- ✅ **Behavior Logging** (multi-select, context-aware)
- ✅ **Visual Reports** (trends over time per student or stream)
- ✅ **Suggestion Engine** (simple rules-based advice)
- ✅ **Feedback Loop** on suggestions (was it helpful?)
- ✅ **Admin Management** *(optional)*

---

## 📁 Folder Structure

### Frontend (`/client`)
- `/components` – Shared UI components (forms, cards, tables)
- `/pages` – Dashboard, login, report views
- `/context` – `AuthContext.jsx` for managing user sessions
- `/utils` – Axios config, helpers
- `/assets` – Images and static assets

### Backend (`/server`)
- `/controllers` – Logic for auth, students, logs, reports
- `/models` – Mongoose schemas: User, Student, Log
- `/routes` – Express routes for API
- `/middleware` – JWT auth, error handling
- `/config` – DB connection, environment variables

---

## 🧪 Local Setup Instructions

### Prerequisites
- Node.js & pnpm
- MongoDB Atlas account
- Vite (`npm install -g create-vite` if needed)

### 1. Clone the repo
```bash
git clone https://github.com/iamiancliff/tabia-zetu
cd TabiaZetu
```

### 2. Setup Backend
```bash
cd server
pnpm install
# Create .env file with:
# MONGO_URI=
# JWT_SECRET=
pnpm run dev
```

### 3. Setup Frontend
```bash
cd client
pnpm install
pnpm run dev
```

The frontend runs on `http://localhost:5173`, and the backend on `http://localhost:5000`.

---

## 💡 Future Features

- AI-enhanced suggestion engine
- Bulk student uploads (CSV)
- Admin dashboard for full school monitoring

---

## 📣 Tagline

> **TabiaZetu – Rekodi. Tambua. Rekebisha.**  
> _("Track. Understand. Improve.")_

---

## 🧑‍💻 Project Status

This is an actively developed MVP. Designed and built by a 2-person team as part of a graduation requirement. The goal is real-world deployment in Kenyan schools.

---

## 📨 Feedback / Contributions

Want to contribute or partner?  
Open an issue or contact the team at: **[iancliff15@gmail.com.com] or [munyaopatrick002@gmail.com]**

---

## 📜 License

MIT License. Feel free to adapt and scale this project with attribution.

---
