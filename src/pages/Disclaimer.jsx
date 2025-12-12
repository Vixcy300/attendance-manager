import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AlertTriangle, Home, Github, Mail, Shield, Info, Database, CheckCircle, XCircle, Heart, Sparkles } from 'lucide-react';

const Disclaimer = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.disclaimer-card', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="disclaimer-card bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-4 relative">
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Important Disclaimer</h1>
              <p className="text-amber-200/70 text-sm">Please read carefully before using</p>
            </div>
          </div>
        </div>

        {/* Not Official */}
        <div className="disclaimer-card bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
              <XCircle size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Not an Official College Application</h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-3">
                <strong className="text-white">Student Attendance Manager (SAM)</strong> is an independent student project 
                created by <span className="text-emerald-400 font-medium">VIGNESH</span> to help students track and manage 
                their attendance effectively.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed mb-2">
                This application is <span className="text-red-400 font-semibold">NOT affiliated</span> with, endorsed by, 
                or officially connected to:
              </p>
              <ul className="text-sm text-neutral-500 space-y-1 ml-4">
                <li>• SIMATS Engineering College</li>
                <li>• Saveetha Institute of Medical and Technical Sciences</li>
                <li>• Any other educational institution</li>
                <li>• Any university administration or faculty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div className="disclaimer-card bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Heart size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Purpose of This Project</h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-2">
                SAM was developed as a personal project to address common student needs:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                {[
                  'Easy tracking across courses',
                  'Calculate attendance requirements',
                  'Visualize trends & statistics',
                  'Manage academic schedules'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Privacy */}
        <div className="disclaimer-card bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
              <Shield size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Data Privacy & Security</h2>
              <div className="space-y-2">
                {[
                  { icon: '🔒', text: 'Your data is private and only accessible by you' },
                  { icon: '🚫', text: 'No official integration with college systems' },
                  { icon: '✏️', text: 'All data is manually entered by you' },
                  { icon: '🛡️', text: 'Secure storage using Supabase with encryption' },
                  { icon: '📧', text: 'Email used only for app-related updates' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">
                  <strong>Email Sharing:</strong> Your email is shared with matrixortai.ltd for essential app updates only.
                  <span className="text-blue-400"> (Not for spam or promotion)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div className="disclaimer-card bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Limitations & Responsibilities</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  'You ensure data accuracy',
                  'Not for official submissions',
                  'Free tool, no warranties',
                  'Always verify with college'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="disclaimer-card bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">By Using This App, You Acknowledge</h2>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>✓ You have read and understood this disclaimer</li>
                <li>✓ This is not an official college application</li>
                <li>✓ You will use responsibly for personal tracking only</li>
                <li>✓ You will verify attendance with official systems</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="disclaimer-card bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Mail size={18} className="text-neutral-500" />
            Contact & Support
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:vigneshigt@gmail.com"
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Mail size={16} />
              vigneshigt@gmail.com
            </a>
            <a
              href="https://github.com/Vixcy300"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
          <p className="text-xs text-neutral-600 mt-3">
            Project Type: Student Portfolio Project
          </p>
        </div>

        {/* Back Home */}
        <div className="disclaimer-card text-center py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all hover:scale-105"
          >
            <Home size={18} />
            Back to App
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-600 text-xs pb-4">
          SIMATS Attendance Manager v3.1.3 • Built with ❤️ by VIGNESH
        </p>
      </div>
    </div>
  );
};

export default Disclaimer;
