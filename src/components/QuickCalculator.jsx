import { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Share2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import {
  calculatePercentage,
  calculateClassesNeeded,
  calculateClassesCanMiss,
  getStatusInfo,
  getPredictiveMessage,
} from '../utils/helpers';
import { generateShareText, copyToClipboard } from '../utils/export';

const QuickCalculator = () => {
  const { showCalculator, setShowCalculator, calculatorData, setCalculatorData, resetCalculator } = useAppStore();
  const { addCourse } = useCourseStore();
  const { user } = useAuthStore();

  const [result, setResult] = useState(null);
  const [advancedMode, setAdvancedMode] = useState(false);

  useEffect(() => {
    if (calculatorData.totalClasses && calculatorData.classesAttended) {
      calculateResult();
    }
  }, [calculatorData]);

  const calculateResult = () => {
    const total = parseInt(calculatorData.totalClasses) || 0;
    const attended = parseInt(calculatorData.classesAttended) || 0;
    const target = parseInt(calculatorData.targetPercentage) || 75;

    if (attended > total) {
      toast.error('Classes attended cannot exceed total classes');
      return;
    }

    const currentPercentage = parseFloat(calculatePercentage(attended, total));
    const classesNeeded = calculateClassesNeeded(attended, total, target);
    const classesCanMiss = calculateClassesCanMiss(attended, total, target);
    const statusInfo = getStatusInfo(currentPercentage);
    const predictiveMessage = getPredictiveMessage(attended, total, target);

    setResult({
      currentPercentage,
      classesNeeded,
      classesCanMiss,
      statusInfo,
      predictiveMessage,
      totalClasses: total,
      classesAttended: attended,
      targetPercentage: target,
    });
  };

  const handleSaveToDatabase = async () => {
    if (!result) return;

    const courseData = {
      user_id: user.id,
      course_code: `QUICK-${Date.now()}`,
      course_name: 'Quick Calculator Course',
      classes_attended: result.classesAttended,
      total_classes: result.totalClasses,
      target_percentage: result.targetPercentage,
    };

    const { error } = await addCourse(courseData);
    if (!error) {
      toast.success('Course saved successfully!');
      handleClose();
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const text = generateShareText(result);
    const copied = await copyToClipboard(text);
    
    if (copied) {
      toast.success('Results copied to clipboard!');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClose = () => {
    setShowCalculator(false);
    resetCalculator();
    setResult(null);
  };

  if (!showCalculator) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={handleClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp size={28} />
                  Quick Attendance Calculator
                </h2>
                <p className="text-sm text-primary-100 mt-1">
                  Calculate your attendance instantly
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Classes
                </label>
                <input
                  type="number"
                  min="0"
                  value={calculatorData.totalClasses}
                  onChange={(e) => setCalculatorData({ totalClasses: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Classes Attended
                </label>
                <input
                  type="number"
                  min="0"
                  value={calculatorData.classesAttended}
                  onChange={(e) => setCalculatorData({ classesAttended: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target % (Default: 75%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={calculatorData.targetPercentage}
                  onChange={(e) => setCalculatorData({ targetPercentage: e.target.value })}
                  className="input-field"
                  placeholder="75"
                />
              </div>
            </div>

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Circular Progress */}
                <div className="flex justify-center">
                  <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 88}
                        initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                        animate={{ 
                          strokeDashoffset: 2 * Math.PI * 88 * (1 - result.currentPercentage / 100)
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={
                          result.statusInfo.text === 'Safe'
                            ? 'text-green-500'
                            : result.statusInfo.text === 'Warning'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-gray-800 dark:text-white">
                        {result.currentPercentage.toFixed(1)}%
                      </span>
                      <span className={`text-lg font-semibold mt-2 ${result.statusInfo.color}`}>
                        {result.statusInfo.icon} {result.statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Classes You Can Miss
                    </h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {result.classesCanMiss}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      While maintaining {result.targetPercentage}%
                    </p>
                  </div>

                  <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Classes Needed
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {result.classesNeeded}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      To reach {result.targetPercentage}%
                    </p>
                  </div>
                </div>

                {/* Predictive Message */}
                <div className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
                  <p className="text-purple-800 dark:text-purple-200 font-medium">
                    💡 {result.predictiveMessage}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={handleSaveToDatabase}
                    className="flex items-center justify-center gap-2 btn-primary py-3"
                  >
                    <Save size={18} />
                    <span className="hidden md:inline">Save</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 btn-secondary py-3"
                  >
                    <Share2 size={18} />
                    <span className="hidden md:inline">Share</span>
                  </button>

                  <button
                    onClick={() => {
                      resetCalculator();
                      setResult(null);
                    }}
                    className="flex items-center justify-center gap-2 btn-secondary py-3"
                  >
                    <RefreshCw size={18} />
                    <span className="hidden md:inline">Clear</span>
                  </button>

                  <button
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className="flex items-center justify-center gap-2 btn-secondary py-3"
                  >
                    <TrendingUp size={18} />
                    <span className="hidden md:inline">Advanced</span>
                  </button>
                </div>

                {/* Advanced Mode */}
                {advancedMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="card bg-gray-50 dark:bg-gray-900"
                  >
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                      📊 Detailed Analysis
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Current Attendance:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {result.classesAttended}/{result.totalClasses}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">After attending next 10 classes:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {calculatePercentage(
                            result.classesAttended + 10,
                            result.totalClasses + 10
                          )}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">If you miss next 5 classes:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {calculatePercentage(
                            result.classesAttended,
                            result.totalClasses + 5
                          )}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickCalculator;
