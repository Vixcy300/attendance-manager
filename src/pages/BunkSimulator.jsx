import { useState, useMemo } from 'react';
import { useCourseStore } from '../store/courseStore';
import { ShieldAlert, PartyPopper, AlertTriangle, Calculator, ChevronRight, CheckCircle2 } from 'lucide-react';

const BunkSimulator = () => {
  const { courses } = useCourseStore();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [bunkCount, setBunkCount] = useState(1);
  const targetPercentage = 75; // Standard SIMATS requirement

  const selectedCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId) || courses[0],
  [courses, selectedCourseId]);

  const stats = useMemo(() => {
    if (!selectedCourse) return null;
    
    const currentTotal = selectedCourse.total_classes || 0;
    const currentAttended = selectedCourse.classes_attended || 0;
    const currentPercentage = currentTotal === 0 ? 0 : (currentAttended / currentTotal) * 100;

    const simulatedTotal = currentTotal + bunkCount;
    const simulatedPercentage = (currentAttended / simulatedTotal) * 100;
    
    // Calculate how many max classes can be bunked before falling below 75%
    let maxBunks = 0;
    let tempTotal = currentTotal;
    while ((currentAttended / (tempTotal + 1)) * 100 >= targetPercentage) {
      maxBunks++;
      tempTotal++;
    }

    return {
      currentPercentage: currentPercentage.toFixed(1),
      simulatedPercentage: simulatedPercentage.toFixed(1),
      isSafe: simulatedPercentage >= targetPercentage,
      maxBunks,
      isDanger: currentPercentage < targetPercentage
    };
  }, [selectedCourse, bunkCount, targetPercentage]);

  if (!courses.length) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Calculator className="w-16 h-16 mx-auto text-neutral-600" />
          <h2 className="text-xl font-bold text-white">No Courses Available</h2>
          <p className="text-neutral-400">Add some courses in the Dashboard to use the Bunk Simulator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <Calculator className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Bunk Simulator</h1>
          <p className="text-neutral-400">Predict your attendance before skipping a class</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Controls */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-400">Select Subject to Simulate</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-neutral-400">How many classes are you skipping?</label>
              <span className="text-2xl font-bold text-purple-400">{bunkCount}</span>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={bunkCount}
              onChange={(e) => setBunkCount(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>1 Class</span>
              <span>20 Classes</span>
            </div>
          </div>

          {stats && (
            <div className="mt-8 p-4 bg-black border border-neutral-800 rounded-xl">
              <h3 className="text-sm font-medium text-neutral-400 mb-3">Safe Bunk Limit</h3>
              {stats.maxBunks > 0 ? (
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="font-medium">You can safely bunk up to <strong>{stats.maxBunks}</strong> more classes while staying above 75%.</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle size={20} />
                  <span className="font-medium">You have 0 safe bunks left! Do not skip.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Prediction Results */}
        {stats && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
            
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-20 pointer-events-none ${stats.isSafe ? 'bg-emerald-500' : 'bg-red-500'}`} />

            <div className="text-center space-y-8 relative z-10">
              <div>
                <p className="text-sm text-neutral-400 font-medium mb-1">Current Attendance</p>
                <div className="text-3xl font-bold text-white">{stats.currentPercentage}%</div>
              </div>

              <div className="flex justify-center text-neutral-600">
                <ChevronRight className="rotate-90 lg:rotate-0 w-8 h-8" />
              </div>

              <div>
                <p className="text-sm text-neutral-400 font-medium mb-2">Predicted Attendance (After Bunks)</p>
                <div className={`text-6xl font-black ${stats.isSafe ? 'text-emerald-400' : 'text-red-500'}`}>
                  {stats.simulatedPercentage}%
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${stats.isSafe ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {stats.isSafe ? (
                  <>
                    <PartyPopper size={16} />
                    Safe to bunk! You will stay above 75%.
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} />
                    Danger! You will fall below 75%.
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BunkSimulator;
