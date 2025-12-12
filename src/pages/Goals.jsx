import { useEffect, useState } from 'react';
import { Target, Plus, Trash2, CheckCircle, Clock, Trophy, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage } from '../utils/helpers';
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
      const savedGoals = localStorage.getItem(`goals_${user.id}`);
      if (savedGoals) setGoals(JSON.parse(savedGoals));
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
    setNewGoal({ title: '', type: 'attendance', targetValue: 80, courseId: '', deadline: '' });
    setShowAddModal(false);
    toast.success('Goal added!');
  };

  const toggleGoalComplete = (goalId) => {
    const updatedGoals = goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g);
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId) => {
    if (window.confirm('Delete this goal?')) {
      saveGoals(goals.filter(g => g.id !== goalId));
      toast.success('Goal deleted');
    }
  };

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

  const completedGoals = goals.filter(g => g.completed).length;
  const activeGoals = goals.filter(g => !g.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Goals</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Set and track your attendance goals</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 w-fit"
        >
          <Plus size={18} />
          Add Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{goals.length}</p>
          <p className="text-xs text-neutral-500">Total Goals</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{activeGoals}</p>
          <p className="text-xs text-neutral-500">In Progress</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <Trophy className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{completedGoals}</p>
          <p className="text-xs text-neutral-500">Completed</p>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl text-center py-12 px-6">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No goals yet</h3>
          <p className="text-neutral-500 mb-6">Create your first goal to stay motivated</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create Goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal);
            const course = goal.courseId ? courses.find(c => c.id === goal.courseId) : null;
            
            return (
              <div
                key={goal.id}
                className={`bg-neutral-900 border rounded-xl p-4 transition-colors ${goal.completed ? 'border-emerald-500/30' : 'border-neutral-800'}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleGoalComplete(goal.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      goal.completed 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-neutral-600 hover:border-emerald-500'
                    }`}
                  >
                    {goal.completed && <CheckCircle size={12} className="text-white" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${goal.completed ? 'text-neutral-500 line-through' : 'text-white'}`}>
                      {goal.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {course && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                          {course.course_code}
                        </span>
                      )}
                      <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                        Target: {goal.targetValue}%
                      </span>
                      {goal.deadline && (
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {!goal.completed && goal.type === 'attendance' && goal.courseId && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-neutral-500">Progress</span>
                          <span className="text-neutral-400">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">New Goal</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Goal Title *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Reach 80% in Math"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Course (Optional)</label>
                <select
                  value={newGoal.courseId}
                  onChange={(e) => setNewGoal({ ...newGoal, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.course_code} - {course.course_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Target Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 px-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddGoal} className="flex-1 py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
