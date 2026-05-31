import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check, Minus, CheckCircle, Archive, Upload, Settings, Mail, Bell, Clock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';
import { parsePortalHTML } from '../utils/htmlParser';
import toast from 'react-hot-toast';

const Courses = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses, addCourse, updateCourse, deleteCourse, batchImportCourses } = useCourseStore();
  const [showModal, setShowModal] = useState(false);
  const [showLiveSyncModal, setShowLiveSyncModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCreds, setSyncCreds] = useState({ username: '', password: '' });
  const fileInputRef = useRef(null);

  // Scheduler & Automation States
  const [syncTab, setSyncTab] = useState('direct'); // 'direct' or 'automation'
  const [automationConfig, setAutomationConfig] = useState({
    username: '',
    password: '',
    email: '',
    enabled: false,
  });
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isRunningManualCheck, setIsRunningManualCheck] = useState(false);
  const [rememberCreds, setRememberCreds] = useState(false);

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/config/status');
      const data = await response.json();
      if (data.success) {
        setSchedulerStatus(data.scheduler);
        setAutomationConfig(prev => ({
          ...prev,
          username: prev.username || data.scheduler.username || '',
          email: data.scheduler.email || '',
          enabled: data.scheduler.enabled || false,
        }));

        // Automatically prefill Sync Now form if credentials exist
        if (data.scheduler.username && data.scheduler.password) {
          setSyncCreds({
            username: data.scheduler.username,
            password: data.scheduler.password
          });
          setRememberCreds(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch scheduler status:', err);
    }
  };

  useEffect(() => {
    if (showLiveSyncModal) {
      fetchSchedulerStatus();
    }
  }, [showLiveSyncModal]);

  const handleSaveAutomation = async (e) => {
    e.preventDefault();
    if (!automationConfig.username || !automationConfig.password || !automationConfig.email) {
      toast.error('Portal ID, Password, and Notification Email are required');
      return;
    }

    setIsSavingAutomation(true);
    try {
      const response = await fetch('http://localhost:5000/api/config/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationConfig),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save automation schedule');

      toast.success('Automation schedule saved and activated!');
      fetchSchedulerStatus();
    } catch (error) {
      toast.error(error.message || 'Error saving automation settings');
    } finally {
      setIsSavingAutomation(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!automationConfig.email) {
      toast.error('Please enter an email address first');
      return;
    }

    setIsSendingTest(true);
    try {
      const response = await fetch('http://localhost:5000/api/config/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: automationConfig.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send test email');

      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      toast.error(error.message || 'SMTP Configuration Error. Check server console.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleRunManualCheck = async () => {
    setIsRunningManualCheck(true);
    const loadingToast = toast.loading('Running portal sync and checking for changes...');
    try {
      const response = await fetch('http://localhost:5000/api/config/run-now', {
        method: 'POST',
      });

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (!response.ok) throw new Error(data.error || 'Manual check run failed');

      if (data.changes && data.changes.length > 0) {
        toast.success(`Sync finished! Detected ${data.changes.length} change(s) and dispatched email.`);
        // Reload all courses to show new sync results
        if (user) fetchCourses(user.id);
      } else {
        toast.success('Sync complete. No attendance changes detected today.');
      }
      fetchSchedulerStatus();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to run background check');
    } finally {
      setIsRunningManualCheck(false);
    }
  };
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    classes_attended: 0,
    total_classes: 0,
    target_percentage: 75,
  });

  useEffect(() => {
    if (user) fetchCourses(user.id);
  }, [user, fetchCourses]);

  // Silently trigger background update on app/component mount if credentials exist
  useEffect(() => {
    const triggerAutoSync = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/config/status');
        const statusData = await response.json();
        
        if (statusData.success && statusData.scheduler.enabled) {
          console.log('[Auto-Sync] Saved credentials found. Triggering background update...');
          const syncRes = await fetch('http://localhost:5000/api/config/run-now', {
            method: 'POST'
          });
          if (syncRes.ok) {
            console.log('[Auto-Sync] Silent background sync completed successfully.');
            // Reload all courses to update UI with fresh data
            if (user) fetchCourses(user.id);
          }
        }
      } catch (err) {
        console.error('[Auto-Sync] Background sync check failed:', err);
      }
    };

    if (user) {
      triggerAutoSync();
    }
  }, [user]);

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        course_code: course.course_code,
        course_name: course.course_name,
        classes_attended: course.classes_attended,
        total_classes: course.total_classes,
        target_percentage: course.target_percentage,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        course_code: '',
        course_name: '',
        classes_attended: 0,
        total_classes: 0,
        target_percentage: 80,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(formData.classes_attended) > parseInt(formData.total_classes)) {
      toast.error('Classes attended cannot exceed total classes');
      return;
    }

    const courseData = {
      ...formData,
      user_id: user.id,
      classes_attended: parseInt(formData.classes_attended),
      total_classes: parseInt(formData.total_classes),
      target_percentage: parseInt(formData.target_percentage),
    };

    if (editingCourse) {
      await updateCourse(editingCourse.id, courseData);
    } else {
      await addCourse(courseData);
    }
    handleCloseModal();
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await deleteCourse(courseId);
    }
  };

  const handleIncrementAttendance = async (course, attended) => {
    const updates = {
      total_classes: course.total_classes + 1,
      classes_attended: attended ? course.classes_attended + 1 : course.classes_attended,
    };
    await updateCourse(course.id, updates);
  };

  const handleMarkComplete = async (course) => {
    if (window.confirm(`Mark "${course.course_code}" as completed? This will archive the course.`)) {
      const { error } = await updateCourse(course.id, { 
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      if (error) {
        // Column doesn't exist - inform user
        toast.error('Please add is_completed and completed_at columns to your Supabase courses table');
      }
    }
  };

  const handleReactivateCourse = async (course) => {
    const { error } = await updateCourse(course.id, { 
      is_completed: false,
      completed_at: null
    });
    if (error) {
      toast.error('Please add is_completed and completed_at columns to your Supabase courses table');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const htmlContent = event.target.result;
        const parsedCourses = parsePortalHTML(htmlContent);
        
        if (parsedCourses.length === 0) {
          toast.error('No valid courses found in the file.');
          return;
        }

        await batchImportCourses(parsedCourses, user?.id);
      } catch (error) {
        toast.error(error.message || 'Failed to parse the file.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleLiveSync = async (e) => {
    e.preventDefault();
    if (!syncCreds.username || !syncCreds.password) {
      toast.error('Username and password are required');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('http://localhost:5000/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncCreds),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      if (data.courses && data.courses.length > 0) {
        await batchImportCourses(data.courses, user?.id);
        
        // Silently save credentials to backend config if Remember is checked
        if (rememberCreds) {
          try {
            await fetch('http://localhost:5000/api/config/schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: syncCreds.username,
                password: syncCreds.password,
                email: user?.email || 'student@saveetha.com',
                enabled: true
              }),
            });
            console.log('[Auto-Save] Portal credentials securely stored on backend.');
          } catch (err) {
            console.error('Failed to auto-save credentials silently:', err);
          }
        }
        
        setShowLiveSyncModal(false);
      } else {
        toast.error('No courses found.');
      }
    } catch (error) {
      toast.error(error.message || 'Server error. Is the backend running?');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter courses
  const activeCourses = courses.filter(c => !c.is_completed);
  const completedCourses = courses.filter(c => c.is_completed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Courses</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {activeCourses.length} active • {completedCourses.length} completed
          </p>
        </div>
        <div className="flex gap-2">
          {completedCourses.length > 0 && (
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                showCompleted 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
              }`}
            >
              <Archive size={16} />
              {showCompleted ? 'Hide Completed' : 'Show Completed'}
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".html" 
            className="hidden" 
          />
          <button
            onClick={() => setShowLiveSyncModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload size={18} />
            Live Sync
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add Course
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {activeCourses.length === 0 && !showCompleted ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl text-center py-12 px-6">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No active courses</h3>
          <p className="text-neutral-500 mb-6">Start by adding your first course</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowLiveSyncModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Upload size={18} />
              Live Sync
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Course
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Courses */}
          {activeCourses.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-neutral-500 mb-3">Active Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeCourses.map((course) => {
            const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
            const status = getStatusInfo(percentage);
            const classesNeeded = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);
            const classesCanMiss = calculateClassesCanMiss(course.classes_attended, course.total_classes, course.target_percentage);

            return (
              <div
                key={course.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{course.course_code}</h3>
                    <p className="text-sm text-neutral-500 truncate">{course.course_name}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button 
                      onClick={() => handleMarkComplete(course)} 
                      className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Mark as Complete"
                    >
                      <CheckCircle size={14} className="text-emerald-500" />
                    </button>
                    <button onClick={() => handleOpenModal(course)} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
                      <Edit2 size={14} className="text-neutral-500" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center mb-3">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-neutral-800" />
                      <circle
                        cx="48" cy="48" r="40"
                        stroke="currentColor" strokeWidth="6" fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                        strokeLinecap="round"
                        className={percentage >= course.target_percentage ? 'text-emerald-500' : percentage >= course.target_percentage - 10 ? 'text-amber-500' : 'text-red-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">{percentage.toFixed(1)}%</span>
                      <span className="text-[10px] text-neutral-500">Target: {course.target_percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  <div className="bg-neutral-950 rounded-lg p-2">
                    <p className="text-xs text-neutral-500">Attended</p>
                    <p className="text-lg font-bold text-white">{course.classes_attended}/{course.total_classes}</p>
                  </div>
                  <div className="bg-neutral-950 rounded-lg p-2">
                    <p className="text-xs text-neutral-500">{classesNeeded > 0 ? 'Need' : 'Can Skip'}</p>
                    <p className={`text-lg font-bold ${classesNeeded > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {classesNeeded > 0 ? classesNeeded : classesCanMiss}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleIncrementAttendance(course, true)}
                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Check size={16} /> Present
                  </button>
                  <button
                    onClick={() => handleIncrementAttendance(course, false)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus size={16} /> Absent
                  </button>
                </div>
              </div>
            );
          })}
              </div>
            </div>
          )}

          {/* Completed Courses */}
          {showCompleted && completedCourses.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                <Archive size={16} />
                Completed Courses ({completedCourses.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedCourses.map((course) => {
                  const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                  return (
                    <div
                      key={course.id}
                      className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-400 truncate">{course.course_code}</h3>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Completed</span>
                          </div>
                          <p className="text-sm text-neutral-600 truncate">{course.course_name}</p>
                        </div>
                        <button 
                          onClick={() => handleReactivateCourse(course)} 
                          className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-xs text-neutral-500"
                          title="Reactivate Course"
                        >
                          Reactivate
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-neutral-500 text-xs">Final Attendance</p>
                          <p className="text-lg font-bold text-neutral-400">{percentage.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-500 text-xs">Classes</p>
                          <p className="text-neutral-400">{course.classes_attended}/{course.total_classes}</p>
                        </div>
                      </div>
                      {course.completed_at && (
                        <p className="text-[10px] text-neutral-600 mt-2">
                          Completed on {new Date(course.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h2>
              <button onClick={handleCloseModal} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Course Code *</label>
                <input
                  type="text"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  placeholder="e.g., CS101"
                  required
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Course Name *</label>
                <input
                  type="text"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="e.g., Introduction to Programming"
                  required
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.classes_attended}
                    onChange={(e) => setFormData({ ...formData, classes_attended: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Total Classes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_classes}
                    onChange={(e) => setFormData({ ...formData, total_classes: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1.5">Target Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.target_percentage}
                  onChange={(e) => setFormData({ ...formData, target_percentage: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-2 px-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  {editingCourse ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Sync Modal */}
      {showLiveSyncModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Upload size={18} className="text-indigo-500" />
                Portal Live Sync
              </h2>
              <button onClick={() => setShowLiveSyncModal(false)} className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            {/* Tab Switched Header */}
            <div className="flex border-b border-neutral-800 p-2 gap-1 bg-neutral-950/40">
              <button
                type="button"
                onClick={() => setSyncTab('direct')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  syncTab === 'direct' ? 'bg-indigo-500 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Upload size={14} />
                Sync Now
              </button>
              <button
                type="button"
                onClick={() => setSyncTab('automation')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  syncTab === 'automation' ? 'bg-indigo-500 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Bell size={14} />
                Daily Alerts (5 PM)
              </button>
            </div>

            {syncTab === 'direct' ? (
              <form onSubmit={handleLiveSync} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Portal ID</label>
                  <input
                    type="text"
                    value={syncCreds.username}
                    onChange={(e) => setSyncCreds({ ...syncCreds, username: e.target.value })}
                    placeholder="Enter your student ID"
                    required
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={syncCreds.password}
                    onChange={(e) => setSyncCreds({ ...syncCreds, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberCreds"
                    checked={rememberCreds}
                    onChange={(e) => setRememberCreds(e.target.checked)}
                    className="rounded border-neutral-800 text-indigo-500 bg-neutral-950 focus:ring-indigo-500"
                  />
                  <label htmlFor="rememberCreds" className="text-xs text-neutral-400 cursor-pointer select-none">
                    Save credentials securely for automatic daily sync & background updates
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowLiveSyncModal(false)} className="flex-1 py-2 px-4 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSyncing}
                    className="flex-1 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Syncing...
                      </>
                    ) : 'Login & Sync'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveAutomation} className="p-4 space-y-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-300 leading-relaxed flex gap-2">
                  <ShieldCheck size={28} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Encrypted Credentials:</span> Your login and password will be stored securely on your local server with AES-256 encryption. We only decrypt it in-memory to execute the background scrape.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1.5">Portal ID</label>
                    <input
                      type="text"
                      value={automationConfig.username}
                      onChange={(e) => setAutomationConfig({ ...automationConfig, username: e.target.value })}
                      placeholder="192421217"
                      required
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={automationConfig.password}
                      onChange={(e) => setAutomationConfig({ ...automationConfig, password: e.target.value })}
                      placeholder="••••••••"
                      required={!schedulerStatus?.enabled}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Alert Email Address</label>
                  <input
                    type="email"
                    value={automationConfig.email}
                    onChange={(e) => setAutomationConfig({ ...automationConfig, email: e.target.value })}
                    placeholder="your.email@gmail.com"
                    required
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/80">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-400" />
                      Daily 5:00 PM Check
                    </span>
                    <span className="text-xs text-neutral-500">Run background scraper & send updates</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={automationConfig.enabled}
                      onChange={(e) => setAutomationConfig({ ...automationConfig, enabled: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {/* Status Summary */}
                {schedulerStatus && (
                  <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800 text-xs space-y-2">
                    <div className="flex justify-between text-neutral-400">
                      <span>Scheduler State:</span>
                      <span className={`font-bold ${schedulerStatus.enabled ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {schedulerStatus.enabled ? 'ACTIVE & ALIGNED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Last Sync Run:</span>
                      <span>
                        {schedulerStatus.lastSync ? new Date(schedulerStatus.lastSync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800">
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleSendTestEmail}
                      disabled={isSendingTest || !automationConfig.email}
                      className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Mail size={15} />
                      {isSendingTest ? 'Sending...' : 'Send Test'}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleRunManualCheck}
                      disabled={isRunningManualCheck || !schedulerStatus?.enabled}
                      className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={15} className={isRunningManualCheck ? 'animate-spin' : ''} />
                      Sync Now
                    </button>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSavingAutomation}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} />
                    {isSavingAutomation ? 'Saving...' : 'Save & Activate Automation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
