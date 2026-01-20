# Student Nexus - Project Context & Handover

## Overview
Student Nexus is a comprehensive MERN stack application designed as an educational platform for Computer Science students. It integrates learning tools (DSA Visualizer), career prep (Resume Builder, Interview AI), and academic management (Task Scheduler, Subject Resources).

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **AI:** Google Gemini API
- **Auth:** JWT + Role-Based Access Control (RBAC)

## User Roles
1. **Student (Default):** Can access all learning modules, create personal tasks, view global tasks.
2. **Guide:** Can create subjects, post jobs, and create **Global Tasks** visible to all students.
3. **Admin:** Has full system access. Specifically manages **User Role Requests** (approving Students to become Guides/Admins).

## Key Modules & Recent Updates

### 1. Admin Dashboard (`/admin`)
- **Purpose:** Manage user role promotion requests.
- **Features:**
    - View all users with `pending` guide requests.
    - Grant access as 'Guide' or 'Admin' via dropdown.
    - Reject requests.
- **Key Files:** `client/src/pages/AdminDashboard.jsx`, `server/controllers/adminController.js`.

### 2. Task Scheduler
- **Purpose:** To-Do list management.
- **Features:**
    - **Personal Tasks:** Private to the user.
    - **Global Tasks:** Created by Guides/Admins, appear on every student's dashboard (read-only for students).
- **Key Files:** `client/src/components/TaskScheduler.jsx`, `server/models/Task.js`, `server/controllers/taskController.js`.

### 3. DSA Visualizer
- **Purpose:** Interactive visualizations for Data Structures and Algorithms.
- **Updates:**
    - **Mobile Responsiveness:** Fixed button alignment on small screens (`flex-wrap`).
    - **Pathfinding:** 
        - Implemented **immutable boundary walls** and **internal walls with gaps** to create a challenging maze structure.
        - **DFS Optimization:** Replaced recursive implementation with an **iterative stack-based approach** to prevent stack overflow and browser freezing.
- **Key Files:** `client/src/components/dsa/DataStructureVisualizer.jsx`, `client/src/components/dsa/PathfindingVisualizer.jsx`.

### 4. Recent Fixes (Session Log)
- **Admin Dashboard:** Added error handling and mobile-responsive card view. Fixed visibility issues where requests might not appear silently.
- **Pathfinding:** Restored internal walls at columns 10 and 20 with specific gaps while maintaining the outer boundary.

## Setup & Running
- **Server:**
  ```bash
  cd server
  npm start
  # Runs on port 5001
  ```
- **Client:**
  ```bash
  cd client
  npm run dev
  # Runs on port 3000 (proxies /api to 5001)
  ```

## Environment Variables (.env)
- **Server:** `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`.

## Future Context
If starting a new chat, provide this file to the AI to establish the current state of the project, especially the custom Admin/Task logic and the specific constraints on the DSA Visualizer.
