import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Coffee, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const CalendarPage = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [note, setNote] = useState('');
  const [showBulkMark, setShowBulkMark] = useState(false);

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

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const records = getDateAttendance(date);
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

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Attendance Calendar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage your daily attendance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={tileClassName}
            className="w-full border-none rounded-lg"
          />
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Holiday</span>
            </div>
          </div>
        </div>

        {/* Attendance Details */}
        <div className="space-y-6">
          {/* Selected Date */}
          <div className="card bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Selected Date
            </h3>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatDate(selectedDate)}
            </p>
          </div>

          {/* Today's Records */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Attendance Records
            </h3>
            
            {todayRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No records for this date
                </p>
                <button
                  onClick={() => setShowBulkMark(true)}
                  className="btn-primary"
                >
                  Mark Attendance
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayRecords.map((record) => {
                  const course = courses.find(c => c.id === record.course_id);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {course?.course_code}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {course?.course_name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
                  className="w-full btn-secondary mt-4"
                >
                  Add More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Mark Modal */}
      {showBulkMark && (
        <div className="modal-backdrop" onClick={() => setShowBulkMark(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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
    </div>
  );
};

export default CalendarPage;
