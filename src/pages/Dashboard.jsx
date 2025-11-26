import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, BookOpen, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, getStatusBadgeClass, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [stats, setStats] = useState({
    totalClasses: 0,
    classesAttended: 0,
    overallPercentage: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    if (user) {
      fetchCourses(user.id);
    }
  }, [user, fetchCourses]);

  useEffect(() => {
    if (courses.length > 0) {
      const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
      const classesAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
      const overallPercentage = parseFloat(calculatePercentage(classesAttended, totalClasses));

      setStats({
        totalClasses,
        classesAttended,
        overallPercentage,
        totalCourses: courses.length,
      });
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
      gradient: statusInfo.text === 'Safe' ? 'from-success-500 to-success-600' : statusInfo.text === 'Warning' ? 'from-warning-500 to-warning-600' : 'from-danger-500 to-danger-600',
      badge: statusInfo.text,
      badgeClass: getStatusBadgeClass(stats.overallPercentage),
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      title: 'Classes Attended',
      value: `${stats.classesAttended}/${stats.totalClasses}`,
      icon: TrendingUp,
      gradient: 'from-accent-500 to-accent-600',
    },
    {
      title: stats.overallPercentage >= 80 ? 'Can Miss' : 'Need to Attend',
      value: stats.overallPercentage >= 80 ? `${classesCanMiss} classes` : `${classesNeeded} classes`,
      icon: stats.overallPercentage >= 80 ? TrendingDown : TrendingUp,
      gradient: stats.overallPercentage >= 80 ? 'from-success-500 to-success-600' : 'from-primary-500 to-accent-500',
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Dashboard
          </h1>
          <Sparkles className="text-primary-500 animate-pulse-slow" size={24} />
        </div>
        <p className="text-neutral-500 dark:text-neutral-400">
          Overview of your attendance statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-white dark:bg-surface-dark rounded-2xl p-6 overflow-hidden group hover-glow"
          >
            {/* Gradient Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-neutral-800 dark:text-white stat-number">
                  {stat.value}
                </h3>
                {stat.badge && (
                  <span className={`${stat.badgeClass} mt-2 inline-block`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-glow`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Courses */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 hover-glow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
            Your Courses
          </h2>
          <button
            onClick={() => window.location.href = '/courses'}
            className="text-primary-500 hover:text-primary-600 font-semibold text-sm transition-colors flex items-center gap-1 group"
          >
            View All 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-primary-500" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No courses added yet
            </p>
            <button
              onClick={() => window.location.href = '/courses'}
              className="btn-primary"
            >
              Add Your First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course, index) => {
              const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
              const status = getStatusInfo(percentage);
              const classesNeeded = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);
              const classesCanMiss = calculateClassesCanMiss(course.classes_attended, course.total_classes, course.target_percentage);

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border-2 border-neutral-100 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-800 dark:text-white">
                        {course.course_code}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {course.course_name}
                      </p>
                    </div>
                    <span className={status.color + ' text-xl transition-transform group-hover:scale-110'}>
                      {status.icon}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">Attendance</span>
                      <span className="font-semibold text-neutral-800 dark:text-white">
                        {course.classes_attended}/{course.total_classes}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-premium">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          percentage >= 75 ? 'bg-gradient-to-r from-success-500 to-success-400' : percentage >= 65 ? 'bg-gradient-to-r from-warning-500 to-warning-400' : 'bg-gradient-to-r from-danger-500 to-danger-400'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-neutral-800 dark:text-white stat-number">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className={getStatusBadgeClass(percentage)}>
                        Target: {course.target_percentage}%
                      </span>
                    </div>

                    {/* Classes Can Miss / Classes Needed */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      {percentage >= course.target_percentage ? (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">Can Miss</span>
                          <span className="font-semibold text-success-600 dark:text-success-400">
                            {classesCanMiss} class{classesCanMiss !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-500 dark:text-neutral-400">Need to Attend</span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400">
                            {classesNeeded} class{classesNeeded !== 1 ? 'es' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/courses'}
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 border-2 border-primary-100 dark:border-primary-900/50 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 text-left hover-glow"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 shadow-glow">
            <BookOpen className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-1">
            Manage Courses
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Add, edit, or delete your courses
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/calendar'}
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 border-2 border-success-100 dark:border-success-900/50 hover:border-success-400 dark:hover:border-success-500 transition-all duration-300 text-left hover-glow"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center mb-4 shadow-glow">
            <CalendarIcon className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-1">
            View Calendar
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Check exam schedule & holidays
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/statistics'}
          className="bg-white dark:bg-surface-dark rounded-2xl p-6 border-2 border-accent-100 dark:border-accent-900/50 hover:border-accent-400 dark:hover:border-accent-500 transition-all duration-300 text-left hover-glow"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-4 shadow-glow-accent">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-1">
            View Statistics
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Analyze your attendance trends
          </p>
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;
