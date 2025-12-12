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

// Exam Schedule
const examSchedule = {
  dayScholar: [
    { date: '2025-10-14', event: 'SLOT A - Start', type: 'slot', color: 'purple' },
    { date: '2025-11-05', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2025-11-06', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-07', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-11-08', event: 'SLOT B - Start', type: 'slot', color: 'purple' },
    { date: '2025-11-24', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2025-11-25', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-26', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-12-11', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2025-12-12', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-12-13', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2026-01-02', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2026-01-03', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2026-01-05', event: 'Theory Exam', type: 'theory', color: 'red' },
  ],
  hosteler: [
    { date: '2025-10-14', event: 'SLOT A - Start', type: 'slot', color: 'purple' },
    { date: '2025-11-10', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2025-11-11', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-12', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-11-26', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2025-11-27', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-11-28', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2025-12-11', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2025-12-12', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2025-12-13', event: 'Theory Exam', type: 'theory', color: 'red' },
    { date: '2026-01-02', event: 'Practical Exam', type: 'practical', color: 'orange' },
    { date: '2026-01-03', event: 'Model Exam', type: 'model', color: 'blue' },
    { date: '2026-01-05', event: 'Theory Exam', type: 'theory', color: 'red' },
  ],
};

// Holidays
const holidays = [
  { date: '2025-01-14', event: 'Pongal', type: 'holiday' },
  { date: '2025-01-26', event: 'Republic Day', type: 'national' },
  { date: '2025-03-14', event: 'Holi', type: 'holiday' },
  { date: '2025-04-14', event: 'Tamil New Year', type: 'holiday' },
  { date: '2025-08-15', event: 'Independence Day', type: 'national' },
  { date: '2025-10-02', event: 'Gandhi Jayanti', type: 'national' },
  { date: '2025-10-20', event: 'Deepavali', type: 'holiday' },
  { date: '2025-12-25', event: 'Christmas', type: 'holiday' },
  { date: '2026-01-01', event: 'New Year', type: 'holiday' },
  { date: '2026-01-14', event: 'Pongal', type: 'holiday' },
  { date: '2026-01-26', event: 'Republic Day', type: 'national' },
];

const Calendar = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentType, setStudentType] = useState('dayScholar');
  const [showBulkMark, setShowBulkMark] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const savedType = localStorage.getItem('studentType');
    if (savedType) setStudentType(savedType);
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

  const loadAttendanceRecords = async () => {
    if (user) {
      const { data } = await db.getAttendanceRecords(user.id);
      setAttendanceRecords(data || []);
    }
  };

  const getDateAttendance = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date.split('T')[0] === dateStr);
  };

  const getDateEvents = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const exams = examSchedule[studentType].filter(e => e.date === dateStr);
    const holidayEvents = holidays.filter(h => h.date === dateStr);
    return [...exams, ...holidayEvents];
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

    const dateStr = selectedDate.toISOString().split('T')[0];
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
    
    const allEvents = [...examSchedule[studentType], ...holidays];
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
    switch(type) {
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
      <div className="calendar-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="text-emerald-400" size={24} />
            Calendar
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Track attendance, exams & holidays</p>
        </div>
        
        {/* Student Type Toggle */}
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1">
          <button
            onClick={() => handleStudentTypeChange('dayScholar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              studentType === 'dayScholar'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Home size={16} />
            Day Scholar
          </button>
          <button
            onClick={() => handleStudentTypeChange('hosteler')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              studentType === 'hosteler'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building size={16} />
            Hosteler
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="calendar-card grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-400">Overall</p>
          <p className="text-xl font-bold text-emerald-400">{overallPercentage}%</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-400">Total Courses</p>
          <p className="text-xl font-bold text-blue-400">{courses.length}</p>
        </div>
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-violet-400">Attended</p>
          <p className="text-xl font-bold text-violet-400">{totalAttended}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-amber-400">Upcoming</p>
          <p className="text-xl font-bold text-amber-400">{upcomingEvents.length}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="calendar-card bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-amber-400" />
            <h3 className="font-medium text-amber-300 text-sm">Upcoming Events</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-2.5 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-medium truncate">{event.event}</p>
                    <p className="text-neutral-500 text-[10px]">
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="calendar-card lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <ReactCalendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            className="attendance-calendar w-full border-none"
          />
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500/40 rounded"></div>
              <span className="text-xs text-neutral-500">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/40 rounded"></div>
              <span className="text-xs text-neutral-500">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500/40 rounded"></div>
              <span className="text-xs text-neutral-500">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-violet-500/40 rounded"></div>
              <span className="text-xs text-neutral-500">Holiday</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Selected Date */}
          <div className="calendar-card bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-400">{selectedDate.getDate()}</span>
              </div>
              <div>
                <p className="text-xs text-emerald-400">Selected Date</p>
                <p className="text-white font-medium">{formatDate(selectedDate)}</p>
              </div>
            </div>
          </div>

          {/* Events for Selected Date */}
          {todayEvents.length > 0 && (
            <div className="calendar-card bg-neutral-900 border border-amber-500/30 rounded-xl p-4">
              <h3 className="font-medium text-amber-300 mb-3 flex items-center gap-2 text-sm">
                <AlertTriangle size={14} />
                Events Today
              </h3>
              <div className="space-y-2">
                {todayEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-neutral-950 rounded-lg px-3 py-2">
                    <span className="text-lg">{getEventIcon(event.type)}</span>
                    <div>
                      <p className="text-white text-sm">{event.event}</p>
                      <p className="text-neutral-500 text-xs capitalize">{event.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Records */}
          {todayRecords.length > 0 && (
            <div className="calendar-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2 text-sm">
                <BookOpen size={14} className="text-neutral-500" />
                Attendance
              </h3>
              <div className="space-y-2">
                {todayRecords.map((record, idx) => {
                  const course = courses.find(c => c.id === record.course_id);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-neutral-950 rounded-lg px-3 py-2">
                      <span className="text-white text-sm">{course?.course_code || 'Unknown'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        record.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
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
          <div className="calendar-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h3 className="font-medium text-white mb-3 text-sm">Quick Mark Attendance</h3>
            <button
              onClick={() => setShowBulkMark(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 px-4 rounded-xl transition-all hover:scale-[1.02] text-sm font-medium"
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
                        className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm font-medium">{course.course_code}</span>
                        <span className={`ml-2 text-xs ${pct >= 80 ? 'text-emerald-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
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
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
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
          background: #10b981 !important;
        }
        .attendance-calendar .react-calendar__navigation button:disabled {
          background: #404040 !important;
          color: #737373 !important;
        }
        .attendance-calendar .react-calendar__month-view__weekdays {
          color: #a3a3a3 !important;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          padding: 0.5rem 0;
        }
        .attendance-calendar .react-calendar__month-view__weekdays abbr {
          text-decoration: none !important;
        }
        .attendance-calendar .react-calendar__month-view__days {
          gap: 2px;
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
        }
        .attendance-calendar .react-calendar__tile:hover {
          background: #404040 !important;
          border-color: #525252;
        }
        .attendance-calendar .react-calendar__tile--active {
          background: linear-gradient(135deg, #10b981, #14b8a6) !important;
          color: white !important;
          border-color: #10b981 !important;
        }
        .attendance-calendar .react-calendar__tile--now {
          background: #374151 !important;
          border-color: #10b981 !important;
        }
        .attendance-calendar .present-day {
          background: rgba(16, 185, 129, 0.4) !important;
          border-color: #10b981 !important;
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
