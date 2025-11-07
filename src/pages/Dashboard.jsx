import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, getStatusBadgeClass } from '../utils/helpers';

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

  const statCards = [
    {
      title: 'Overall Attendance',
      value: `${stats.overallPercentage.toFixed(1)}%`,
      icon: Target,
      color: statusInfo.text === 'Safe' ? 'from-green-400 to-green-600' : statusInfo.text === 'Warning' ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600',
      badge: statusInfo.text,
      badgeClass: getStatusBadgeClass(stats.overallPercentage),
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Classes Attended',
      value: `${stats.classesAttended}/${stats.totalClasses}`,
      icon: TrendingUp,
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'This Month',
      value: new Date().toLocaleDateString('en-IN', { month: 'long' }),
      icon: CalendarIcon,
      color: 'from-pink-400 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
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
            className="card bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stat.value}
                </h3>
                {stat.badge && (
                  <span className={`${stat.badgeClass} mt-2 inline-block`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Courses */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Your Courses
          </h2>
          <button
            onClick={() => window.location.href = '/courses'}
            className="text-primary-500 hover:text-primary-600 font-medium text-sm"
          >
            View All →
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {course.course_code}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {course.course_name}
                      </p>
                    </div>
                    <span className={status.color + ' text-xl'}>
                      {status.icon}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Attendance</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {course.classes_attended}/{course.total_classes}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 75 ? 'bg-green-500' : percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800 dark:text-white">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className={getStatusBadgeClass(percentage)}>
                        Target: {course.target_percentage}%
                      </span>
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/courses'}
          className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 transition-all"
        >
          <BookOpen className="text-blue-600 dark:text-blue-400 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
            Manage Courses
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            Add, edit, or delete your courses
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/calendar'}
          className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700 hover:border-green-400 transition-all"
        >
          <CalendarIcon className="text-green-600 dark:text-green-400 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
            Mark Attendance
          </h3>
          <p className="text-sm text-green-600 dark:text-green-300">
            Track your daily attendance
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/statistics'}
          className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 transition-all"
        >
          <TrendingUp className="text-purple-600 dark:text-purple-400 mb-3" size={32} />
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-1">
            View Statistics
          </h3>
          <p className="text-sm text-purple-600 dark:text-purple-300">
            Analyze your attendance trends
          </p>
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;
