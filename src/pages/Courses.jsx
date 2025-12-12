import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Minus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import { calculatePercentage, getStatusInfo, calculateClassesNeeded, calculateClassesCanMiss } from '../utils/helpers';
import toast from 'react-hot-toast';

const Courses = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses, addCourse, updateCourse, deleteCourse } = useCourseStore();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">My Courses</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Manage your courses and track attendance</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 w-fit"
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl text-center py-12 px-6">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
          <p className="text-neutral-500 mb-6">Start by adding your first course</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Add Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => {
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
    </div>
  );
};

export default Courses;
