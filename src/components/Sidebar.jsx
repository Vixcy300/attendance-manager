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
  Flame,
  Trophy,
  Calculator,
  Lock,
  Bot,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, isGuest } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'AI Planner', path: '/ai-optimizer', icon: Bot, isPremium: true },
    { name: 'Bunk Simulator', path: '/bunk-simulator', icon: Calculator, isPremium: true },
    { name: 'Bunk Squad', path: '/bunk-squad', icon: Users, isPremium: true },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon, requireLogin: true },
    { name: 'Statistics', path: '/statistics', icon: BarChart3, requireLogin: true },
    { name: 'Goals', path: '/goals', icon: Target, requireLogin: true },
    { name: 'Achievements', path: '/achievements', icon: Trophy, isNew: true, requireLogin: true },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare, requireLogin: true },
    { name: 'Profile', path: '/profile', icon: User, requireLogin: true },
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl glass-panel text-white shadow-lg"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-neutral-950/80 backdrop-blur-2xl border-r border-white/5 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 rounded-full"></div>
                <img
                  src="/logo.png"
                  alt="SIMATS"
                  className="w-10 h-10 object-contain relative z-10"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-wide">SIMATS</h1>
                <p className="text-xs text-neutral-400">Attendance Manager</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1.5">
              {navItems.map((item) => {
                const isLocked = isGuest && item.requireLogin;

                return (
                  <li key={item.path}>
                    <NavLink
                      to={isLocked ? '#' : item.path}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault();
                          toast('Please Sign In to unlock this feature', { icon: '🔒' });
                        } else {
                          setIsOpen(false);
                        }
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 ${isActive && !isLocked
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : isLocked
                            ? 'text-neutral-600 opacity-50 cursor-not-allowed'
                            : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                        }`
                      }
                    >
                      <item.icon size={18} />
                      <span className="font-medium text-sm">{item.name}</span>
                      
                      {item.isPremium && (
                         <span className="ml-auto text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-bold shadow-md shadow-purple-500/20">
                           PRO
                         </span>
                      )}

                      {item.isNew && !item.isPremium && (
                        <span className="ml-auto text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-md shadow-orange-500/20">
                          NEW
                        </span>
                      )}

                      {isLocked && <Lock size={14} className="ml-auto text-neutral-500" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Disclaimer */}
          <div className="p-4 mx-4 mb-2 bg-amber-500/5 border border-amber-500/10 rounded-xl backdrop-blur-sm">
            <div className="flex gap-2">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-amber-500/80 leading-relaxed font-medium">
                  Student project, not affiliated with SIMATS.
                </p>
                <NavLink
                  to="/disclaimer"
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline mt-1 inline-block transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Read more
                </NavLink>
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="px-4 pb-2 text-center text-[10px] text-neutral-600 font-medium tracking-wider">
            v4.0.0
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3.5 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
