import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, Home, Building, Bell, Zap, Rocket, PartyPopper } from 'lucide-react';

const CURRENT_VERSION = '2.0.0';

const WhatsNew = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen this version in this session
    const sessionSeen = sessionStorage.getItem('whatsNewSeenThisSession');
    if (!sessionSeen) {
      // Show the modal after a short delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('whatsNewSeenThisSession', 'true');
    setIsOpen(false);
  };

  const features = [
    {
      icon: Calendar,
      title: 'Exam Schedule Calendar',
      description: 'View MS2 exam dates (Practical, Model, Theory) directly in your calendar with color-coded markers.',
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      icon: Home,
      title: 'Day Scholar / Hosteler Mode',
      description: 'Switch between schedules based on your student type. Your preference is saved automatically.',
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Bell,
      title: 'Upcoming Events Banner',
      description: 'See upcoming exams and holidays at a glance with the new events banner.',
      color: 'text-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      icon: Rocket,
      title: 'Goals & Targets (NEW!)',
      description: 'Set personal attendance goals for each course, track your progress with visual indicators.',
      color: 'text-pink-500',
      bg: 'bg-pink-100 dark:bg-pink-900/30',
    },
    {
      icon: PartyPopper,
      title: 'Tamil Nadu & India Holidays',
      description: 'All major holidays including Pongal, Deepavali, Republic Day, and more are now in the calendar.',
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Zap,
      title: 'Smart Status Indicators',
      description: 'Course cards now show accurate Safe/Warning/Critical based on YOUR target percentage.',
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 p-6 text-white overflow-hidden">
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles size={40} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">What's New in v2.0</h2>
                  <p className="text-white/80 text-sm">Major Update • November 26, 2025</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`p-3 rounded-xl ${feature.bg} shrink-0`}>
                      <feature.icon className={feature.color} size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                Awesome, Let's Go! 🚀
              </motion.button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                Made with ❤️ by VIGNESH
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WhatsNew;
