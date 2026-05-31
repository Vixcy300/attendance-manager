import React from 'react';
import { Link } from 'react-router-dom';
import { CinematicFooter } from '../components/ui/motion-footer';
import { Shield, Sparkles } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="relative w-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 min-h-screen font-sans selection:bg-indigo-200 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white size-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
              Saveetha<span className="text-indigo-600">AM</span>
            </span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 transition-colors">
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full pt-32 pb-24 min-h-[110vh] bg-white dark:bg-black flex flex-col items-center border-b border-neutral-200 dark:border-neutral-800 shadow-md rounded-b-3xl">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <Shield size={40} className="stroke-[1.5]" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-12">Last updated: May 31, 2026</p>

          <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">1. Introduction</h2>
              <p>
                Welcome to Saveetha Attendance Manager ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">2. Information We Collect</h2>
              <p>
                We only collect information that is necessary to provide you with the attendance tracking services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Your name, email address, roll number, and password (which is stored using secure hashing).</li>
                <li><strong>Academic Credentials:</strong> If you use the Live Portal Sync feature, you provide your university credentials. These credentials are encrypted using industry-standard AES-256 encryption before being stored on our servers.</li>
                <li><strong>Attendance Logs:</strong> Calculated statistics, course names, and attendance history logs cached for calculations.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">3. How We Use Your Information</h2>
              <p>
                Your data is used solely to power the attendance management features:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To fetch your live attendance data from the university portal when you initiate a sync.</li>
                <li>To calculate required classes, bunk limits, and attendance projections.</li>
                <li>To send you the daily smart checking email updates at 5:00 PM if configured.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">4. Data Protection & Security</h2>
              <p>
                Security is our highest priority. We implement robust measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All portal sync credentials are encrypted with AES-256.</li>
                <li>All database connections are secured via HTTPS/SSL.</li>
                <li>We do not sell, rent, or share your academic data, email, or credentials with third parties or advertisers.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">5. Account & Data Deletion</h2>
              <p>
                You have full control over your data. You can delete your account at any time from your profile page. Upon request, all your cached data, encrypted credentials, and logs are immediately and permanently wiped from our active databases.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* The Cinematic Footer is injected here */}
      <CinematicFooter />
    </div>
  );
}
