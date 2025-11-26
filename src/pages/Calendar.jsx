import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Coffee, MessageSquare, GraduationCap, Home, Building, Calendar as CalendarIcon, Clock, X, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

// MS2 Exam Schedule - UPDATED Nov 26, 2025
// Day Scholar & Hosteler Schedule (Oct 2025 - Jan 2026)
const examSchedule = {
  dayScholar: [
    { date: '2025-10-14', event: 'SLOT A', type: 'slot', color: 'purple' },
    { date: '2025-11-05', event: 'Practical Exam Capstone Project', type: 'practical', color: 'orange' },
    { date: '2025-11-06', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-07', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-11-08', event: 'SLOT B', type: 'slot', color: 'purple' },
    { date: '2025-11-24', event: 'Practical Exam Capstone Project', type: 'practical', color: 'orange' },
    { date: '2025-11-25', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-26', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-11-27', event: 'SLOT C', type: 'slot', color: 'purple' },
    { date: '2025-12-11', event: 'Practical Exam / Capstone Project', type: 'practical', color: 'orange' },
    { date: '2025-12-12', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-12-13', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-12-15', event: 'SLOT D', type: 'slot', color: 'purple' },
    { date: '2026-01-02', event: 'Practical Exam / Capstone Project', type: 'practical', color: 'orange' },
    { date: '2026-01-03', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2026-01-05', event: 'Theory Exam', type: 'theory', color: 'red' },
  ],
  hosteler: [
    { date: '2025-10-14', event: 'SLOT A', type: 'slot', color: 'purple' },
    { date: '2025-11-10', event: 'Practical Exam / Capstone Project', type: 'practical', color: 'orange' },
    { date: '2025-11-11', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-12', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-11-13', event: 'SLOT B', type: 'slot', color: 'purple' },
    { date: '2025-11-26', event: 'Practical Exam / Capstone Project', type: 'practical', color: 'orange' },
    { date: '2025-11-27', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-28', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-11-29', event: 'SLOT C', type: 'slot', color: 'purple' },
    { date: '2025-12-11', event: 'Practical Exam / Capstone Project', type: 'practical', color: 'orange' },
    { date: '2025-12-12', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-12-13', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-12-15', event: 'SLOT D', type: 'slot', color: 'purple' },
    { date: '2026-01-02', event: 'Practical Exam / Capstone Project', type: 'practical', color: 'orange' },
    { date: '2026-01-03', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2026-01-05', event: 'Theory Exam', type: 'theory', color: 'red' },
  ],
};

// Tamil Nadu & India Holidays 2025-2026
const holidays = [
  { date: '2025-01-14', event: 'Pongal', type: 'holiday' },
  { date: '2025-01-15', event: 'Thiruvalluvar Day', type: 'holiday' },
  { date: '2025-01-16', event: 'Uzhavar Thirunal', type: 'holiday' },
  { date: '2025-01-26', event: 'Republic Day', type: 'national' },
  { date: '2025-02-26', event: 'Maha Shivaratri', type: 'holiday' },
  { date: '2025-03-14', event: 'Holi', type: 'holiday' },
  { date: '2025-03-30', event: 'Eid ul-Fitr', type: 'holiday' },
  { date: '2025-04-06', event: 'Ugadi / Telugu New Year', type: 'holiday' },
  { date: '2025-04-10', event: 'Ram Navami', type: 'holiday' },
  { date: '2025-04-14', event: 'Tamil New Year / Ambedkar Jayanti', type: 'holiday' },
  { date: '2025-04-18', event: 'Good Friday', type: 'holiday' },
  { date: '2025-05-01', event: 'May Day', type: 'holiday' },
  { date: '2025-05-12', event: 'Buddha Purnima', type: 'holiday' },
  { date: '2025-06-07', event: 'Eid ul-Adha', type: 'holiday' },
  { date: '2025-07-06', event: 'Muharram', type: 'holiday' },
  { date: '2025-08-15', event: 'Independence Day', type: 'national' },
  { date: '2025-08-16', event: 'Janmashtami', type: 'holiday' },
  { date: '2025-08-27', event: 'Vinayaka Chaturthi', type: 'holiday' },
  { date: '2025-09-05', event: 'Milad-un-Nabi', type: 'holiday' },
  { date: '2025-10-02', event: 'Gandhi Jayanti', type: 'national' },
  { date: '2025-10-02', event: 'Ayudha Pooja', type: 'holiday' },
  { date: '2025-10-03', event: 'Vijayadashami / Dussehra', type: 'holiday' },
  { date: '2025-10-20', event: 'Deepavali', type: 'holiday' },
  { date: '2025-11-01', event: 'Karthigai Deepam', type: 'holiday' },
  { date: '2025-11-05', event: 'Guru Nanak Jayanti', type: 'holiday' },
  { date: '2025-12-25', event: 'Christmas', type: 'holiday' },
  { date: '2026-01-01', event: 'New Year', type: 'holiday' },
  { date: '2026-01-14', event: 'Pongal', type: 'holiday' },
  { date: '2026-01-15', event: 'Thiruvalluvar Day', type: 'holiday' },
  { date: '2026-01-26', event: 'Republic Day', type: 'national' },
];

const CalendarPage = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [note, setNote] = useState('');
  const [showBulkMark, setShowBulkMark] = useState(false);
  const [studentType, setStudentType] = useState('dayScholar');
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  useEffect(() => {
    // Load saved student type from localStorage
    const savedType = localStorage.getItem('studentType');
    if (savedType) setStudentType(savedType);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses(user.id);
      loadAttendanceRecords();
    }
  }, [user]);

  const loadAttendanceRecords = async () => {
    if (user) {
      const { data } = await db.getAttendanceRecords(user.id);
      setAttendanceRecords(data || []);
    }
  };

  const getDateAttendance = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceRecords.filter(record => 
      record.date.split('T')[0] === dateStr
    );
  };

  // Get events for a specific date
  const getDateEvents = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const exams = examSchedule[studentType].filter(e => e.date === dateStr);
    const holidayEvents = holidays.filter(h => h.date === dateStr);
    return [...exams, ...holidayEvents];
  };

  // Check if date has events
  const hasEvents = (date) => {
    return getDateEvents(date).length > 0;
  };

  const handleStudentTypeChange = (type) => {
    setStudentType(type);
    localStorage.setItem('studentType', type);
    toast.success(`Switched to ${type === 'dayScholar' ? 'Day Scholar' : 'Hosteler'} schedule`);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const records = getDateAttendance(date);
      const events = getDateEvents(date);
      
      // Priority: Exams > Holidays > Attendance
      if (events.length > 0) {
        const hasExam = events.some(e => ['practical', 'theory', 'model', 'slot'].includes(e.type));
        const hasHoliday = events.some(e => ['holiday', 'national'].includes(e.type));
        
        if (hasExam) return 'exam-day';
        if (hasHoliday) return 'holiday-day';
      }
      
      if (records.length === 0) return '';
      
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      const holidayCount = records.filter(r => r.status === 'holiday').length;

      if (holidayCount > 0) return 'bg-blue-100 dark:bg-blue-900/30';
      if (presentCount > absentCount) return 'bg-green-100 dark:bg-green-900/30';
      if (absentCount > 0) return 'bg-red-100 dark:bg-red-900/30';
    }
    return '';
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const events = getDateEvents(date);
      if (events.length > 0) {
        const hasExam = events.some(e => ['practical', 'theory', 'model', 'slot'].includes(e.type));
        const hasHoliday = events.some(e => ['holiday', 'national'].includes(e.type));
        
        return (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {hasExam && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}
            {hasHoliday && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
          </div>
        );
      }
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = getDateEvents(date);
    if (events.length > 0) {
      setSelectedDateEvents(events);
      setShowEventPopup(true);
    }
  };

  const handleBulkMark = async (status) => {
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const records = selectedCourses.map(courseId => ({
      user_id: user.id,
      course_id: courseId,
      date: dateStr,
      status,
      note: note || null,
    }));

    const { error } = await db.bulkCreateAttendance(records);
    
    if (!error) {
      toast.success(`Marked ${selectedCourses.length} course(s) as ${status}`);
      loadAttendanceRecords();
      setSelectedCourses([]);
      setNote('');
      setShowBulkMark(false);
      
      // Update course attendance counts
      selectedCourses.forEach(courseId => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          db.updateCourse(courseId, {
            total_classes: course.total_classes + 1,
            classes_attended: status === 'present' ? course.classes_attended + 1 : course.classes_attended,
          });
        }
      });
      
      fetchCourses(user.id);
    }
  };

  const todayRecords = getDateAttendance(selectedDate);
  const todayEvents = getDateEvents(selectedDate);

  // Get upcoming exams (next 7 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 14);
    
    const allEvents = [...examSchedule[studentType], ...holidays];
    return allEvents
      .filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const upcomingEvents = getUpcomingEvents();

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'practical': return '🔬';
      case 'theory': return '📝';
      case 'model': return '📋';
      case 'slot': return '📅';
      case 'holiday': return '🎉';
      case 'national': return '🇮🇳';
      default: return '📌';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'practical': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'theory': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'model': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'slot': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'holiday': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'national': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
            Attendance Calendar
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track attendance, exams & holidays
          </p>
        </div>
        
        {/* Student Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleStudentTypeChange('dayScholar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              studentType === 'dayScholar'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            <Home size={16} />
            Day Scholar
          </button>
          <button
            onClick={() => handleStudentTypeChange('hosteler')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              studentType === 'hosteler'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            <Building size={16} />
            Hosteler
          </button>
        </div>
      </div>

      {/* Upcoming Events Banner */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">Upcoming Events</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcomingEvents.map((event, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}
              >
                {getEventTypeIcon(event.type)}
                <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                <span className="hidden sm:inline">- {event.event}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
            className="w-full border-none rounded-lg"
          />
          
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Holiday</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Selected Date */}
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Selected Date
            </h3>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Events for Selected Date */}
          {todayEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-2 border-amber-200 dark:border-amber-700"
            >
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <CalendarIcon size={16} className="text-amber-500" />
                Events
              </h3>
              <div className="space-y-2">
                {todayEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${getEventTypeColor(event.type)}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                      <span className="font-medium text-sm">{event.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Today's Attendance Records */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
              Attendance Records
            </h3>
            
            {todayRecords.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  No records for this date
                </p>
                <button
                  onClick={() => setShowBulkMark(true)}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Mark Attendance
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayRecords.map((record) => {
                  const course = courses.find(c => c.id === record.course_id);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-800 dark:text-white">
                          {course?.course_code}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : record.status === 'absent'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  );
                })}
                <button
                  onClick={() => setShowBulkMark(true)}
                  className="w-full btn-secondary text-sm py-2 mt-2"
                >
                  Add More
                </button>
              </div>
            )}
          </div>

          {/* Quick Exam Schedule */}
          <div className="card bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-primary-500" />
              MS2 Exam Schedule
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {studentType === 'dayScholar' ? 'Day Scholar' : 'Hosteler'} - Oct 2025 to Jan 2026
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-gray-600 dark:text-gray-400">SLOT = Exam Period Start</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-gray-600 dark:text-gray-400">Practical / Capstone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-600 dark:text-gray-400">Model Exam</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-gray-600 dark:text-gray-400">Theory Exam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Popup Modal */}
      <AnimatePresence>
        {showEventPopup && (
          <div className="modal-backdrop" onClick={() => setShowEventPopup(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-100">Events on</p>
                    <h2 className="text-lg font-bold">{formatDate(selectedDate)}</h2>
                  </div>
                  <button
                    onClick={() => setShowEventPopup(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {selectedDateEvents.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl ${getEventTypeColor(event.type)}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                      <div>
                        <p className="font-semibold">{event.event}</p>
                        <p className="text-xs opacity-75 capitalize">{event.type}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 pt-0">
                <button
                  onClick={() => {
                    setShowEventPopup(false);
                    setShowBulkMark(true);
                  }}
                  className="w-full btn-primary text-sm py-2"
                >
                  Mark Attendance for This Day
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Mark Modal */}
      <AnimatePresence>
        {showBulkMark && (
          <div className="modal-backdrop" onClick={() => setShowBulkMark(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Mark Attendance for {formatDate(selectedDate)}
                </h2>

                {/* Course Selection */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCourses([...selectedCourses, course.id]);
                          } else {
                            setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {course.course_code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {course.course_name}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Note */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MessageSquare size={16} className="inline mr-1" />
                    Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input-field"
                    rows="2"
                    placeholder="Add a note..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleBulkMark('present')}
                    className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium transition-colors"
                  >
                    <CheckCircle size={24} />
                    <span className="text-sm mt-1">Present</span>
                  </button>
                  <button
                    onClick={() => handleBulkMark('absent')}
                    className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium transition-colors"
                  >
                    <XCircle size={24} />
                    <span className="text-sm mt-1">Absent</span>
                  </button>
                  <button
                    onClick={() => handleBulkMark('holiday')}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium transition-colors"
                  >
                    <Coffee size={24} />
                    <span className="text-sm mt-1">Holiday</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowBulkMark(false)}
                  className="w-full btn-secondary mt-4"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
