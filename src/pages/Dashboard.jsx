import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, BookOpen, Calendar as CalendarIcon, Flame, ArrowRight, Trophy, ChevronRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, getStatusBadgeClass, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';
import { usePageTitle } from '../hooks/usePageTitle';

/* ─── tiny circular progress ring ─── */
const ProgressRing = ({ percentage, size = 56, stroke = 5, color }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="drop-shadow-lg -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  );
};

const ringColor = (pct, target) => {
  if (pct >= target) return '#10b981';      // emerald
  if (pct >= target - 10) return '#f59e0b'; // amber
  return '#ef4444';                          // red
};

const Dashboard = () => {
  const navigate = useNavigate();
  usePageTitle('Dashboard');
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [stats, setStats] = useState({
    totalClasses: 0,
    classesAttended: 0,
    overallPercentage: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    if (user) fetchCourses(user.id);
  }, [user, fetchCourses]);

  useEffect(() => {
    if (courses.length > 0) {
      const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
      const classesAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
      const overallPercentage = parseFloat(calculatePercentage(classesAttended, totalClasses));
      setStats({ totalClasses, classesAttended, overallPercentage, totalCourses: courses.length });
    }
  }, [courses]);

  const statusInfo = getStatusInfo(stats.overallPercentage);
  const classesNeeded = calculateClassesNeeded(stats.classesAttended, stats.totalClasses, 80);
  const classesCanMiss = calculateClassesCanMiss(stats.classesAttended, stats.totalClasses, 80);

  /* ─── palette for stat cards ─── */
  const statCards = [
    {
      label: 'Overall',
      value: `${stats.overallPercentage.toFixed(1)}%`,
      sub: statusInfo.text,
      icon: Target,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/10',
      glow: 'hover:shadow-emerald-500/10',
    },
    {
      label: 'Courses',
      value: stats.totalCourses,
      sub: 'Active',
      icon: BookOpen,
      gradient: 'from-blue-500/20 to-indigo-500/20',
      accent: 'text-blue-400',
      border: 'border-blue-500/10',
      glow: 'hover:shadow-blue-500/10',
    },
    {
      label: 'Attended',
      value: `${stats.classesAttended}/${stats.totalClasses}`,
      sub: 'Classes',
      icon: TrendingUp,
      gradient: 'from-violet-500/20 to-purple-500/20',
      accent: 'text-violet-400',
      border: 'border-violet-500/10',
      glow: 'hover:shadow-violet-500/10',
    },
    {
      label: stats.overallPercentage >= 80 ? 'Can Skip' : 'Need',
      value: stats.overallPercentage >= 80 ? classesCanMiss : classesNeeded,
      sub: stats.overallPercentage >= 80 ? 'Buffer classes' : 'More classes',
      icon: stats.overallPercentage >= 80 ? TrendingDown : Zap,
      gradient: stats.overallPercentage >= 80 ? 'from-emerald-500/20 to-green-500/20' : 'from-cyan-500/20 to-sky-500/20',
      accent: stats.overallPercentage >= 80 ? 'text-emerald-400' : 'text-cyan-400',
      border: stats.overallPercentage >= 80 ? 'border-emerald-500/10' : 'border-cyan-500/10',
      glow: stats.overallPercentage >= 80 ? 'hover:shadow-emerald-500/10' : 'hover:shadow-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1 font-semibold">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''}
          </h1>
        </div>
        <button
          onClick={() => navigate('/streaks')}
          className="group inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-neutral-900 dark:text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-orange-500/20 w-fit"
        >
          <Flame size={16} className="group-hover:animate-pulse" />
          Streaks
          <ChevronRight size={14} className="opacity-60" />
        </button>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} border ${s.border} p-4 transition-all duration-300 ${s.glow} hover:shadow-xl group`}
          >
            {/* background icon watermark */}
            <s.icon
              size={64}
              className="absolute -bottom-2 -right-2 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
            />
            <div className="flex items-center gap-2 mb-3">
              <s.icon size={16} className={s.accent} />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{s.label}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">{s.value}</p>
            <p className="text-[11px] text-neutral-500 mt-1 font-medium">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── COURSES SECTION ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-400" />
            Your Courses
          </h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
            <BookOpen size={40} className="mx-auto text-neutral-700 mb-4" />
            <p className="text-neutral-500 mb-5 text-sm font-medium">No courses added yet</p>
            <button onClick={() => navigate('/courses')} className="btn-primary text-sm">
              Add Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {courses.slice(0, 6).map((course) => {
              const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
              const needed = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);
              const canMiss = calculateClassesCanMiss(course.classes_attended, course.total_classes, course.target_percentage);
              const safe = pct >= course.target_percentage;
              const color = ringColor(pct, course.target_percentage);

              return (
                <div
                  key={course.id}
                  onClick={() => navigate('/courses')}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gray-100 dark:bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
                >
                  {/* ── ring ── */}
                  <div className="relative flex-shrink-0">
                    <ProgressRing percentage={pct} size={56} stroke={5} color={color} />
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-neutral-900 dark:text-white"
                      style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>

                  {/* ── info ── */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate group-hover:text-indigo-300 transition-colors leading-tight">
                      {course.course_code}
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5 leading-tight">{course.course_name}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                        {course.classes_attended}<span className="text-neutral-600">/</span>{course.total_classes}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${safe ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {safe ? `+${canMiss} safe` : `−${needed} needed`}
                      </span>
                    </div>
                  </div>

                  {/* ── arrow ── */}
                  <ChevronRight size={14} className="text-neutral-700 group-hover:text-neutral-500 dark:text-neutral-400 transition-colors flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Courses', desc: 'Manage subjects', icon: BookOpen, to: '/courses', accent: 'text-emerald-400', bg: 'bg-emerald-500/10', hover: 'hover:border-emerald-500/20' },
          { label: 'Calendar', desc: 'View schedule', icon: CalendarIcon, to: '/calendar', accent: 'text-blue-400', bg: 'bg-blue-500/10', hover: 'hover:border-blue-500/20' },
          { label: 'Achievements', desc: 'Track badges', icon: Trophy, to: '/achievements', accent: 'text-amber-400', bg: 'bg-amber-500/10', hover: 'hover:border-amber-500/20' },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className={`group rounded-2xl border border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] ${a.hover} p-4 sm:p-5 text-left transition-all duration-300 hover:bg-white/[0.04]`}
          >
            <div className={`${a.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <a.icon className={a.accent} size={20} />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-white/90 transition-colors">{a.label}</h3>
            <p className="text-[11px] text-neutral-600 mt-0.5 hidden sm:block">{a.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
