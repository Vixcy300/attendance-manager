import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, CheckCircle, Clock, Trophy, Flame, Calendar, TrendingUp, X, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, calculateClassesNeeded } from '../utils/helpers';
import toast from 'react-hot-toast';

const Goals = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    type: 'attendance',
    targetValue: 80,
    courseId: '',
    deadline: '',
  });

  useEffect(() => {
    if (user) {
      fetchCourses(user.id);
      // Load goals from localStorage
      const savedGoals = localStorage.getItem(`goals_${user.id}`);
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
    }
  }, [user]);

  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(newGoals));
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      toast.error('Please enter a goal title');
      return;
    }

    const goal = {
      id: Date.now(),
      ...newGoal,
      createdAt: new Date().toISOString(),
      completed: false,
    };

    saveGoals([...goals, goal]);
    setNewGoal({
      title: '',
      type: 'attendance',
      targetValue: 80,
      courseId: '',
      deadline: '',
    });
    setShowAddModal(false);
    toast.success('Goal added successfully!');
  };

  const toggleGoalComplete = (goalId) => {
    const updatedGoals = goals.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    saveGoals(updatedGoals);
    toast.success('Goal status updated!');
  };

  const deleteGoal = (goalId) => {
    if (window.confirm('Delete this goal?')) {
      saveGoals(goals.filter(g => g.id !== goalId));
      toast.success('Goal deleted');
    }
  };

  // Calculate goal progress
  const getGoalProgress = (goal) => {
    if (goal.type === 'attendance' && goal.courseId) {
      const course = courses.find(c => c.id === goal.courseId);
      if (course) {
        const current = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
        return Math.min(100, (current / goal.targetValue) * 100);
      }
    }
    return goal.completed ? 100 : 0;
  };

  // Stats
  const completedGoals = goals.filter(g => g.completed).length;
  const activeGoals = goals.filter(g => !g.completed).length;
  const totalGoals = goals.length;

  // Streak calculation (days with at least one goal completed)
  const streak = Math.floor(Math.random() * 7) + 1; // Placeholder

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Goals & Targets 🎯
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Set attendance goals and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">Total Goals</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalGoals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">Completed</p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedGoals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{activeGoals}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-purple-800 dark:text-purple-200">Streak</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{streak} days</p>
        </motion.div>
      </div>

      {/* Quick Attendance Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-500" />
          Course Targets Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
            const isAboveTarget = percentage >= course.target_percentage;
            const needed = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);

            return (
              <div
                key={course.id}
                className={`p-4 rounded-xl border-2 ${
                  isAboveTarget 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 dark:text-white">{course.course_code}</span>
                  <span className={`text-sm font-bold ${isAboveTarget ? 'text-green-600' : 'text-amber-600'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isAboveTarget ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (percentage / course.target_percentage) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Target: {course.target_percentage}% • {isAboveTarget ? '✅ Achieved' : `Need ${needed} more classes`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          Your Goals
        </h3>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No goals yet. Set your first attendance goal!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const progress = getGoalProgress(goal);
              const course = courses.find(c => c.id === goal.courseId);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    goal.completed
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleGoalComplete(goal.id)}
                      className={`mt-1 p-1 rounded-full transition-colors ${
                        goal.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-primary-100'
                      }`}
                    >
                      <CheckCircle size={18} />
                    </button>

                    <div className="flex-1">
                      <h4 className={`font-semibold ${goal.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {goal.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {goal.type === 'attendance' && course && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            {course.course_code} • Target: {goal.targetValue}%
                          </span>
                        )}
                        {goal.deadline && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Progress bar for attendance goals */}
                      {goal.type === 'attendance' && !goal.completed && (
                        <div className="mt-2">
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% complete</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Target className="text-primary-500" />
                  Add New Goal
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Reach 85% in Mobile Computing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Type
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="attendance">Attendance Target</option>
                    <option value="streak">Attendance Streak</option>
                    <option value="custom">Custom Goal</option>
                  </select>
                </div>

                {newGoal.type === 'attendance' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Course
                      </label>
                      <select
                        value={newGoal.courseId}
                        onChange={(e) => setNewGoal({ ...newGoal, courseId: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Select a course</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.course_code} - {course.course_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newGoal.targetValue}
                        onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddGoal}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Add Goal
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;
