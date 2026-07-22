import React from 'react';
import { Link } from 'react-router-dom';
import { CinematicFooter } from '../components/ui/motion-footer';
import { Mail, Sparkles, MessageCircle, MapPin } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Contact() {
  usePageTitle('Contact Us', 'Get in touch with the SaveethaAM team. Report bugs, request features, or ask questions about the SIMATS attendance calculator.');
  return (
    <div className="relative w-full bg-white text-neutral-900 min-h-screen font-sans selection:bg-indigo-200 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white size-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-neutral-900">
              Saveetha<span className="text-indigo-600">AM</span>
            </span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-neutral-600 hover:text-indigo-600 transition-colors">
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full pt-32 pb-24 min-h-[110vh] bg-white flex flex-col items-center border-b border-neutral-200 shadow-md rounded-b-3xl">
        <div className="max-w-3xl mx-auto px-6 w-full">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <Mail size={40} className="stroke-[1.5]" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Contact Us</h1>
          </div>
          <p className="text-neutral-500 text-sm mb-12">We would love to hear your feedback, feature requests, or queries.</p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Mail size={24} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Email</h2>
              <p className="text-neutral-500 text-sm">For support, inquiries, and bug reports, drop us an email.</p>
              <a href="mailto:support@saveetha-am.com" className="text-indigo-600 font-semibold hover:underline block text-sm">support@saveetha-am.com</a>
            </div>

            <div className="bg-white border border-neutral-200 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <MessageCircle size={24} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Feedback Portal</h2>
              <p className="text-neutral-500 text-sm">Submit and upvote feature requests or report issues directly in our app portal.</p>
              <Link to="/feedback" className="text-indigo-600 font-semibold hover:underline block text-sm">Go to Feedback Portal</Link>
            </div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 p-8 rounded-3xl shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 mb-2">Location</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Saveetha Attendance Manager is built and maintained by engineering students at SIMATS Engineering, Chennai, Tamil Nadu, India.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* The Cinematic Footer is injected here */}
      <CinematicFooter />
    </div>
  );
}
