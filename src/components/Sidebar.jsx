import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar as CalendarIcon, 
  BarChart3, 
  MessageSquare, 
  User, 
  LogOut,
  Menu,
  X,
  AlertCircle,
  Target,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Statistics', path: '/statistics', icon: BarChart3 },
    { name: 'Goals', path: '/goals', icon: Target, isNew: true },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-surface-dark shadow-premium hover:shadow-premium-lg transition-all duration-300"
      >
        {isOpen ? <X size={24} className="text-primary-500" /> : <Menu size={24} className="text-primary-500" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-surface-dark shadow-premium-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  SAM
                </h1>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Student Attendance Manager
                </p>
              </div>
            </div>
            <div className="mt-3">
              <span className="version-badge">v2.0</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1.5">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-premium'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                      }`
                    }
                  >
                    <item.icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-medium">{item.name}</span>
                    {item.isNew && (
                      <span className="ml-auto text-[10px] bg-gradient-to-r from-accent-500 to-accent-600 text-white px-2 py-0.5 rounded-full font-bold shadow-glow-accent animate-pulse-slow">
                        NEW
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Disclaimer Alert */}
          <div className="p-4 mx-4 mb-2 bg-gradient-to-r from-warning-50 to-warning-100/50 dark:from-warning-900/30 dark:to-warning-800/20 border border-warning-200 dark:border-warning-700/50 rounded-xl">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-warning-500 dark:text-warning-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-warning-800 dark:text-warning-200 font-semibold">
                  Not Official
                </p>
                <p className="text-[11px] text-warning-700 dark:text-warning-300 mt-1 leading-relaxed">
                  This is a student project, not affiliated with SIMATS.
                </p>
                <NavLink 
                  to="/disclaimer" 
                  className="text-xs text-warning-600 dark:text-warning-400 hover:text-warning-700 dark:hover:text-warning-300 underline mt-1.5 inline-block font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Read more →
                </NavLink>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-danger-500 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-xl transition-all duration-300 group"
            >
              <LogOut size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
