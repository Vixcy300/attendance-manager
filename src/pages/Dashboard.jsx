import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, BookOpen, Calendar as CalendarIcon, Flame, ArrowRight } from 'lucide-react';
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
          <div key={stat.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-neutral-500 truncate">{stat.title}</p>
                <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">{stat.value}</h3>
                {stat.badge && (
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
                    stat.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <div className={`p-2 sm:p-2.5 rounded-lg ${colorMap[stat.color]}`}>
                <stat.icon className="text-white" size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-white">Your Courses</h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen size={40} className="mx-auto text-neutral-700 mb-3" />
            <p className="text-neutral-500 mb-4">No courses added yet</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.slice(0, 6).map((course) => {
              const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
              const status = getStatusInfo(percentage);
              const classesNeeded = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);
              const classesCanMiss = calculateClassesCanMiss(course.classes_attended, course.total_classes, course.target_percentage);

              return (
                <div key={course.id} className="p-3 sm:p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors bg-neutral-950">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white text-sm truncate">{course.course_code}</h3>
                      <p className="text-xs text-neutral-500 truncate">{course.course_name}</p>
                    </div>
                    <span className={status.color}>{status.icon}</span>
                  </div>

                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-500">Attendance</span>
                    <span className="text-white font-medium">{course.classes_attended}/{course.total_classes}</span>
                  </div>

                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${
                        percentage >= 75 ? 'bg-emerald-500' : percentage >= 65 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-white">{percentage.toFixed(1)}%</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      Target: {course.target_percentage}%
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-neutral-800 flex justify-between text-xs">
                    <span className="text-neutral-500">{percentage >= course.target_percentage ? 'Can Miss' : 'Need'}</span>
                    <span className={percentage >= course.target_percentage ? 'text-emerald-400' : 'text-cyan-400'}>
                      {percentage >= course.target_percentage ? classesCanMiss : classesNeeded} classes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/courses')}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left hover:border-emerald-500/50 transition-colors group"
        >
          <BookOpen className="text-emerald-400 mb-2" size={22} />
          <h3 className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">Courses</h3>
          <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">Manage courses</p>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left hover:border-blue-500/50 transition-colors group"
        >
          <CalendarIcon className="text-blue-400 mb-2" size={22} />
          <h3 className="font-medium text-white text-sm group-hover:text-blue-400 transition-colors">Calendar</h3>
          <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">View schedule</p>
        </button>

        <button
          onClick={() => navigate('/streaks')}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left hover:border-orange-500/50 transition-colors group"
        >
          <Flame className="text-orange-400 mb-2" size={22} />
          <h3 className="font-medium text-white text-sm group-hover:text-orange-400 transition-colors">Streaks</h3>
          <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">Achievements</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
