import { useEffect, useState } from 'react';
import { Moon, Sun, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
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
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3">
        {/* Left side */}
        <div className="ml-12 lg:ml-0">
          <h2 className="text-base sm:text-lg font-semibold text-white truncate">
            Welcome, {userData?.name?.split(' ')[0] || 'Student'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'short'
            })}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate('/feedback-history')}
            className="relative p-2 rounded-lg hover:bg-neutral-900 transition-colors"
            title="Notifications"
          >
            <Bell size={18} className="text-neutral-400" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            {darkMode ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-neutral-400" />
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1.5 sm:p-2 sm:pr-3 hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-neutral-300">
              {userData?.name?.split(' ')[0] || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
