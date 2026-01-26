import { useState, useEffect, useRef } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import gsap from 'gsap';
import { CheckCircle, XCircle, Home, Building, Bell, X, CalendarDays, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, calculatePercentage } from '../utils/helpers';

// Exam Schedule - JAN 2026 to MAR 2026
const examSchedule = {
  '2024': {
    dayScholar: [
      { date: '2026-01-07', event: 'SLOT A', type: 'slot', color: 'purple' },
      { date: '2026-01-30', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-01-31', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-02-02', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-02-03', event: 'SLOT B', type: 'slot', color: 'purple' },
      { date: '2026-02-17', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-02-18', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-02-19', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-02-20', event: 'SLOT C', type: 'slot', color: 'purple' },
      { date: '2026-03-07', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-09', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-10', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-03-11', event: 'SLOT D', type: 'slot', color: 'purple' },
      { date: '2026-03-26', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-27', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-28', event: 'Theory Exam', type: 'theory', color: 'red' },
    ],
    hosteler: [
      { date: '2026-01-07', event: 'SLOT A', type: 'slot', color: 'purple' },
      { date: '2026-02-04', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-02-05', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-02-06', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-02-07', event: 'SLOT B', type: 'slot', color: 'purple' },
      { date: '2026-02-19', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-02-20', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-02-23', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-02-24', event: 'SLOT C', type: 'slot', color: 'purple' },
      { date: '2026-03-07', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-09', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-10', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-03-11', event: 'SLOT D', type: 'slot', color: 'purple' },
      { date: '2026-03-24', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-25', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-26', event: 'Theory Exam', type: 'theory', color: 'red' },
    ]
  },
  '2025': {
    dayScholar: [
      { date: '2026-01-27', event: 'SLOT C', type: 'slot', color: 'purple' },
      { date: '2026-02-10', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-02-11', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-02-12', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-02-13', event: 'SLOT D', type: 'slot', color: 'purple' },
      { date: '2026-02-28', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-02', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-03', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-03-04', event: 'SLOT A', type: 'slot', color: 'purple' },
      { date: '2026-03-18', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-19', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-20', event: 'Theory Exam', type: 'theory', color: 'red' },
    ],
    hosteler: [
      { date: '2026-01-31', event: 'SLOT C', type: 'slot', color: 'purple' },
      { date: '2026-02-12', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-02-13', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-02-14', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-02-16', event: 'SLOT D', type: 'slot', color: 'purple' },
      { date: '2026-02-28', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-02', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-03', event: 'Theory Exam', type: 'theory', color: 'red' },
      { date: '2026-03-04', event: 'SLOT A', type: 'slot', color: 'purple' },
      { date: '2026-03-16', event: 'Model Exam', type: 'model', color: 'blue' },
      { date: '2026-03-17', event: 'Practical / Capstone', type: 'practical', color: 'orange' },
      { date: '2026-03-18', event: 'Theory Exam', type: 'theory', color: 'red' },
    ]
  }
};

// Helper to generate date ranges
const getDatesInRange = (startDate, endDate, eventName) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  while (currentDate <= end) {
    dates.push({
      date: currentDate.toISOString().split('T')[0],
      event: eventName,
      type: 'holiday'
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// Holidays 2026
const fixedHolidays = [
  { date: '2026-01-01', event: 'New Year', type: 'holiday' },
  { date: '2026-01-26', event: 'Republic Day', type: 'national' },
  { date: '2026-03-21', event: 'Ramzan', type: 'holiday' },
  { date: '2026-04-14', event: 'Tamil New Year', type: 'holiday' },
  { date: '2026-05-01', event: 'May Day', type: 'holiday' },
  { date: '2026-08-15', event: 'Independence Day', type: 'national' },
  { date: '2026-09-14', event: 'Vinayagar Chathurthi', type: 'holiday' },
  { date: '2026-10-02', event: 'Gandhi Jayanthi', type: 'national' },
  { date: '2026-10-19', event: 'Dussehra', type: 'holiday' },
  { date: '2026-12-25', event: 'Christmas', type: 'holiday' },
];

const Calendar = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentType, setStudentType] = useState('dayScholar');
  const [batch, setBatch] = useState('2024'); // New Batch State
  const [showBulkMark, setShowBulkMark] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const savedType = localStorage.getItem('studentType');
    if (savedType) setStudentType(savedType);

    // Default batch could be saved too if needed
    const savedBatch = localStorage.getItem('batch');
    if (savedBatch) setBatch(savedBatch);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses(user.id);
      loadAttendanceRecords();
    }
  }, [user]);

  useEffect(() => {
    // Delay animation to ensure DOM is ready
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.calendar-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Compute Holidays dynamically based on student type (ranges differ)
  const getHolidays = () => {
    let dynamicHolidays = [];

    if (studentType === 'dayScholar') {
      dynamicHolidays = [
        ...getDatesInRange('2026-01-12', '2026-01-18', 'Pongal Holidays'),
        ...getDatesInRange('2026-05-18', '2026-05-24', 'Summer Holidays'),
        ...getDatesInRange('2026-11-07', '2026-11-15', 'Deepavali Holidays'),
      ];
    } else {
      dynamicHolidays = [
        ...getDatesInRange('2026-01-12', '2026-01-25', 'Pongal Holidays'),
        ...getDatesInRange('2026-05-18', '2026-05-31', 'Summer Holidays'),
        ...getDatesInRange('2026-11-07', '2026-11-22', 'Deepavali Holidays'),
      ];
    }

    return [...fixedHolidays, ...dynamicHolidays];
  };

  const loadAttendanceRecords = async () => {
    if (user) {
      const { data } = await db.getAttendanceRecords(user.id);
      setAttendanceRecords(data || []);
    }
  };

  // Helper to get local date string (YYYY-MM-DD)
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateAttendance = (date) => {
    const dateStr = getLocalDateString(date);
    return attendanceRecords.filter(record => record.date.split('T')[0] === dateStr);
  };

  const currentHolidays = getHolidays();

  const getDateEvents = (date) => {
    const dateStr = getLocalDateString(date);
    // Get exams for current batch & student type
    const batchExams = examSchedule[batch]?.[studentType] || [];
    const exams = batchExams.filter(e => e.date === dateStr);
    const holidayEvents = currentHolidays.filter(h => h.date === dateStr);
    return [...exams, ...holidayEvents];
  };

  const handleStudentTypeChange = (type) => {
    setStudentType(type);
    localStorage.setItem('studentType', type);
    toast.success(`Switched to ${type === 'dayScholar' ? 'Day Scholar' : 'Hosteler'} schedule`);
  };

  const handleBatchChange = (newBatch) => {
    setBatch(newBatch);
    localStorage.setItem('batch', newBatch);
    toast.success(`Switched to ${newBatch} Batch`);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const records = getDateAttendance(date);
      const events = getDateEvents(date);

      if (events.length > 0) {
        const hasExam = events.some(e => ['practical', 'theory', 'model', 'slot'].includes(e.type));
        if (hasExam) return 'exam-day';
        return 'holiday-day';
      }

      if (records.length === 0) return '';

      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;

      if (presentCount > absentCount) return 'present-day';
      if (absentCount > 0) return 'absent-day';
    }
    return '';
  };

  const handleBulkMark = async (status) => {
    if (selectedCourses.length === 0) {
      toast.error('Select at least one course');
      return;
    }

    const dateStr = getLocalDateString(selectedDate);
    const records = selectedCourses.map(courseId => ({
      user_id: user.id,
      course_id: courseId,
      date: dateStr,
      status,
    }));

    const { error } = await db.bulkCreateAttendance(records);

    if (!error) {
      toast.success(`Marked ${selectedCourses.length} course(s) as ${status}`);
      loadAttendanceRecords();

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
      setSelectedCourses([]);
      setShowBulkMark(false);
    }
  };

  const todayEvents = getDateEvents(selectedDate);
  const todayRecords = getDateAttendance(selectedDate);

  // Get upcoming events (next 14 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 14);

    // Current batch exams + current student type holidays
    const batchExams = examSchedule[batch]?.[studentType] || [];
    const allEvents = [...batchExams, ...currentHolidays];
    return allEvents
      .filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);
  };

  // Calculate overall attendance stats
  const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
  const totalAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
  const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;

  const upcomingEvents = getUpcomingEvents();

  const getEventIcon = (type) => {
    switch (type) {
      case 'theory': return '📝';
      case 'practical': return '🔬';
      case 'model': return '📋';
      case 'slot': return '📅';
      case 'holiday': return '🎉';
      case 'national': return '🇮🇳';
      default: return '📌';
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Header */}
      <div className="glass-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
              <CalendarDays className="text-blue-400" size={24} />
            </div>
            Calendar
          </h1>
          <p className="text-neutral-400 text-sm mt-1 ml-11">Track attendance, exams & holidays</p>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {/* Batch Toggle */}
          <div className="flex bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-xl p-1">
            {['2024', '2025'].map((b) => (
              <button
                key={b}
                onClick={() => handleBatchChange(b)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${batch === b
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {b} Batch
              </button>
            ))}
          </div>

          {/* Student Type Toggle */}
          <div className="flex bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-xl p-1">
            <button
              onClick={() => handleStudentTypeChange('dayScholar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${studentType === 'dayScholar'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Home size={14} />
              Day Scholar
            </button>
            <button
              onClick={() => handleStudentTypeChange('hosteler')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${studentType === 'hosteler'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Building size={14} />
              Hosteler
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="glass-card grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center hover:bg-blue-500/20 transition-colors cursor-default">
          <p className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-1">Overall</p>
          <p className="text-2xl font-bold text-blue-400">{overallPercentage}%</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center hover:bg-indigo-500/20 transition-colors cursor-default">
          <p className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-1">Total Courses</p>
          <p className="text-2xl font-bold text-indigo-400">{courses.length}</p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center hover:bg-violet-500/20 transition-colors cursor-default">
          <p className="text-xs font-medium text-violet-300 uppercase tracking-wider mb-1">Attended</p>
          <p className="text-2xl font-bold text-violet-400">{totalAttended}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center hover:bg-amber-500/20 transition-colors cursor-default">
          <p className="text-xs font-medium text-amber-300 uppercase tracking-wider mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-amber-400">{upcomingEvents.length}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="glass-card border-l-4 border-l-amber-500 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-amber-500/10 rounded-lg">
              <Bell size={18} className="text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Upcoming Events</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/60 border border-white/5 rounded-xl p-3 hover:border-white/10 hover:bg-neutral-800/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">{getEventIcon(event.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-medium truncate group-hover:text-blue-300 transition-colors">{event.event}</p>
                    <p className="text-neutral-400 text-[10px] mt-0.5">
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="glass-card lg:col-span-2 p-6">
          <ReactCalendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            className="attendance-calendar w-full border-none"
            calendarType="iso8601"
            showNeighboringMonth={true}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/40 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <span className="text-xs text-neutral-400">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/40 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <span className="text-xs text-neutral-400">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500/40 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
              <span className="text-xs text-neutral-400">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-violet-500/40 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
              <span className="text-xs text-neutral-400">Holiday</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Selected Date */}
          <div className="glass-card bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-blue-500/20 p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-500/20">
                <span className="text-2xl font-bold text-blue-400">{selectedDate.getDate()}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-300 uppercase tracking-wider">Selected Date</p>
                <p className="text-white font-semibold text-lg">{formatDate(selectedDate)}</p>
              </div>
            </div>
          </div>

          {/* Events for Selected Date */}
          {todayEvents.length > 0 && (
            <div className="glass-card border-l-4 border-l-amber-500 p-5">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Events Today
              </h3>
              <div className="space-y-2.5">
                {todayEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-neutral-900/60 rounded-xl px-4 py-3 border border-white/5">
                    <span className="text-xl">{getEventIcon(event.type)}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{event.event}</p>
                      <p className="text-neutral-400 text-xs capitalize">{event.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Records */}
          {todayRecords.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-400" />
                Attendance
              </h3>
              <div className="space-y-2.5">
                {todayRecords.map((record, idx) => {
                  const course = courses.find(c => c.id === record.course_id);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-neutral-900/60 rounded-xl px-4 py-3 border border-white/5">
                      <span className="text-white text-sm font-medium">{course?.course_code || 'Unknown'}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${record.status === 'present' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {record.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Mark */}
          <div className="glass-card p-5">
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              Quick Action
            </h3>
            <button
              onClick={() => setShowBulkMark(true)}
              className="w-full btn-primary"
            >
              Mark for {formatDate(selectedDate).split(',')[0]}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Mark Modal */}
      {showBulkMark && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <div>
                <h2 className="font-semibold text-white">Mark Attendance</h2>
                <p className="text-xs text-neutral-500">{formatDate(selectedDate)}</p>
              </div>
              <button onClick={() => setShowBulkMark(false)} className="p-2 hover:bg-neutral-800 rounded-lg">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-neutral-400 mb-3">Select courses:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {courses.map(course => {
                  const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                  return (
                    <label key={course.id} className="flex items-center gap-3 p-3 bg-neutral-950 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors">
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
                        className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-medium">{course.course_code}</span>
                        <span className={`ml-2 text-xs ${pct >= 80 ? 'text-blue-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleBulkMark('present')}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle size={18} />
                  Present
                </button>
                <button
                  onClick={() => handleBulkMark('absent')}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <XCircle size={18} />
                  Absent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Calendar Styles */}
      <style>{`
        .attendance-calendar {
          background: #171717 !important;
          color: white !important;
          font-family: inherit !important;
          border-radius: 0.75rem;
          padding: 1rem;
        }
        .attendance-calendar .react-calendar__navigation {
          margin-bottom: 0.75rem;
          display: flex;
          gap: 0.25rem;
        }
        .attendance-calendar .react-calendar__navigation button {
          color: white !important;
          font-size: 1rem;
          font-weight: 600;
          background: #262626 !important;
          border-radius: 0.5rem;
          min-width: 44px;
          padding: 0.5rem;
          border: none;
        }
        .attendance-calendar .react-calendar__navigation button:hover {
          background: #3b82f6 !important;
        }
        .attendance-calendar .react-calendar__navigation button:disabled {
          background: #404040 !important;
          color: #737373 !important;
        }
        .attendance-calendar .react-calendar__month-view__weekdays {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          color: #a3a3a3 !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          padding: 0.5rem 0;
          text-align: center;
        }
        .attendance-calendar .react-calendar__month-view__weekdays abbr {
          text-decoration: none !important;
        }
        .attendance-calendar .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 4px;
        }
        .attendance-calendar .react-calendar__tile {
          color: white !important;
          background: #262626 !important;
          padding: 0.75rem 0.5rem;
          border-radius: 0.5rem;
          position: relative;
          font-weight: 500;
          font-size: 0.875rem;
          border: 1px solid transparent;
          width: auto !important;
          margin: 0 !important;
        }
        .attendance-calendar .react-calendar__tile:hover {
          background: #404040 !important;
          border-color: #525252;
        }
        .attendance-calendar .react-calendar__tile--active {
          background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }
        .attendance-calendar .react-calendar__tile--now {
          background: #374151 !important;
          border-color: #3b82f6 !important;
        }
        .attendance-calendar .present-day {
          background: rgba(59, 130, 246, 0.4) !important;
          border-color: #3b82f6 !important;
        }
        .attendance-calendar .absent-day {
          background: rgba(239, 68, 68, 0.4) !important;
          border-color: #ef4444 !important;
        }
        .attendance-calendar .exam-day {
          background: rgba(245, 158, 11, 0.4) !important;
          border-color: #f59e0b !important;
        }
        .attendance-calendar .holiday-day {
          background: rgba(139, 92, 246, 0.4) !important;
          border-color: #8b5cf6 !important;
        }
        .attendance-calendar .react-calendar__tile--neighboringMonth {
          color: #737373 !important;
          background: #1a1a1a !important;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
