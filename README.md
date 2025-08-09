
# 🧠 TabiaZetu – Behavior Tracking Tool for Kenyan Classrooms

TabiaZetu is a classroom behavior monitoring tool built for Kenyan teachers. Designed to simplify the process of logging student behavior, analyzing patterns, and generating insights, TabiaZetu empowers teachers to make better, data-informed decisions — all within a mobile-friendly, intuitive interface.

---

## 🚀 Project Overview

Teachers in Kenya (and across Africa) often lack simple, effective tools for tracking student behavior over time. TabiaZetu bridges that gap by providing:

- A streamlined way to **log multiple behavior types**
- Real-time **reports** and **visualizations**
- Contextual **suggestions** to support classroom strategy
- A scalable system that works across streams, subjects, and lessons

Whether in CBC or 8-4-4 setups, TabiaZetu is designed to **support — not burden — the teacher**.

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

The frontend runs on `http://localhost:5173`, and backend on `http://localhost:5000`.

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
Open an issue or contact the team at: **[iancliff15@gmail.com.com]**

---

## 📜 License

MIT License. Feel free to adapt and scale this project with attribution.

---
