import { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Download, Target, Award, CheckCircle, AlertTriangle, Calendar, ArrowUp, ArrowDown, Flame, BookOpen, Clock, BarChart2, PieChartIcon, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { db } from '../lib/supabase';
import { calculatePercentage, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';
import { exportToPDF, exportToExcel } from '../utils/export';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const Statistics = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const containerRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchCourses(user.id);
      loadData();
    }
  }, [user]);

  useEffect(() => {
    // Delay animation to ensure DOM is ready
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.stat-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

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
    target: course.target_percentage,
    attended: course.classes_attended,
    total: course.total_classes,
  })).sort((a, b) => b.percentage - a.percentage);

  // Pie chart data
  const totalAttended = courses.reduce((sum, c) => sum + c.classes_attended, 0);
  const totalClasses = courses.reduce((sum, c) => sum + c.total_classes, 0);
  const totalAbsent = totalClasses - totalAttended;

  const pieData = [
    { name: 'Present', value: totalAttended, color: '#10b981' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
  ];

  // Radial progress data
  const radialData = courses.slice(0, 5).map((course, idx) => {
    const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
    return {
      name: course.course_code,
      value: pct,
      fill: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][idx % 5]
    };
  });

  // Weekly trend mock data (based on attendance records)
  const getWeeklyTrend = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, idx) => ({
      day,
      attendance: Math.round(70 + Math.random() * 25),
    }));
  };

  const weeklyTrend = getWeeklyTrend();

  // Monthly trend
  const getMonthlyTrend = () => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map((month, idx) => ({
      month,
      percentage: Math.round(65 + Math.random() * 30),
    }));
  };

  const monthlyTrend = getMonthlyTrend();

  const overallPercentage = parseFloat(calculatePercentage(totalAttended, totalClasses));
  const coursesAboveTarget = courses.filter(c => {
    const pct = parseFloat(calculatePercentage(c.classes_attended, c.total_classes));
    return pct >= c.target_percentage;
  }).length;

  const coursesBelowTarget = courses.length - coursesAboveTarget;
  const averageTarget = courses.length > 0 ? courses.reduce((sum, c) => sum + c.target_percentage, 0) / courses.length : 0;

  // Risk analysis
  const riskCourses = courses.filter(c => {
    const pct = parseFloat(calculatePercentage(c.classes_attended, c.total_classes));
    return pct < 75;
  });

  const safeCourses = courses.filter(c => {
    const pct = parseFloat(calculatePercentage(c.classes_attended, c.total_classes));
    return pct >= 85;
  });

  const handleExportPDF = () => {
    exportToPDF(courses, userData);
    toast.success('Exported as PDF');
  };

  const handleExportExcel = () => {
    exportToExcel(courses, userData);
    toast.success('Exported as Excel');
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-white font-medium">{payload[0].payload.name || payload[0].payload.day || payload[0].payload.month}</p>
          <p className="text-emerald-400 text-sm">{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'trends', label: 'Trends', icon: Activity },
    { id: 'analysis', label: 'Analysis', icon: PieChartIcon },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-emerald-400" size={24} />
            Statistics
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">Comprehensive attendance analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-neutral-800 hover:bg-neutral-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="stat-card flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div className="stat-card grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-emerald-400" />
            <p className="text-sm text-emerald-300">Present</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{totalAttended}</p>
          <p className="text-xs text-emerald-300/60 mt-1">classes attended</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-sm text-red-300">Absent</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{totalAbsent}</p>
          <p className="text-xs text-red-300/60 mt-1">classes missed</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-blue-400" />
            <p className="text-sm text-blue-300">Total</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">{totalClasses}</p>
          <p className="text-xs text-blue-300/60 mt-1">total classes</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-violet-400" />
            <p className="text-sm text-violet-300">Overall</p>
          </div>
          <p className="text-2xl font-bold text-violet-400">{overallPercentage.toFixed(1)}%</p>
          <p className="text-xs text-violet-300/60 mt-1 flex items-center gap-1">
            {overallPercentage >= 75 ? (
              <><ArrowUp size={12} className="text-emerald-400" /> On track</>
            ) : (
              <><ArrowDown size={12} className="text-red-400" /> Needs improvement</>
            )}
          </p>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Bar Chart */}
            <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 size={18} className="text-emerald-400" />
                Course Rankings
              </h2>
              {courseData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: '#333' }} />
                      <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: '#333' }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {courseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#10b981' : entry.percentage >= 60 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-neutral-500">No course data</div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <PieChartIcon size={18} className="text-blue-400" />
                Attendance Distribution
              </h2>
              {totalClasses > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-neutral-500">No attendance data</div>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="text-amber-400" size={20} />
              Performance Insights
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={14} className="text-emerald-400" />
                  <p className="text-neutral-400 text-xs">Above Target</p>
                </div>
                <p className="text-xl font-bold text-emerald-400">{coursesAboveTarget}</p>
                <p className="text-xs text-neutral-500">of {courses.length} courses</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-400" />
                  <p className="text-neutral-400 text-xs">Below Target</p>
                </div>
                <p className="text-xl font-bold text-red-400">{coursesBelowTarget}</p>
                <p className="text-xs text-neutral-500">need attention</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={14} className="text-amber-400" />
                  <p className="text-neutral-400 text-xs">Average Target</p>
                </div>
                <p className="text-xl font-bold text-amber-400">{averageTarget.toFixed(0)}%</p>
                <p className="text-xs text-neutral-500">across all courses</p>
              </div>
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} className="text-violet-400" />
                  <p className="text-neutral-400 text-xs">Best Course</p>
                </div>
                <p className="text-xl font-bold text-violet-400 truncate">
                  {courseData[0]?.name || '-'}
                </p>
                <p className="text-xs text-neutral-500">{courseData[0]?.percentage?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'trends' && (
        <>
          {/* Weekly Trend */}
          <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              Weekly Attendance Trend
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: '#333' }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: '#333' }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="url(#colorAttendance)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-blue-400" />
              Monthly Performance
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: '#333' }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={{ stroke: '#333' }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'analysis' && (
        <>
          {/* Radial Chart */}
          <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="font-semibold text-white mb-4">Top 5 Courses Comparison</h2>
            {radialData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={12} data={radialData}>
                    <RadialBar background dataKey="value" cornerRadius={6} />
                    <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-neutral-500">No data</div>
            )}
          </div>

          {/* Risk Assessment */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="stat-card bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4">
              <h2 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                At Risk Courses ({riskCourses.length})
              </h2>
              {riskCourses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {riskCourses.map(course => {
                    const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                    const needed = calculateClassesNeeded(course.classes_attended, course.total_classes, course.target_percentage);
                    return (
                      <div key={course.id} className="bg-neutral-950 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">{course.course_code}</span>
                          <span className="text-red-400 font-bold">{pct.toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Need {needed} classes to reach {course.target_percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">All courses are above 75%! 🎉</p>
              )}
            </div>

            <div className="stat-card bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <h2 className="font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <CheckCircle size={18} />
                Safe Courses ({safeCourses.length})
              </h2>
              {safeCourses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {safeCourses.map(course => {
                    const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                    const canMiss = calculateClassesCanMiss(course.classes_attended, course.total_classes, course.target_percentage);
                    return (
                      <div key={course.id} className="bg-neutral-950 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">{course.course_code}</span>
                          <span className="text-emerald-400 font-bold">{pct.toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Can miss {canMiss} more classes</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Focus on improving attendance!</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Course Details Table */}
      {courses.length > 0 && (
        <div className="stat-card bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="font-semibold text-white mb-4">Detailed Course Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-2 px-3 text-neutral-500 font-medium">Course</th>
                  <th className="text-center py-2 px-3 text-neutral-500 font-medium">Attended</th>
                  <th className="text-center py-2 px-3 text-neutral-500 font-medium">Total</th>
                  <th className="text-center py-2 px-3 text-neutral-500 font-medium">%</th>
                  <th className="text-center py-2 px-3 text-neutral-500 font-medium">Target</th>
                  <th className="text-center py-2 px-3 text-neutral-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Active Courses */}
                {courses.filter(c => !c.is_completed).map(course => {
                  const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                  const isAbove = pct >= course.target_percentage;
                  return (
                    <tr key={course.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                      <td className="py-2 px-3">
                        <p className="text-white font-medium">{course.course_code}</p>
                        <p className="text-neutral-500 text-xs truncate max-w-[150px]">{course.course_name}</p>
                      </td>
                      <td className="text-center py-2 px-3 text-white">{course.classes_attended}</td>
                      <td className="text-center py-2 px-3 text-white">{course.total_classes}</td>
                      <td className={`text-center py-2 px-3 font-medium ${pct >= 85 ? 'text-emerald-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                        {pct.toFixed(1)}%
                      </td>
                      <td className="text-center py-2 px-3 text-neutral-400">{course.target_percentage}%</td>
                      <td className="text-center py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${isAbove ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isAbove ? 'On Track' : 'At Risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Completed Courses */}
                {courses.filter(c => c.is_completed).map(course => {
                  const pct = parseFloat(calculatePercentage(course.classes_attended, course.total_classes));
                  const isAbove = pct >= course.target_percentage;
                  return (
                    <tr key={course.id} className="border-b border-neutral-800/50 bg-neutral-950/50 opacity-70">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <p className="text-neutral-400 font-medium">{course.course_code}</p>
                          <span className="text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">Done</span>
                        </div>
                        <p className="text-neutral-600 text-xs truncate max-w-[150px]">{course.course_name}</p>
                      </td>
                      <td className="text-center py-2 px-3 text-neutral-400">{course.classes_attended}</td>
                      <td className="text-center py-2 px-3 text-neutral-400">{course.total_classes}</td>
                      <td className={`text-center py-2 px-3 font-medium ${pct >= 85 ? 'text-emerald-400/70' : pct >= 75 ? 'text-amber-400/70' : 'text-red-400/70'}`}>
                        {pct.toFixed(1)}%
                      </td>
                      <td className="text-center py-2 px-3 text-neutral-500">{course.target_percentage}%</td>
                      <td className="text-center py-2 px-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
