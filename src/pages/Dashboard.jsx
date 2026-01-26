import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, BookOpen, Calendar as CalendarIcon, Flame, ArrowRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, getStatusBadgeClass, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
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

  const statCards = [
    {
      title: 'Overall Attendance',
      value: `${stats.overallPercentage.toFixed(1)}%`,
      icon: Target,
      color: stats.overallPercentage >= 75 ? 'emerald' : stats.overallPercentage >= 65 ? 'amber' : 'red',
      badge: statusInfo.text,
    },
    { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'blue' },
    { title: 'Classes Attended', value: `${stats.classesAttended}/${stats.totalClasses}`, icon: TrendingUp, color: 'violet' },
    {
      title: stats.overallPercentage >= 80 ? 'Can Miss' : 'Need to Attend',
      value: stats.overallPercentage >= 80 ? `${classesCanMiss} classes` : `${classesNeeded} classes`,
      icon: stats.overallPercentage >= 80 ? TrendingDown : TrendingUp,
      color: stats.overallPercentage >= 80 ? 'emerald' : 'cyan',
    },
  ];

  const colorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Your attendance overview</p>
        </div>
        <button
          onClick={() => navigate('/streaks')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors w-fit"
        >
          <Flame size={16} />
          View Streaks
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card flex flex-col justify-between hover:border-white/20 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-neutral-400 truncate font-medium">{stat.title}</p>
                <h3 className="text-lg sm:text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${colorMap[stat.color]} bg-opacity-20`}>
                <stat.icon className={`text-${stat.color}-400`} size={20} />
              </div>
            </div>
            {stat.badge && (
              <div className="mt-3">
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold border ${stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  stat.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                  {stat.badge}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            Your Courses
          </h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/40 rounded-xl border border-white/5 border-dashed">
            <BookOpen size={48} className="mx-auto text-neutral-700 mb-4" />
            <p className="text-neutral-400 mb-5 font-medium">No courses added yet</p>
            <button
              onClick={() => navigate('/courses')}
              className="btn-primary"
            >
              Add Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => {
              const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
              const status = getStatusInfo(percentage);
              const classesNeeded = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);
              const classesCanMiss = calculateClassesCanMiss(course.classes_attended, course.total_classes, course.target_percentage);

              return (
                <div key={course.id} className="p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 bg-neutral-900/40 hover:bg-neutral-900/60 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-blue-400 transition-colors">{course.course_code}</h3>
                      <p className="text-xs text-neutral-500 truncate">{course.course_name}</p>
                    </div>
                    <span className={status.color}>{status.icon}</span>
                  </div>

                  <div className="flex justify-between text-xs mb-2.5">
                    <span className="text-neutral-400">Attendance</span>
                    <span className="text-white font-medium">{course.classes_attended}/{course.total_classes}</span>
                  </div>

                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 65 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white tracking-tight">{percentage.toFixed(1)}%</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-400 font-medium">
                      Target: {course.target_percentage}%
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-neutral-500">{percentage >= course.target_percentage ? 'Buffer' : 'Deficit'}</span>
                    <span className={`font-medium ${percentage >= course.target_percentage ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {percentage >= course.target_percentage ? `+${classesCanMiss} safe` : `-${classesNeeded} needed`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/courses')}
          className="glass-card text-left hover:bg-white/5 transition-colors group p-5"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="text-emerald-400" size={24} />
          </div>
          <h3 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">Courses</h3>
          <p className="text-xs text-neutral-500 mt-1 hidden sm:block">Manage subjects</p>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="glass-card text-left hover:bg-white/5 transition-colors group p-5"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            <CalendarIcon className="text-blue-400" size={24} />
          </div>
          <h3 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors">Calendar</h3>
          <p className="text-xs text-neutral-500 mt-1 hidden sm:block">View schedule</p>
        </button>

        <button
          onClick={() => navigate('/achievements')}
          className="glass-card text-left hover:bg-white/5 transition-colors group p-5"
        >
          <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            {/* Note using Trophy here instead of Flame to match new Achievements theme */}
            <Trophy className="text-orange-400" size={24} />
          </div>
          <h3 className="font-semibold text-white text-sm group-hover:text-orange-400 transition-colors">Achievements</h3>
          <p className="text-xs text-neutral-500 mt-1 hidden sm:block">Track badges</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
