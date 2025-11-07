import { Moon, Sun, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';

const Header = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useAppStore();
  const { user } = useAuthStore();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data } = await db.getUser(user.id);
        setUserData(data);
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-4">
        {/* Left side - Welcome message */}
        <div className="ml-12 lg:ml-0">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
            Welcome back, {userData?.name?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => navigate('/feedback-history')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            aria-label="Notifications"
            title="View Feedback History"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Go to Profile"
          >
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold hover:bg-primary-600 transition-colors">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
