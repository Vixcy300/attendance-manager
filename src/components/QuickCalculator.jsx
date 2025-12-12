import { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Share2 } from 'lucide-react';
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
      toast.error('Attended cannot exceed total');
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
      toast.success('Course saved!');
      handleClose();
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const text = generateShareText(result);
    const copied = await copyToClipboard(text);
    if (copied) toast.success('Copied to clipboard!');
  };

  const handleClose = () => {
    setShowCalculator(false);
    resetCalculator();
    setResult(null);
  };

  if (!showCalculator) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="font-semibold text-white">Quick Calculator</h2>
          <button onClick={handleClose} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Attended</label>
              <input
                type="number"
                min="0"
                value={calculatorData.classesAttended}
                onChange={(e) => setCalculatorData({ classesAttended: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-center text-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1.5">Total Classes</label>
              <input
                type="number"
                min="0"
                value={calculatorData.totalClasses}
                onChange={(e) => setCalculatorData({ totalClasses: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-center text-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Target %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={calculatorData.targetPercentage}
              onChange={(e) => setCalculatorData({ targetPercentage: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-center focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={calculateResult}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              {/* Current % */}
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Current Attendance</p>
                <p className={`text-4xl font-bold ${
                  result.currentPercentage >= result.targetPercentage ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {result.currentPercentage.toFixed(1)}%
                </p>
                <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                  result.currentPercentage >= result.targetPercentage 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {result.statusInfo?.label || 'Unknown'}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-950 rounded-lg p-3 text-center">
                  <p className="text-xs text-neutral-500 mb-1">
                    {result.classesNeeded > 0 ? 'Need to Attend' : 'Can Skip'}
                  </p>
                  <p className={`text-2xl font-bold ${
                    result.classesNeeded > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {result.classesNeeded > 0 ? result.classesNeeded : result.classesCanMiss}
                  </p>
                  <p className="text-xs text-neutral-600">classes</p>
                </div>
                <div className="bg-neutral-950 rounded-lg p-3 text-center">
                  <p className="text-xs text-neutral-500 mb-1">Ratio</p>
                  <p className="text-2xl font-bold text-white">
                    {result.classesAttended}/{result.totalClasses}
                  </p>
                  <p className="text-xs text-neutral-600">attended</p>
                </div>
              </div>

              {/* Message */}
              {result.predictiveMessage && (
                <p className="text-sm text-neutral-400 text-center bg-neutral-950 rounded-lg p-3">
                  {result.predictiveMessage}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw size={14} /> Reset
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={handleSaveToDatabase}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickCalculator;
