import React from 'react';
import { Link } from 'react-router-dom';
import { CinematicFooter } from '../components/ui/motion-footer';
import { FileText, Sparkles } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Terms() {
  usePageTitle('Terms of Service', 'Terms of Service for SaveethaAM — the free SIMATS attendance calculator and tracker for Saveetha Engineering College students.');
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
            <FileText size={40} className="stroke-[1.5]" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-12">Last updated: May 31, 2026</p>

          <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Saveetha Attendance Manager, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not access or use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">2. Description of Service</h2>
              <p>
                Saveetha Attendance Manager is an independent educational tool designed to assist students in tracking, projecting, and syncing their university attendance statistics. It provides features like Live Portal Sync, automatic email reports, and schedule projections.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">3. Not an Official Application</h2>
              <p className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl text-amber-800 dark:text-amber-300 font-medium text-sm">
                IMPORTANT: This application is not officially endorsed, affiliated, or managed by Saveetha University. It is an independent companion tool built by students, for students. Any reliance on the calculated attendance metrics is at your own academic discretion. Always cross-reference your final official attendance status on the university portal before critical exams.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">4. User Account Security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">5. Limitation of Liability</h2>
              <p>
                In no event shall Saveetha Attendance Manager, its creators, or contributors be liable for any academic, administrative, or disciplinary actions taken by your institution as a result of using this tool, including but not limited to incorrect calculations, delayed synchronization, or missed attendance alerts.
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
