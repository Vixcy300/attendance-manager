import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, CheckCircle2, BarChart3, Clock, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

const Landing = () => {
  const { user, isGuest } = useAuthStore();

  // Redirect to dashboard if already logged in
  if (user || isGuest) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-200">
      {/* Premium Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white size-4" />
            </div>
            <span className="font-extrabold text-xl text-neutral-900 tracking-tight">
              Saveetha<span className="text-indigo-600">AM</span>
            </span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link to="/login" className="text-sm font-semibold text-neutral-600 hover:text-indigo-600 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="pb-16">
        {/* Aceternity Hero Section */}
        <HeroHighlight containerClassName="min-h-screen md:h-[45rem] flex items-center pt-24">
          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            
            {/* Sparkle Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs sm:text-sm font-semibold mb-8"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>The #1 Saveetha Attendance Calculator & Tracker</span>
            </motion.div>

            {/* Main Aceternity Typography Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [20, -5, 0] }}
              transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-neutral-700 max-w-4xl tracking-tight leading-tight sm:leading-snug lg:leading-normal text-center mx-auto mb-8 font-sans"
            >
              Never worry about your{" "}
              <Highlight className="text-black">
                80% attendance mark
              </Highlight>{" "}
              ever again.
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-neutral-500 mb-10 leading-relaxed"
            >
              Securely sync from the portal, calculate required classes, simulate schedules, analyze attendance logs, and get daily automatic email reports. Focus on learning, we'll handle the calculations.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-95"
              >
                Start Tracking Now <ArrowRight size={20} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-8 py-4 rounded-full text-lg font-bold transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Try the Demo
              </Link>
            </motion.div>
          </div>
        </HeroHighlight>

        {/* Feature Highlights Section */}
        <section className="bg-neutral-50 border-y border-neutral-200 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
                Premium Features built for Saveetha Students
              </h2>
              <p className="text-neutral-500 mt-2">
                An all-in-one attendance calculator & sync utility.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Live Portal Sync</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  No more manual entries. Instantly fetch your latest attendance data securely from arms.sec.saveetha.com with one click.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Advanced Analytics</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  Visualize your statistics with beautiful charts. Calculate target classes, target attendance percentage, and target bunk allowances instantly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">Daily Smart Checking</h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  Receive email alerts and notifications every day at 5:00 PM if your attendance changes. Plan your leaves and attendances ahead.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
            <Sparkles size={16} className="text-neutral-600" />
          </div>
          <p className="text-neutral-900 font-bold mb-2">Saveetha Attendance Manager</p>
          <p className="text-xs text-neutral-500 max-w-md">
            Not an official Saveetha University application. Built by students, for students to make attendance calculation reliable and beautiful.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Simple Refresh icon component
const RefreshCw = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export default Landing;
