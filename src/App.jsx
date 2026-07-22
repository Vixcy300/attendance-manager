import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Streaks from './pages/Streaks'; // Keeping for history or fallback
import Achievements from './pages/Achievements'; // New
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import Disclaimer from './pages/Disclaimer';
import FeedbackHistory from './pages/FeedbackHistory';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

// Components
import Layout from './components/Layout';
import QuickCalculator from './components/QuickCalculator';
import FloatingButtons from './components/FloatingButtons';
import ProtectedRoute from './components/ProtectedRoute';
import { Spinner } from './components/ui/ios-spinner';
import TransitionModal from './components/TransitionModal';

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/streaks" element={<Achievements />} /> {/* Remapped Streaks url to Achievements */}
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback-history" element={<FeedbackHistory />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Floating Components */}
      <FloatingButtons />
      <QuickCalculator />
      <TransitionModal />
    </Router>
  );
}

export default App;
