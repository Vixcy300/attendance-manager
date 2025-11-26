import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, Mail, Github, Info } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle size={48} className="text-yellow-600 dark:text-yellow-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Important Disclaimer
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Please read this carefully before using the application
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="card space-y-8">
          {/* Not Official */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Info className="text-primary-500" />
              Not an Official College Application
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Student Attendance Manager (SAM)</strong> is an{' '}
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  independent student project
                </span>{' '}
                created by{' '}
                <a 
                  href="https://github.com/Vixcy300" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-600 font-semibold inline-flex items-center gap-1"
                >
                  VIGNESH <Github size={16} className="inline" />
                </a>{' '}
                to help students track and manage their attendance effectively.
              </p>
              <p>
                This application is{' '}
                <span className="font-semibold">NOT affiliated with, endorsed by, or officially connected to</span>:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>SIMATS Engineering College</li>
                <li>Saveetha Institute of Medical and Technical Sciences (SIMATS)</li>
                <li>Any other educational institution mentioned in the app</li>
                <li>Any university administration or faculty</li>
              </ul>
            </div>
          </section>

          {/* Purpose */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Purpose of This Project
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                SAM was developed as a personal project to address the common student need for:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Easy tracking of attendance across multiple courses</li>
                <li>Calculating required attendance to meet minimum requirements</li>
                <li>Visualizing attendance trends and statistics</li>
                <li>Managing academic schedules efficiently</li>
              </ul>
              <p className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <strong>This is a learning project</strong> built by a student to improve attendance management
                and demonstrate web development skills.
              </p>
            </div>
          </section>

          {/* Data Privacy */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Data Privacy & Security
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <strong>Your data is private:</strong> All attendance records are stored securely and are
                  only accessible by you.
                </li>
                <li>
                  <strong>No official integration:</strong> This app does not sync with any official college
                  systems or databases.
                </li>
                <li>
                  <strong>Manual entry:</strong> All data must be manually entered by you. We do not have
                  access to official attendance records.
                </li>
                <li>
                  <strong>No data sharing:</strong> Your information will never be shared with third parties,
                  colleges, or institutions.
                </li>
                <li>
                  <strong>Secure storage:</strong> Data is stored using Supabase with industry-standard
                  encryption.
                </li>
              </ul>
            </div>
          </section>

          {/* Limitations */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Limitations & Responsibilities
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <strong>Accuracy:</strong> You are responsible for ensuring the accuracy of your attendance
                  records.
                </li>
                <li>
                  <strong>Not legally binding:</strong> Data from this app should not be used for official
                  purposes or submissions.
                </li>
                <li>
                  <strong>No guarantees:</strong> While we strive for reliability, we cannot guarantee
                  100% uptime or data persistence.
                </li>
                <li>
                  <strong>Use at your own risk:</strong> This is a free tool provided as-is without any
                  warranties.
                </li>
                <li>
                  <strong>Always verify:</strong> Cross-check with official college systems for accurate
                  attendance.
                </li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="text-primary-500" />
              Contact & Support
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                For questions, suggestions, or feedback about this project:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p>
                  <strong>Email:</strong>{' '}
                  <a
                    href="mailto:vigneshigt@gmail.com"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    vigneshigt@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Project Type:</strong> Student Portfolio Project
                </p>
                <p>
                  <strong>Version:</strong> 2.0.0
                </p>
              </div>
              <p className="text-sm">
                Feel free to report bugs, suggest features, or contribute to improving the application through
                the feedback form.
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Acknowledgment
            </h2>
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By using Student Attendance Manager, you acknowledge that:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li>You have read and understood this disclaimer</li>
                <li>You understand this is not an official college application</li>
                <li>You will use this tool responsibly and for personal tracking only</li>
                <li>You will not hold the developer liable for any discrepancies</li>
                <li>You will always verify attendance with official college systems</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/dashboard" className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
            <Home size={20} />
            I Understand - Go to Dashboard
          </Link>
          <Link to="/feedback" className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
            <Mail size={20} />
            Send Feedback
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Last updated: November 26, 2025 • Made with ❤️ by{' '}
          <a 
            href="https://github.com/Vixcy300" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-500 hover:text-primary-600 font-semibold"
          >
            VIGNESH
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Disclaimer;
