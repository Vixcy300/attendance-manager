import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { CheckCircle, XCircle, Home, Building, Bell, X, CalendarDays, Clock, BookOpen, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, calculatePercentage } from '../utils/helpers';
import { EventManager } from '../components/ui/event-manager';
import { usePageTitle } from '../hooks/usePageTitle';

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
  usePageTitle('Calendar & Schedule');
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentType, setStudentType] = useState('dayScholar');
  const [batch, setBatch] = useState('2024'); // New Batch State
  const [showBulkMark, setShowBulkMark] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [customEventTrigger, setCustomEventTrigger] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const savedType = localStorage.getItem('studentType');
    if (savedType) setStudentType(savedType);

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

  // Compute Holidays dynamically based on student type
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

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentHolidays = getHolidays();

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

  const handleBulkMark = async (status) => {
    if (selectedCourses.length === 0) {
      toast.error('Select at least one course');
      return;
    }

    const dateStr = getLocalDateString(new Date());
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
      setCustomEventTrigger(prev => prev + 1); // refresh events
    }
  };

  // Compile all unified events for the EventManager
  const combinedEvents = useMemo(() => {
    if (!user) return [];
    const list = [];

    // 1. Add University Exams based on Selected Batch & Student Type
    const batchExams = examSchedule[batch]?.[studentType] || [];
    batchExams.forEach(exam => {
      list.push({
        id: `exam-${exam.date}-${exam.event}`,
        title: `Exam: ${exam.event}`,
        description: `${exam.type.toUpperCase()} - university schedule`,
        startTime: new Date(exam.date + "T09:00:00"),
        endTime: new Date(exam.date + "T12:00:00"),
        color: "orange",
        category: "Exam",
        tags: ["University", exam.type]
      });
    });

    // 2. Add University Holidays
    currentHolidays.forEach(holiday => {
      list.push({
        id: `holiday-${holiday.date}-${holiday.event}`,
        title: `Holiday: ${holiday.event}`,
        description: `Saveetha University Holiday`,
        startTime: new Date(holiday.date + "T00:00:00"),
        endTime: new Date(holiday.date + "T23:59:59"),
        color: "green",
        category: "Holiday",
        tags: ["Holiday", holiday.type]
      });
    });

    // 3. Add Student Attendance Records
    attendanceRecords.forEach(record => {
      const course = courses.find(c => c.id === record.course_id);
      const courseCode = course ? course.course_code : 'Attendance';
      list.push({
        id: `attendance-${record.id}`,
        title: `${courseCode}: ${record.status.toUpperCase()}`,
        description: `Attendance log for course`,
        startTime: new Date(record.date.split('T')[0] + "T10:00:00"),
        endTime: new Date(record.date.split('T')[0] + "T11:00:00"),
        color: record.status === "present" ? "blue" : "red",
        category: "Attendance",
        tags: [record.status.toUpperCase()]
      });
    });

    // 4. Add Custom User Events from LocalStorage
    const savedCustomEvents = JSON.parse(localStorage.getItem(`custom_events_${user.id}`) || '[]');
    savedCustomEvents.forEach(evt => {
      list.push({
        ...evt,
        startTime: new Date(evt.startTime),
        endTime: new Date(evt.endTime)
      });
    });

    return list;
  }, [user, batch, studentType, attendanceRecords, courses, customEventTrigger]);

  const handleEventCreate = (newEvent) => {
    if (!user) return;
    const key = `custom_events_${user.id}`;
    const savedCustomEvents = JSON.parse(localStorage.getItem(key) || '[]');
    const eventWithId = {
      ...newEvent,
      id: Math.random().toString(36).substr(2, 9)
    };
    savedCustomEvents.push(eventWithId);
    localStorage.setItem(key, JSON.stringify(savedCustomEvents));
    toast.success("Event created successfully");
    setCustomEventTrigger(prev => prev + 1);
  };

  const handleEventUpdate = (id, updatedFields) => {
    if (!user) return;
    if (id.startsWith('exam-') || id.startsWith('holiday-') || id.startsWith('attendance-')) {
      toast.error("Cannot modify official university records");
      return;
    }
    const key = `custom_events_${user.id}`;
    const savedCustomEvents = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = savedCustomEvents.map(evt => {
      if (evt.id === id) {
        return { ...evt, ...updatedFields };
      }
      return evt;
    });
    localStorage.setItem(key, JSON.stringify(updated));
    toast.success("Event updated");
    setCustomEventTrigger(prev => prev + 1);
  };

  const handleEventDelete = (id) => {
    if (!user) return;
    if (id.startsWith('exam-') || id.startsWith('holiday-') || id.startsWith('attendance-')) {
      toast.error("Cannot delete official university records");
      return;
    }
    const key = `custom_events_${user.id}`;
    const savedCustomEvents = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = savedCustomEvents.filter(evt => evt.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    toast.success("Event deleted");
    setCustomEventTrigger(prev => prev + 1);
  };

  // Get upcoming events (next 14 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 14);

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
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="glass-card bg-white/80 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden rounded-2xl border border-gray-200 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 flex items-center gap-2 tracking-tight">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl backdrop-blur-md border border-gray-300 shadow-lg shadow-indigo-500/20">
              <CalendarDays className="text-indigo-400" size={24} />
            </div>
            Saveetha Calendar
          </h1>
          <p className="text-neutral-500 text-sm mt-1 ml-12">Track academic events, exams & logs</p>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {/* Batch Toggle */}
          <div className="flex bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-1">
            {['2024', '2025'].map((b) => (
              <button
                key={b}
                onClick={() => handleBatchChange(b)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${batch === b
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/5'
                  }`}
              >
                {b} Batch
              </button>
            ))}
          </div>

          {/* Student Type Toggle */}
          <div className="flex bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => handleStudentTypeChange('dayScholar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${studentType === 'dayScholar'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/5'
                }`}
            >
              <Home size={14} />
              Day Scholar
            </button>
            <button
              onClick={() => handleStudentTypeChange('hosteler')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${studentType === 'hosteler'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/5'
                }`}
            >
              <Building size={14} />
              Hosteler
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="glass-card grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border border-gray-200 bg-neutral-900/20">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center hover:bg-indigo-500/20 transition-all cursor-default hover:scale-[1.02] duration-300">
          <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Overall Attendance</p>
          <p className="text-2xl font-black text-indigo-400">{overallPercentage}%</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-all cursor-default hover:scale-[1.02] duration-300">
          <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1">Total Courses</p>
          <p className="text-2xl font-black text-purple-400">{courses.length}</p>
        </div>
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 text-center hover:bg-pink-500/20 transition-all cursor-default hover:scale-[1.02] duration-300">
          <p className="text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1">Attended Classes</p>
          <p className="text-2xl font-black text-pink-400">{totalAttended}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center hover:bg-amber-500/20 transition-all cursor-default hover:scale-[1.02] duration-300">
          <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">Upcoming Events</p>
          <p className="text-2xl font-black text-amber-400">{upcomingEvents.length}</p>
        </div>
      </div>

      {/* Quick Mark Attendance Action */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowBulkMark(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-neutral-900 font-bold py-3.5 px-6 rounded-full transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          <Sparkles size={16} /> Quick Mark Attendance
        </button>
      </div>

      {/* Upcoming Events Alerts */}
      {upcomingEvents.length > 0 && (
        <div className="glass-card border-l-4 border-l-amber-500 p-5 rounded-2xl border border-gray-200 bg-neutral-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-amber-500/10 rounded-lg">
              <Bell size={18} className="text-amber-400" />
            </div>
            <h3 className="font-bold text-neutral-900 tracking-wide">Upcoming Academic Events</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className="bg-white/90 border border-gray-200 rounded-xl p-3 hover:border-gray-300 hover:bg-neutral-800/60 transition-all group cursor-default"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">{getEventIcon(event.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-neutral-900 text-xs font-semibold truncate group-hover:text-indigo-300 transition-colors">{event.event}</p>
                    <p className="text-neutral-500 text-[10px] mt-0.5 font-medium">
                      {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Scheduler */}
      <div className="animate-fade-in">
        <EventManager
          events={combinedEvents}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          categories={["Exam", "Holiday", "Attendance", "Study", "Personal", "Reminder"]}
          availableTags={["University", "Important", "Urgent", "Present", "Absent", "Self-Study"]}
        />
      </div>

      {/* Bulk Mark Attendance Modal */}
      {showBulkMark && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="font-extrabold text-neutral-900 text-lg">Quick Mark Attendance</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Logs attendance for today ({formatDate(new Date())})</p>
              </div>
              <button onClick={() => setShowBulkMark(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm font-semibold text-neutral-500 mb-3">Select courses to log today's status:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-5 pr-1">
                {courses.map(course => {
                  const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                  return (
                    <label key={course.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-neutral-800/80 transition-colors border border-gray-200">
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
                        className="w-4 h-4 rounded border-neutral-700 bg-white text-indigo-500 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-neutral-900 text-sm font-bold">{course.course_code}</span>
                        <span className={`ml-2 text-xs font-semibold ${pct >= 80 ? 'text-indigo-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-neutral-900 py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-bold hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                >
                  <CheckCircle size={18} />
                  Present
                </button>
                <button
                  onClick={() => handleBulkMark('absent')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-neutral-900 py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-bold hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/20"
                >
                  <XCircle size={18} />
                  Absent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
