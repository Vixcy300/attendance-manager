import { useEffect, useState, useRef } from 'react';
import { Flame, Trophy, TrendingUp, Calendar, Award, Star, Target, Zap, Edit3, Check, X, RotateCcw, Plus, Minus, Sparkles, Crown } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import { calculatePercentage } from '../utils/helpers';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const STORAGE_KEY = 'attendance_streaks_data';

const defaultStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  weeklyGoal: 5,
  weeklyProgress: 0,
  lastAttendanceDate: null,
  streakHistory: [],
  customGoals: [],
};

const Streaks = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [streakData, setStreakData] = useState(defaultStreakData);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(75);
  const containerRef = useRef(null);

  useEffect(() => {
    if (user) fetchCourses(user.id);
    loadStreakData();
  }, [user, fetchCourses]);

  useEffect(() => {
    // Delay animation to ensure DOM is ready
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.streak-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
        );
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadStreakData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setStreakData(JSON.parse(saved));
    }
  };

  const saveStreakData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setStreakData(data);
  };

  // Calculate XP and Level based on courses and streaks
  const totalAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
  const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
  const overallPercentage = parseFloat(calculatePercentage(totalAttended, totalClasses)) || 0;
  
  const xp = Math.floor(totalAttended * 10 + (overallPercentage * 5) + (streakData.currentStreak * 20));
  const level = Math.floor(xp / 200) + 1;
  const xpInLevel = xp % 200;
  const nextLevelXp = 200;

  const handleStartEdit = () => {
    setEditValues({
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      weeklyGoal: streakData.weeklyGoal,
      weeklyProgress: streakData.weeklyProgress,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const newData = {
      ...streakData,
      ...editValues,
      longestStreak: Math.max(editValues.longestStreak, editValues.currentStreak),
    };
    saveStreakData(newData);
    setIsEditing(false);
    toast.success('Streak data saved!');
    
    // Animate save
    gsap.to('.streak-value', {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleResetStreaks = () => {
    if (confirm('Are you sure you want to reset all streak data?')) {
      saveStreakData(defaultStreakData);
      toast.success('Streaks reset!');
    }
  };

  const handleIncrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    const newData = {
      ...streakData,
      currentStreak: streakData.currentStreak + 1,
      longestStreak: Math.max(streakData.longestStreak, streakData.currentStreak + 1),
      weeklyProgress: Math.min(streakData.weeklyGoal, streakData.weeklyProgress + 1),
      lastAttendanceDate: today,
    };
    saveStreakData(newData);
    toast.success('Streak +1! 🔥');
    
    gsap.from('.streak-flame', {
      scale: 1.5,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  const handleDecrementStreak = () => {
    if (streakData.currentStreak > 0) {
      const newData = {
        ...streakData,
        currentStreak: streakData.currentStreak - 1,
        weeklyProgress: Math.max(0, streakData.weeklyProgress - 1),
      };
      saveStreakData(newData);
    }
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim()) {
      toast.error('Enter a goal name');
      return;
    }
    const newGoal = {
      id: Date.now(),
      name: newGoalName,
      target: newGoalTarget,
      progress: 0,
      completed: false,
    };
    const newData = {
      ...streakData,
      customGoals: [...streakData.customGoals, newGoal],
    };
    saveStreakData(newData);
    setNewGoalName('');
    setNewGoalTarget(75);
    setShowAddGoal(false);
    toast.success('Goal added!');
  };

  const handleUpdateGoalProgress = (goalId, increment) => {
    const newGoals = streakData.customGoals.map(goal => {
      if (goal.id === goalId) {
        const newProgress = Math.max(0, Math.min(100, goal.progress + increment));
        return {
          ...goal,
          progress: newProgress,
          completed: newProgress >= goal.target,
        };
      }
      return goal;
    });
    saveStreakData({ ...streakData, customGoals: newGoals });
  };

  const handleDeleteGoal = (goalId) => {
    const newGoals = streakData.customGoals.filter(g => g.id !== goalId);
    saveStreakData({ ...streakData, customGoals: newGoals });
    toast.success('Goal removed');
  };

  // Achievements based on actual data
  const achievements = [
    { icon: Flame, title: 'Fire Starter', description: '3-day streak', unlocked: streakData.currentStreak >= 3, color: 'orange', progress: Math.min(100, (streakData.currentStreak / 3) * 100) },
    { icon: Trophy, title: 'Week Warrior', description: '7-day streak', unlocked: streakData.currentStreak >= 7, color: 'amber', progress: Math.min(100, (streakData.currentStreak / 7) * 100) },
    { icon: Target, title: 'Goal Crusher', description: '80% attendance', unlocked: overallPercentage >= 80, color: 'emerald', progress: Math.min(100, (overallPercentage / 80) * 100) },
    { icon: Star, title: 'Rising Star', description: 'Level 5', unlocked: level >= 5, color: 'violet', progress: Math.min(100, (level / 5) * 100) },
    { icon: Crown, title: 'Champion', description: '90% attendance', unlocked: overallPercentage >= 90, color: 'blue', progress: Math.min(100, (overallPercentage / 90) * 100) },
    { icon: Zap, title: 'Unstoppable', description: '30-day streak', unlocked: streakData.longestStreak >= 30, color: 'pink', progress: Math.min(100, (streakData.longestStreak / 30) * 100) },
  ];

  const colorMap = {
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    pink: 'bg-pink-500',
  };

  const bgColorMap = {
    orange: 'bg-orange-500/20',
    amber: 'bg-amber-500/20',
    emerald: 'bg-emerald-500/20',
    violet: 'bg-violet-500/20',
    blue: 'bg-blue-500/20',
    pink: 'bg-pink-500/20',
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header with Level */}
      <div className="streak-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-amber-400" size={24} />
            Streaks & Achievements
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Track and manage your consistency</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Edit/Reset Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSaveEdit} className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
                  <Check size={18} className="text-white" />
                </button>
                <button onClick={handleCancelEdit} className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                  <X size={18} className="text-white" />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleStartEdit} className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors" title="Edit streaks">
                  <Edit3 size={18} className="text-neutral-400" />
                </button>
                <button onClick={handleResetStreaks} className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors" title="Reset streaks">
                  <RotateCcw size={18} className="text-neutral-400" />
                </button>
              </>
            )}
          </div>
          
          {/* Level Badge */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">{level}</span>
            </div>
            <div>
              <p className="text-xs text-white/80">Level</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-20 h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${(xpInLevel / nextLevelXp) * 100}%` }} />
                </div>
                <span className="text-[10px] text-white/80">{xpInLevel}/{nextLevelXp}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="streak-card flex flex-wrap gap-3">
        <button
          onClick={handleIncrementStreak}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
        >
          <Flame size={18} className="streak-flame" />
          Add Attendance Day
        </button>
        <button
          onClick={handleDecrementStreak}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl transition-colors"
        >
          <Minus size={18} />
          Missed a Day
        </button>
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="streak-card bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-20">
            <Flame size={48} />
          </div>
          <Flame className="w-6 h-6 mb-2" />
          <p className="text-white/80 text-xs">Current Streak</p>
          {isEditing ? (
            <input
              type="number"
              value={editValues.currentStreak}
              onChange={(e) => setEditValues({ ...editValues, currentStreak: parseInt(e.target.value) || 0 })}
              className="streak-value text-2xl font-bold bg-white/20 rounded px-2 py-1 w-20 mt-1"
            />
          ) : (
            <p className="streak-value text-2xl font-bold">{streakData.currentStreak}</p>
          )}
          <p className="text-white/60 text-xs">days</p>
        </div>

        <div className="streak-card bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-20">
            <Trophy size={48} />
          </div>
          <Trophy className="w-6 h-6 mb-2" />
          <p className="text-white/80 text-xs">Best Streak</p>
          {isEditing ? (
            <input
              type="number"
              value={editValues.longestStreak}
              onChange={(e) => setEditValues({ ...editValues, longestStreak: parseInt(e.target.value) || 0 })}
              className="streak-value text-2xl font-bold bg-white/20 rounded px-2 py-1 w-20 mt-1"
            />
          ) : (
            <p className="streak-value text-2xl font-bold">{streakData.longestStreak}</p>
          )}
          <p className="text-white/60 text-xs">days</p>
        </div>

        <div className="streak-card bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-20">
            <TrendingUp size={48} />
          </div>
          <TrendingUp className="w-6 h-6 mb-2" />
          <p className="text-white/80 text-xs">Weekly Goal</p>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <>
                <input
                  type="number"
                  value={editValues.weeklyProgress}
                  onChange={(e) => setEditValues({ ...editValues, weeklyProgress: parseInt(e.target.value) || 0 })}
                  className="streak-value text-2xl font-bold bg-white/20 rounded px-2 py-1 w-12"
                />
                <span className="text-lg">/</span>
                <input
                  type="number"
                  value={editValues.weeklyGoal}
                  onChange={(e) => setEditValues({ ...editValues, weeklyGoal: parseInt(e.target.value) || 5 })}
                  className="streak-value text-lg bg-white/20 rounded px-2 py-1 w-12"
                />
              </>
            ) : (
              <>
                <p className="streak-value text-2xl font-bold">{streakData.weeklyProgress}</p>
                <p className="text-lg text-white/80">/{streakData.weeklyGoal}</p>
              </>
            )}
          </div>
          <div className="w-full h-1.5 bg-white/30 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (streakData.weeklyProgress / streakData.weeklyGoal) * 100)}%` }} 
            />
          </div>
        </div>

        <div className="streak-card bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-20">
            <Calendar size={48} />
          </div>
          <Calendar className="w-6 h-6 mb-2" />
          <p className="text-white/80 text-xs">Attendance</p>
          <p className="streak-value text-2xl font-bold">{overallPercentage.toFixed(1)}%</p>
          <p className="text-white/60 text-xs">overall</p>
        </div>
      </div>

      {/* Custom Goals */}
      <div className="streak-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-emerald-400" size={20} />
            <h2 className="font-semibold text-white">Custom Goals</h2>
          </div>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>

        {showAddGoal && (
          <div className="bg-neutral-950 rounded-xl p-4 mb-4 border border-neutral-800">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Goal name (e.g., Attend all labs)"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="flex-1 min-w-[200px] bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-sm">Target:</span>
                <input
                  type="number"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(parseInt(e.target.value) || 0)}
                  className="w-16 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-2 text-white text-sm text-center focus:outline-none focus:border-emerald-500"
                />
                <span className="text-neutral-500 text-sm">%</span>
              </div>
              <button
                onClick={handleAddGoal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {streakData.customGoals.length > 0 ? (
          <div className="space-y-3">
            {streakData.customGoals.map((goal) => (
              <div key={goal.id} className="bg-neutral-950 rounded-xl p-4 border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {goal.completed && <Check size={16} className="text-emerald-400" />}
                    <span className={`font-medium ${goal.completed ? 'text-emerald-400' : 'text-white'}`}>{goal.name}</span>
                  </div>
                  <button onClick={() => handleDeleteGoal(goal.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span>{goal.progress}%</span>
                      <span>Target: {goal.target}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${goal.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateGoalProgress(goal.id, -10)}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <Minus size={14} className="text-neutral-400" />
                    </button>
                    <button
                      onClick={() => handleUpdateGoalProgress(goal.id, 10)}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <Plus size={14} className="text-neutral-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-600">
            <Target size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No custom goals yet</p>
            <p className="text-xs">Add personal attendance goals to track</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="streak-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-amber-400" size={20} />
          <h2 className="font-semibold text-white">Achievements</h2>
          <span className="text-xs text-neutral-500 ml-auto">
            {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`p-4 rounded-xl border transition-all ${
                achievement.unlocked 
                  ? `border-neutral-700 ${bgColorMap[achievement.color]}` 
                  : 'border-dashed border-neutral-800 bg-neutral-900/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${achievement.unlocked ? colorMap[achievement.color] : 'bg-neutral-800'}`}>
                  <achievement.icon className="text-white" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm ${achievement.unlocked ? 'text-white' : 'text-neutral-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="mt-2">
                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colorMap[achievement.color]} rounded-full transition-all duration-500`}
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-1">{Math.round(achievement.progress)}% complete</p>
                    </div>
                  )}
                </div>
                {achievement.unlocked && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="streak-card bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl p-6 text-center">
        <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
        <p className="text-neutral-200 text-sm italic">"Success is the sum of small efforts, repeated day in and day out."</p>
        <p className="text-neutral-500 text-xs mt-2">— Robert Collier</p>
      </div>
    </div>
  );
};

export default Streaks;
