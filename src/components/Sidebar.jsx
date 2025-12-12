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
  Flame
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
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Streaks', path: '/streaks', icon: Flame, isNew: true },
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800"
      >
        {isOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-neutral-950 border-r border-neutral-900 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-neutral-900">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="SIMATS" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-white">SIMATS</h1>
                <p className="text-xs text-neutral-500">Attendance Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.isNew && (
                      <span className="ml-auto text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">
                        NEW
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Disclaimer */}
          <div className="p-3 mx-3 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Student project, not affiliated with SIMATS.
                </p>
                <NavLink 
                  to="/disclaimer" 
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline mt-1 inline-block"
                  onClick={() => setIsOpen(false)}
                >
                  Read more
                </NavLink>
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="px-4 pb-2 text-center text-[10px] text-neutral-700">
            v3.1.3
          </div>

          {/* Sign Out */}
          <div className="p-3 border-t border-neutral-900">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
