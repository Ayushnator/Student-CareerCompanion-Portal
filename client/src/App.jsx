import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AcademicHub from './pages/AcademicHub.jsx';
import AIMentor from './pages/AIMentor.jsx';
import InterviewAssistant from './pages/InterviewAssistant.jsx';
import ResumeBuilder from './pages/ResumeBuilder.jsx';
import JobAggregator from './pages/JobAggregator.jsx';
import DSAVisualizer from './pages/DSAVisualizer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/academic"
              element={
                <ProtectedRoute>
                  <AcademicHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-mentor"
              element={
                <ProtectedRoute>
                  <AIMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <JobAggregator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dsa"
              element={
                <ProtectedRoute>
                  <DSAVisualizer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

