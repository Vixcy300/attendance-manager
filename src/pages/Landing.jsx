import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, CheckCircle2, BarChart3, Clock, Sparkles, Users, Calculator, Mail, Zap, MessageSquare } from 'lucide-react';
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { FaqDialog } from "@/components/ui/faq-dialog";
import { ShieldCheck } from "lucide-react";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Accordion05 } from "@/components/ui/accordion-05";
import { usePageTitle } from '../hooks/usePageTitle';

const Landing = () => {
  const { user, isGuest } = useAuthStore();

  usePageTitle(null); // Uses the default full title for the homepage

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
              <Sparkles className="text-neutral-900 dark:text-white size-4" />
            </div>
            <span className="font-extrabold text-xl text-neutral-900 tracking-tight">
              Saveetha<span className="text-indigo-600">AM</span>
            </span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link to="/community" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-indigo-600 transition-colors">
              <MessageSquare size={15} /> Community
            </Link>
            <Link to="/login" className="text-sm font-semibold text-neutral-600 hover:text-indigo-600 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 bg-white shadow-xl rounded-b-[2rem] border-b border-neutral-200 pb-16">
        {/* Aceternity Hero Section */}
        <HeroHighlight containerClassName="min-h-screen md:h-[45rem] flex items-center pt-24">
          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            
            {/* Sparkle Badge */}
            <motion.div
              initial={{ opacity: 1, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs sm:text-sm font-semibold mb-8"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>The #1 Saveetha Attendance Calculator & Tracker</span>
            </motion.div>

            {/* Main Aceternity Typography Heading */}
            <motion.h1
              initial={{ opacity: 1, y: 20 }}
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
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-neutral-500 mb-10 leading-relaxed"
            >
              Securely sync from the portal, calculate required classes, simulate schedules, analyze attendance logs, and get daily automatic email reports. Focus on learning, we'll handle the calculations.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 1, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Link
                to="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-neutral-900 dark:text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-95"
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
            
            {/* Quick FAQ Trigger */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12"
            >
              <FaqDialog />
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

            {/* Enterprise Security Section */}
            <div className="mt-12 bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-green-600">
                <ShieldCheck size={36} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-extrabold text-neutral-900 mb-4">Bank-Grade Security & Absolute Privacy</h3>
                <p className="text-neutral-500 leading-relaxed text-base md:text-lg mb-6 max-w-3xl">
                  We take your data storage and privacy seriously. All your passwords used for automated syncing are encrypted with AES-256 before saving to the database. We never share, sell, or expose your attendance or personal details. Your academic data is 100% yours.
                </p>
                <FaqDialog />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SEO Content Section — Natural keyword-rich content for Google */}
      <section className="bg-white py-20 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
              How SaveethaAM Works
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">
              A step-by-step guide to taking control of your attendance at SIMATS and Saveetha Engineering College.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Users size={24} />,
                step: '01',
                title: 'Create Your Account',
                desc: 'Sign up free with your email or use Google. Try our demo mode to explore features instantly without registering.'
              },
              {
                icon: <Calculator size={24} />,
                step: '02',
                title: 'Add Your Courses',
                desc: 'Enter your subjects and current attendance, or sync directly from the SIMATS ARMS portal with one click.'
              },
              {
                icon: <Zap size={24} />,
                step: '03',
                title: 'Calculate & Simulate',
                desc: 'Instantly see how many classes you can bunk or need to attend. Run what-if scenarios to plan ahead.'
              },
              {
                icon: <Mail size={24} />,
                step: '04',
                title: 'Get Daily Reports',
                desc: 'Receive automated email alerts at 5:00 PM whenever your attendance changes on the university portal.'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-indigo-600 mb-4 flex justify-center">{item.icon}</div>
                <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Step {item.step}</span>
                <h3 className="text-lg font-bold text-neutral-900 mt-2 mb-2">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Natural SEO paragraph — visible, well-designed, not hidden */}
          <div className="mt-16 bg-indigo-50 border border-indigo-100 rounded-2xl p-8 md:p-10 text-center animate-fade-in">
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
              <strong className="text-neutral-900">SaveethaAM</strong> is a free, open-source attendance calculator built by students of{' '}
              <strong className="text-neutral-900">SIMATS (Saveetha Institute of Medical and Technical Sciences)</strong> for students of{' '}
              <strong className="text-neutral-900">SIMATS ENGINEERING</strong>. Whether you need to calculate how many classes you can skip while maintaining{' '}
              <strong className="text-neutral-900">80% attendance</strong>, sync your attendance data from the{' '}
              <strong className="text-neutral-900">ARMS portal</strong>, or receive automated daily email reports — SaveethaAM handles it all.
              Track your <strong className="text-neutral-900">attendance percentage</strong>, set goals, earn streak badges, and plan your schedule with our interactive calendar.
              Your data is protected with <strong className="text-neutral-900">AES-256 encryption</strong> and we never share your information with third parties.
            </p>
          </div>
        </div>
      </section>

      {/* Community CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-600 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10 text-white">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Live Community
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                💬 Join the Student Discussion
              </h2>
              <p className="text-indigo-100 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                Share tips, ask questions, and connect with fellow SIMATS students — no login needed. Completely anonymous and moderated.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  to="/community"
                  className="flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-7 py-3.5 rounded-full text-base font-bold transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  <MessageSquare size={18} /> Open Community Board
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 min-w-[220px]">
              {[
                { emoji: '🚀', text: 'No login required' },
                { emoji: '🔒', text: 'Anonymous & safe' },
                { emoji: '⚡', text: 'Real-time discussions' },
                { emoji: '🏷️', text: 'Categorized topics' },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-medium">
                  <span className="text-base">{emoji}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Accordion05 />
      <CinematicFooter />
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
