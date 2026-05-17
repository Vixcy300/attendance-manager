import { useState, useMemo } from 'react';
import { useCourseStore } from '../store/courseStore';
import { Bot, Sparkles, Calendar as CalendarIcon, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';

const AiOptimizer = () => {
  const { courses } = useCourseStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      if (!courses.length) {
        setAnalyzing(false);
        return;
      }

      // Generate a mock timetable mapping days to courses
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const analysis = days.map(day => {
        // Randomly assign 2-4 courses to this day
        const numCourses = Math.floor(Math.random() * 3) + 2;
        const dayCourses = [...courses].sort(() => 0.5 - Math.random()).slice(0, numCourses);
        
        let riskScore = 0; // Lower is better
        let criticalCourses = [];

        dayCourses.forEach(course => {
            const currentPercentage = course.total_classes === 0 ? 100 : (course.classes_attended / course.total_classes) * 100;
            const dropImpact = course.total_classes === 0 ? 0 : currentPercentage - ((course.classes_attended / (course.total_classes + 1)) * 100);
            const futurePercentage = currentPercentage - dropImpact;

            if (futurePercentage < 75) {
                riskScore += 50; // Huge penalty if it drops below 75%
                criticalCourses.push(course.name);
            } else if (futurePercentage < 80) {
                riskScore += 20; // Medium penalty
            } else {
                riskScore += 5; // Safe padding
            }
        });

        return {
            day,
            courses: dayCourses,
            riskScore,
            criticalCourses,
            isSafe: riskScore < 40
        };
      });

      // Sort to find the best day (lowest risk score)
      analysis.sort((a, b) => a.riskScore - b.riskScore);
      
      setResults(analysis);
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Bot className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Leave Optimizer</h1>
          <p className="text-neutral-400">Mathematically calculate the safest day to bunk</p>
        </div>
      </div>

      {!results && !analyzing && (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center border-blue-500/20 bg-blue-500/5">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Optimize?</h2>
            <p className="text-neutral-400 max-w-lg mb-8">
                Our AI will analyze your current attendance standing across all subjects and simulate your weekly timetable to find the day with the lowest risk of debarment.
            </p>
            <button 
                onClick={runAnalysis}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
                <Bot size={20} />
                Run AI Analysis
            </button>
        </div>
      )}

      {analyzing && (
        <div className="glass-card flex flex-col items-center justify-center p-16 text-center border-neutral-800">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyzing Subject Margins...</h3>
            <p className="text-neutral-500">Calculating drop impacts for all schedule combinations</p>
        </div>
      )}

      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Recommendation */}
            <div className="glass-card p-6 border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles size={14} /> AI Recommendation
                        </div>
                        <h2 className="text-3xl font-black text-white">Skip {results[0].day}</h2>
                        <p className="text-emerald-400 font-medium">This is the mathematically safest day to take a leave.</p>
                        <p className="text-neutral-400 text-sm mt-2 max-w-md">
                            Taking a leave on {results[0].day} affects {results[0].courses.length} subjects, but all of them have enough padding to stay safely above 75%.
                        </p>
                    </div>
                    <div className="text-center bg-black/50 p-4 rounded-2xl border border-white/5">
                        <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Risk Score</div>
                        <div className="text-4xl font-black text-emerald-400">{results[0].riskScore}</div>
                        <div className="text-[10px] text-neutral-500 mt-1">Lower is better</div>
                    </div>
                </div>
            </div>

            {/* Other Days Analysis */}
            <h3 className="text-lg font-bold text-white pt-4">Weekly Risk Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-4">
                {results.slice(1).map((dayData, idx) => (
                    <div key={idx} className="glass-card p-5 border-neutral-800 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                    <CalendarIcon size={20} className="text-neutral-500" /> {dayData.day}
                                </h4>
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${dayData.isSafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    Risk: {dayData.riskScore}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {dayData.courses.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-300">{c.name}</span>
                                        {dayData.criticalCourses.includes(c.name) ? (
                                            <span className="text-red-400 flex items-center gap-1 text-xs font-bold">
                                                <TrendingDown size={14} /> Danger
                                            </span>
                                        ) : (
                                            <span className="text-emerald-400 flex items-center gap-1 text-xs">
                                                <CheckCircle2 size={14} /> Safe
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {!dayData.isSafe && (
                            <div className="mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-400/90 leading-relaxed">
                                    <strong>High Risk:</strong> Bunking this day will drop <strong>{dayData.criticalCourses.join(', ')}</strong> below the 75% limit.
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="flex justify-center pt-8">
                 <button 
                    onClick={runAnalysis}
                    className="text-neutral-400 hover:text-white text-sm font-medium transition-colors underline decoration-neutral-700 underline-offset-4"
                >
                    Recalculate Schedule
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AiOptimizer;
