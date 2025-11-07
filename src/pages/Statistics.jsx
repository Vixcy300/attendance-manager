import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { db } from '../lib/supabase';
import { calculatePercentage, calculateMonthlyAttendance } from '../utils/helpers';
import { exportToPDF, exportToExcel } from '../utils/export';
import toast from 'react-hot-toast';

const Statistics = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCourses(user.id);
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const { data: records } = await db.getAttendanceRecords(user.id);
    const { data: userProfile } = await db.getUser(user.id);
    setAttendanceRecords(records || []);
    setUserData(userProfile);
  };

  // Course-wise data for bar chart
  const courseData = courses.map(course => ({
    name: course.course_code,
    percentage: parseFloat(calculatePercentage(course.classes_attended, course.total_classes)),
    attended: course.classes_attended,
    total: course.total_classes,
  }));

  // Monthly attendance data
  const monthlyData = calculateMonthlyAttendance(attendanceRecords);

  // Pie chart data
  const totalAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
  const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
  const totalAbsent = totalClasses - totalAttended;

  const pieData = [
    { name: 'Present', value: totalAttended, color: '#10b981' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
  ];

  const handleExportPDF = () => {
    exportToPDF(courses, userData);
    toast.success('Report exported as PDF');
  };

  const handleExportExcel = () => {
    exportToExcel(courses, userData);
    toast.success('Report exported as Excel');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Statistics & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize your attendance trends and patterns
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-800 dark:text-green-200 mb-1">Total Present</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalAttended}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <p className="text-sm text-red-800 dark:text-red-200 mb-1">Total Absent</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalAbsent}</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">Total Classes</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalClasses}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-1">Overall %</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {calculatePercentage(totalAttended, totalClasses)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course-wise Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" />
            Course-wise Attendance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Legend />
              <Bar dataKey="percentage" fill="#4A90E2" name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Attendance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Monthly Attendance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#4A90E2"
                strokeWidth={3}
                name="Attendance %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Detailed Course Report
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Course Code</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Course Name</th>
                <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Attended</th>
                <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Total</th>
                <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Percentage</th>
                <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => {
                const percentage = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                return (
                  <tr
                    key={course.id}
                    className={`border-b border-gray-100 dark:border-gray-800 ${
                      index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">
                      {course.course_code}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {course.course_name}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-800 dark:text-white">
                      {course.classes_attended}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-800 dark:text-white">
                      {course.total_classes}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="font-bold text-gray-800 dark:text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          percentage >= 75
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : percentage >= 65
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {percentage >= 75 ? 'Safe' : percentage >= 65 ? 'Warning' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
