# Student Nexus - The Ultimate Student Companion

Student Nexus is a comprehensive, AI-powered ecosystem designed to support computer science students through every stage of their academic and professional journey. From mastering data structures to acing interviews and landing jobs, Student Nexus integrates essential tools into a single, cohesive platform.

## 🚀 Key Modules

### 1. **Academic Hub**
*   **Subject Management:** Organize notes, links, and resources by subject.
*   **Resource Sharing:** Collaborative platform to share and access study materials.
*   **Community Forum:** Discuss topics, ask questions, and solve problems with peers.
*   **Role-Based Access:**
    *   **Basic Users:** Can view and comment.
    *   **Guides:** Can create subjects, post jobs, and manage resources.

### 2. **AI Mentor (Powered by Gemini)**
*   **Personalized Tutoring:** Context-aware AI that understands your study materials.
*   **Study Plans:** Generate custom schedules based on your goals and timeline.
*   **Concept Explanation:** Get simplified explanations for complex topics.

### 3. **DSA Visualizer**
*   **Interactive Learning:** Visualize sorting algorithms (Merge, Quick, Heap, etc.) and pathfinding (Dijkstra, A*).
*   **Pathfinding Improvements:**
    *   **Hardcoded Constraints:** Fixed boundaries and internal walls to challenge pathfinding algorithms.
    *   **Optimized DFS:** Iterative implementation to prevent browser freezes during deep recursion.
*   **Data Structure Playground:** Interact with Linked Lists, BSTs, Stacks, and Queues.
*   **Step-by-Step Execution:** Watch algorithms run in real-time to understand their mechanics.

### 4. **Interview Assistant**
*   **Mock Interviews:** AI-driven role-play for various positions (Frontend, Backend, Data Science).
*   **Real-time Feedback:** Receive instant critiques on your answers.
*   **History & Progress:** Track your improvement over time.

### 5. **Resume Suite**
*   **Advanced Builder:** Create ATS-friendly resumes with a modern, structured editor.
*   **AI Analysis:** Get a score (0-100) and detailed actionable feedback to improve your resume based on your structured data.
*   **PDF Export:** Download your professionally formatted resume instantly.
*   **Portfolio Integration:** Showcase your projects and certifications effectively.

### 6. **Job Aggregator**
*   **Smart Recommendations:** Finds jobs that match your specific resume skills and experience.
*   **Internal Job Board:** Post and apply for exclusive opportunities within the community.
*   **External Search:** Generates optimized search queries for LinkedIn, Indeed, and Google Jobs.
*   **Anti-Scam:** Focuses on relevant, active listings to save your time.

### 7. **Task Scheduler**
*   **Personal Tasks:** Organize your daily to-dos.
*   **Global Tasks:** Guides and Admins can broadcast tasks to all students (e.g., "Submit Assignment 1").

### 8. **Admin Dashboard**
*   **Role Management:** Approve or reject requests from users wanting to become Guides.
*   **User Control:** Grant 'Guide' or 'Admin' privileges directly from the dashboard.

## 🛠️ Tech Stack

*   **Frontend:** React.js, Tailwind CSS, Vite, Lucide React, Redux Toolkit.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB (Mongoose).
*   **AI Engine:** Google Generative AI (Gemini 2.5 Flash).
*   **Authentication:** JWT (JSON Web Tokens), managed via `AuthContext` and `localStorage`.
*   **Tools:** HTML2PDF (Client-side PDF generation).

## 📂 Project Structure

```
studentcompanion/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── api/                # HTTP requests & API wrappers (http.js)
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # State management (AuthContext)
│   │   ├── pages/              # Application pages/routes
│   │   └── App.jsx             # Main application component
│   └── vite.config.js          # Vite config (Port 3000, API Proxy)
├── server/                     # Backend Express Application
│   ├── controllers/            # Logic for handling requests
│   ├── middleware/             # Auth & Error handling middleware
│   ├── models/                 # Database Schemas
│   ├── routes/                 # API Endpoints
│   └── server.js               # Server entry point
└── README.md
```

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/student-nexus.git
    cd student-nexus
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    # Create .env file with:
    # PORT=5001  <-- Note: Client proxy defaults to 5001
    # MONGO_URI=your_mongodb_connection_string
    # JWT_SECRET=your_jwt_secret
    # GEMINI_API_KEY=your_google_gemini_key
    npm start
    ```

3.  **Client Setup**
    ```bash
    cd client
    npm install
    npm run dev
    ```
    *   The application will be available at `http://localhost:3000`.
    *   API requests are proxied to the backend (default `http://localhost:5001`).

## 📜 Development History (FIFO Log)

This log tracks the chronological development steps and major architectural decisions made during the project.

1.  **Project Initialization & Authentication**
    *   Set up Monorepo structure (Client/Server).
    *   Implemented JWT-based authentication with `User` model.
    *   Created `AuthContext` for client-side session management.

2.  **Academic Hub & Core Database Models**
    *   Designed `Subject`, `Resource`, and `Post` schemas.
    *   Built RESTful APIs for CRUD operations on academic resources.
    *   Implemented role-based access control (Admin/Guide/User).

3.  **AI Integration (Gemini)**
    *   Integrated Google Generative AI for "AI Mentor".
    *   Created endpoints for chat-based tutoring and concept explanation.
    *   Added "Interview Assistant" with persona-based mock interviews.

4.  **DSA Visualizer**
    *   Built a React-based interactive visualizer for Sorting and Pathfinding.
    *   Implemented state-based animation for real-time algorithm execution.
    *   *Optimization*: Fixed grid overflow issues on mobile using responsive CSS grid (`minmax`, `aspect-ratio`).

5.  **Resume Builder (Iterative Development)**
    *   **Phase 1**: Created a form-based builder with structured data storage (`personalInfo`, `skills`, etc.).
    *   **Phase 2**: Added AI Analysis to score resumes based on content.
    *   **Phase 3 (Upload Experiment)**: Attempted to add PDF/DOCX upload functionality using `multer`, `pdf-parse`, and `mammoth`.
        *   *Challenge*: Parsing unstructured files reliably was error-prone across different formats.
        *   *Decision*: **Reverted**. The upload feature was removed to prioritize the reliability of the structured builder.
    *   **Final State**: Pure form-based builder with HTML-to-PDF export and AI scoring.

6.  **Job Aggregator & Recommendations**
    *   Created `Job` model and internal job board.
    *   Implemented "Smart Recommendations" using AI to match resume keywords with job descriptions.

7.  **Responsive Design Overhaul**
    *   **Navbar**: Converted to a collapsible hamburger menu for mobile devices.
    *   **Layouts**: Audited all pages (Dashboard, Resume, Academic Hub) and applied mobile-first Tailwind classes (`flex-col`, `w-full`, `break-words`) to ensure perfect rendering on small screens.

8.  **System Optimization & Cleanup**
    *   Removed unused server dependencies (`mammoth`, `pdf-parse`, `multer`) to reduce security footprint and maintenance overhead.
    *   Standardized API error handling and response formats.
    *   Updated documentation to reflect the final feature set.

PORT=5001
MONGODB_URI=mongodb+srv://aayushhsinghh001_db_user:7tUFeIDPVs4HbBqk@project1.evg50y4.mongodb.net/?appName=Project1
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY="AIzaSyA66_AboRuEq9kd0Eh5dZukQzfzDpmnm9M"
#   S t u d e n t - C a r e e r C o m p a n i o n - P o r t a l  
 