import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check, Minus, CheckCircle, Archive, Upload, Settings, Mail, Bell, Clock, ShieldCheck, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';
import { parsePortalHTML } from '../utils/htmlParser';
import { apiFetch, checkBackendHealth } from '../utils/api';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';

const Courses = () => {
  usePageTitle('My Courses');
  const { user, isGuest } = useAuthStore();
  const { courses, fetchCourses, addCourse, updateCourse, deleteCourse, batchImportCourses } = useCourseStore();
  const [showModal, setShowModal] = useState(false);
  const [showLiveSyncModal, setShowLiveSyncModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [syncCreds, setSyncCreds] = useState({ username: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // courseId to confirm delete
  const [completeConfirm, setCompleteConfirm] = useState(null); // course to confirm complete
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
  const [backendStatus, setBackendStatus] = useState({ online: null, latency: null }); // null = checking

  const fetchSchedulerStatus = async () => {
    if (isGuest) return;
    try {
      const response = await apiFetch('/api/config/status');
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
    fetchSchedulerStatus();
  }, [showLiveSyncModal]);

  // Check backend health on mount and when modal opens
  useEffect(() => {
    const checkHealth = async () => {
      const status = await checkBackendHealth();
      setBackendStatus(status);
    };
    checkHealth();
  }, [showLiveSyncModal]);

  const handleSaveAutomation = async (e) => {
    e.preventDefault();
    if (!automationConfig.username || !automationConfig.password || !automationConfig.email) {
      toast.error('Portal ID, Password, and Notification Email are required');
      return;
    }

    setIsSavingAutomation(true);
    try {
      const response = await apiFetch('/api/config/schedule', {
        method: 'POST',
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
      const response = await apiFetch('/api/config/test-email', {
        method: 'POST',
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
      const response = await apiFetch('/api/config/run-now', {
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
        const response = await apiFetch('/api/config/status');
        const statusData = await response.json();
        
        if (statusData.success && statusData.scheduler.enabled) {
          console.log('[Auto-Sync] Saved credentials found. Triggering background update...');
          const syncRes = await apiFetch('/api/config/run-now', {
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

    if (user && !isGuest) {
      triggerAutoSync();
    }
  }, [user, isGuest]);

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
    setDeleteConfirm(courseId);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteCourse(deleteConfirm);
      setDeleteConfirm(null);
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
    setCompleteConfirm(course);
  };

  const confirmComplete = async () => {
    if (completeConfirm) {
      const { error } = await updateCourse(completeConfirm.id, { 
        is_completed: true,
        completed_at: new Date().toISOString()
      });
      if (error) {
        toast.error('Please add is_completed and completed_at columns to your Supabase courses table');
      }
      setCompleteConfirm(null);
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

  const syncSteps = [
    'Connecting to portal...',
    'Authenticating...',
    'Extracting attendance data...',
    'Finalizing sync...'
  ];

  const handleLiveSync = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!syncCreds.username || !syncCreds.password) {
      toast.error('Username and password are required');
      return;
    }

    setIsSyncing(true);
    setLoadingStep(0);
    
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < syncSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const response = await apiFetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(syncCreds),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync. Please check credentials or try again later.');
      }

      if (data.courses && data.courses.length > 0) {
        await batchImportCourses(data.courses, user?.id);
        
        // Silently save credentials to backend config if Remember is checked
        if (rememberCreds) {
          try {
            await apiFetch('/api/config/schedule', {
              method: 'POST',
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
      clearInterval(stepInterval);
      setIsSyncing(false);
      setLoadingStep(0);
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
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">My Courses</h1>
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
                  ? 'bg-violet-500 text-neutral-900' 
                  : 'bg-gray-100 hover:bg-neutral-700 text-neutral-500'
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
          {schedulerStatus?.username && (
            <button
              onClick={() => {
                if (isGuest) {
                  toast('Please Sign In to use 1-Click Sync', { icon: '🔒' });
                  return;
                }
                handleLiveSync();
              }}
              disabled={isSyncing}
              className="bg-neutral-900 text-white hover:bg-neutral-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              {isSyncing ? 'Syncing...' : '1-Click Sync'}
            </button>
          )}
          <button
            onClick={() => {
              if (isGuest) {
                toast('Sign up for a free account to unlock ARMS Sync!', { icon: '🔒' });
                return;
              }
              setShowLiveSyncModal(true);
            }}
            className={`${isGuest ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]'} text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]`}
          >
            {isGuest ? <ShieldCheck size={18} className="opacity-70" /> : <Upload size={18} />}
            {isGuest ? 'ARMS Sync Locked' : 'ARMS Sync'}
            {!isGuest && <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded text-white tracking-wide uppercase">Beta</span>}
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            Add Course
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {activeCourses.length === 0 && !showCompleted ? (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No active courses</h3>
          <p className="text-neutral-500 mb-6">Start by adding your first course</p>
          <div className="flex gap-3 justify-center">
            {schedulerStatus?.username && (
              <button
                onClick={() => {
                  if (isGuest) {
                    toast('Please Sign In to use 1-Click Sync', { icon: '🔒' });
                    return;
                  }
                  handleLiveSync();
                }}
                disabled={isSyncing}
                className="bg-neutral-900 text-white hover:bg-neutral-800 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                {isSyncing ? 'Syncing...' : '1-Click Sync'}
              </button>
            )}
            <button
              onClick={() => {
                if (isGuest) {
                  toast('Sign up for a free account to unlock ARMS Sync!', { icon: '🔒' });
                  return;
                }
                setShowLiveSyncModal(true);
              }}
              className={`${isGuest ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]'} text-white font-medium py-2 px-4 rounded-lg transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]`}
            >
              {isGuest ? <ShieldCheck size={18} className="opacity-70" /> : <Upload size={18} />}
              {isGuest ? 'ARMS Sync Locked' : 'ARMS Sync'}
              {!isGuest && <span className="bg-white/20 text-[10px] font-bold px-1.5 py-0.5 rounded text-white tracking-wide uppercase">Beta</span>}
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-500 hover:bg-emerald-600 text-neutral-900 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
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
                className="rounded-2xl border border-white/[0.06] bg-gray-50 hover:bg-white/[0.04] hover:border-gray-300 transition-all duration-300 overflow-hidden group"
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 text-sm truncate group-hover:text-indigo-300 transition-colors">{course.course_code}</h3>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{course.course_name}</p>
                  </div>
                  <div className="flex items-center gap-0.5 ml-2">
                    <button 
                      onClick={() => handleMarkComplete(course)} 
                      className="p-1.5 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Mark Complete"
                    >
                      <CheckCircle size={14} className="text-neutral-600 hover:text-emerald-400" />
                    </button>
                    <button onClick={() => handleOpenModal(course)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={14} className="text-neutral-600 hover:text-neutral-900" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={14} className="text-neutral-600 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Ring + Stats */}
                <div className="flex items-center gap-5 px-4 py-3">
                  <div className="relative flex-shrink-0 w-20 h-20">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                      <circle
                        cx="40" cy="40" r="34"
                        fill="none" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(percentage, 100) / 100)}`}
                        strokeLinecap="round"
                        stroke={percentage >= course.target_percentage ? '#10b981' : percentage >= course.target_percentage - 10 ? '#f59e0b' : '#ef4444'}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 4px ${percentage >= course.target_percentage ? '#10b98140' : percentage >= course.target_percentage - 10 ? '#f59e0b40' : '#ef444440'})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-black text-neutral-900 leading-none">{percentage.toFixed(1)}%</span>
                      <span className="text-[8px] text-neutral-500 mt-0.5">/ {course.target_percentage}%</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Attended</span>
                      <span className="text-sm font-bold text-neutral-900">{course.classes_attended}<span className="text-neutral-600 text-xs mx-0.5">/</span>{course.total_classes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{classesNeeded > 0 ? 'Need' : 'Buffer'}</span>
                      <span className={`text-sm font-bold ${classesNeeded > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {classesNeeded > 0 ? classesNeeded : `+${classesCanMiss}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex border-t border-white/[0.04]">
                  <button
                    onClick={() => handleIncrementAttendance(course, true)}
                    className="flex-1 py-2.5 text-emerald-500 hover:bg-emerald-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border-r border-white/[0.04]"
                  >
                    <Check size={14} /> Present
                  </button>
                  <button
                    onClick={() => handleIncrementAttendance(course, false)}
                    className="flex-1 py-2.5 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Minus size={14} /> Absent
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
                      className="bg-neutral-900/50 border border-gray-200 rounded-xl p-4 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-500 truncate">{course.course_code}</h3>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Completed</span>
                          </div>
                          <p className="text-sm text-neutral-600 truncate">{course.course_name}</p>
                        </div>
                        <button 
                          onClick={() => handleReactivateCourse(course)} 
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-xs text-neutral-500"
                          title="Reactivate Course"
                        >
                          Reactivate
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-neutral-500 text-xs">Final Attendance</p>
                          <p className="text-lg font-bold text-neutral-500">{percentage.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-500 text-xs">Classes</p>
                          <p className="text-neutral-500">{course.classes_attended}/{course.total_classes}</p>
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h2>
              <button onClick={handleCloseModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-neutral-500 mb-1.5">Course Code *</label>
                <input
                  type="text"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  placeholder="e.g., CS101"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-500 mb-1.5">Course Name *</label>
                <input
                  type="text"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="e.g., Introduction to Programming"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-neutral-500 mb-1.5">Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.classes_attended}
                    onChange={(e) => setFormData({ ...formData, classes_attended: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-500 mb-1.5">Total Classes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_classes}
                    onChange={(e) => setFormData({ ...formData, total_classes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-500 mb-1.5">Target Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.target_percentage}
                  onChange={(e) => setFormData({ ...formData, target_percentage: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-2 px-4 bg-gray-100 text-neutral-900 rounded-lg hover:bg-neutral-700 transition-colors">
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

      {/* ARMS Sync Modal */}
      {showLiveSyncModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 bg-neutral-50/50">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Upload size={20} className="text-indigo-600" />
                  </div>
                  ARMS Sync
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">Beta</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Automatically import attendance data from Saveetha portal.</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Backend Status Pill */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                  backendStatus.online === null 
                    ? 'bg-neutral-100 text-neutral-500' 
                    : backendStatus.online 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-red-50 text-red-600'
                }`}>
                  {backendStatus.online === null ? (
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                  ) : backendStatus.online ? (
                    <Wifi size={10} />
                  ) : (
                    <WifiOff size={10} />
                  )}
                  {backendStatus.online === null ? 'Checking...' : backendStatus.online ? 'Online' : 'Offline'}
                </div>
                <button onClick={() => setShowLiveSyncModal(false)} className="p-2 hover:bg-neutral-200/50 rounded-full transition-colors self-start">
                  <X size={18} className="text-neutral-500" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-neutral-200 bg-neutral-50">
              <button
                type="button"
                onClick={() => setSyncTab('direct')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-b-2 ${
                  syncTab === 'direct' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Upload size={16} />
                Manual Sync
              </button>
              <button
                type="button"
                onClick={() => setSyncTab('automation')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 border-b-2 ${
                  syncTab === 'automation' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Bell size={16} />
                Daily Alerts (5 PM)
              </button>
            </div>

            <div className="p-5">
              {syncTab === 'direct' ? (
                <form onSubmit={handleLiveSync} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Portal ID</label>
                    <input
                      type="text"
                      value={syncCreds.username}
                      onChange={(e) => setSyncCreds({ ...syncCreds, username: e.target.value })}
                      placeholder="Enter your student ID"
                      required
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={syncCreds.password}
                      onChange={(e) => setSyncCreds({ ...syncCreds, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <div className="flex items-center h-5 mt-0.5">
                      <input
                        type="checkbox"
                        id="rememberCreds"
                        checked={rememberCreds}
                        onChange={(e) => setRememberCreds(e.target.checked)}
                        className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="rememberCreds" className="text-xs text-indigo-900/80 cursor-pointer select-none leading-relaxed">
                      Save credentials securely with <span className="font-semibold text-indigo-900">AES-256 encryption</span> for 1-Click Sync and daily automated background checks.
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowLiveSyncModal(false)} className="flex-1 py-2.5 px-4 bg-neutral-100 text-neutral-700 font-medium rounded-xl hover:bg-neutral-200 transition-colors">
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSyncing}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                      {isSyncing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-sm">{syncSteps[loadingStep] || 'Syncing...'}</span>
                        </>
                      ) : 'Login & Sync'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSaveAutomation} className="space-y-5">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-800 leading-relaxed flex gap-3 items-start shadow-sm">
                    <ShieldCheck size={24} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm mb-0.5 text-indigo-900">Bank-Grade Encryption</span>
                      Your login credentials are encrypted locally using AES-256 and never shared. We only decrypt in-memory to execute the 5:00 PM background scrape.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Portal ID</label>
                      <input
                        type="text"
                        value={automationConfig.username}
                        onChange={(e) => setAutomationConfig({ ...automationConfig, username: e.target.value })}
                        placeholder="e.g. 192421217"
                        required
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={automationConfig.password}
                        onChange={(e) => setAutomationConfig({ ...automationConfig, password: e.target.value })}
                        placeholder="••••••••"
                        required={!schedulerStatus?.enabled}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Alert Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={16} className="text-neutral-400" />
                      </div>
                      <input
                        type="email"
                        value={automationConfig.email}
                        onChange={(e) => setAutomationConfig({ ...automationConfig, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                        <Clock size={16} className="text-indigo-500" />
                        Daily 5:00 PM Check
                      </span>
                      <span className="text-xs text-neutral-500 mt-0.5">Run background scraper & send updates</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={automationConfig.enabled}
                        onChange={(e) => setAutomationConfig({ ...automationConfig, enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:border-indigo-600 shadow-inner"></div>
                    </label>
                  </div>

                  {/* Status Summary */}
                  {schedulerStatus && (
                    <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Scheduler State</span>
                        <span className={`font-bold px-2 py-1 rounded-md ${schedulerStatus.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-700'}`}>
                          {schedulerStatus.enabled ? 'ACTIVE & ALIGNED' : 'DISABLED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-neutral-500 border-t border-neutral-200 pt-3">
                        <span className="font-medium">Last Sync Run</span>
                        <span>
                          {schedulerStatus.lastSync ? new Date(schedulerStatus.lastSync).toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={isSavingAutomation}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                    >
                      {isSavingAutomation ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" /> Saving Configuration...
                        </>
                      ) : (
                        <>
                          <Check size={18} /> Save & Activate Automation
                        </>
                      )}
                    </button>
                    
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={handleSendTestEmail}
                        disabled={isSendingTest || !automationConfig.email}
                        className="flex-1 py-2.5 px-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isSendingTest ? <RefreshCw size={16} className="animate-spin text-neutral-400" /> : <Mail size={16} className="text-neutral-500" />}
                        {isSendingTest ? 'Sending...' : 'Send Test'}
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={handleRunManualCheck}
                        disabled={isRunningManualCheck || !schedulerStatus?.enabled}
                        className="flex-1 py-2.5 px-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        <RefreshCw size={16} className={`text-neutral-500 ${isRunningManualCheck ? 'animate-spin' : ''}`} />
                        Sync Now
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Delete Course?</h3>
            <p className="text-sm text-neutral-500 mb-6">This action cannot be undone. All attendance data for this course will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-neutral-700 text-neutral-900 rounded-xl transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {completeConfirm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Complete Course?</h3>
            <p className="text-sm text-neutral-500 mb-6">Mark <span className="text-neutral-900 font-semibold">"{completeConfirm.course_code}"</span> as completed? It will be archived.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCompleteConfirm(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-neutral-700 text-neutral-900 rounded-xl transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-neutral-900 rounded-xl transition-colors font-medium text-sm"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
