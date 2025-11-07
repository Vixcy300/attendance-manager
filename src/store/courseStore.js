import { create } from 'zustand';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useCourseStore = create((set, get) => ({
  courses: [],
  loading: false,

  fetchCourses: async (userId) => {
    set({ loading: true });
    try {
      const { data, error } = await db.getCourses(userId);
      if (error) throw error;
      set({ courses: data || [], loading: false });
    } catch (error) {
      toast.error('Failed to fetch courses');
      set({ loading: false });
    }
  },

  addCourse: async (courseData) => {
    try {
      const { data, error } = await db.createCourse(courseData);
      if (error) throw error;

      set({ courses: [data, ...get().courses] });
      toast.success('Course added successfully');
      return { data, error: null };
    } catch (error) {
      toast.error('Failed to add course');
      return { data: null, error };
    }
  },

  updateCourse: async (courseId, updates) => {
    try {
      const { data, error } = await db.updateCourse(courseId, updates);
      if (error) throw error;

      set({
        courses: get().courses.map(c => c.id === courseId ? data : c)
      });
      toast.success('Course updated successfully');
      return { data, error: null };
    } catch (error) {
      toast.error('Failed to update course');
      return { data: null, error };
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const { error } = await db.deleteCourse(courseId);
      if (error) throw error;

      set({
        courses: get().courses.filter(c => c.id !== courseId)
      });
      toast.success('Course deleted successfully');
      return { error: null };
    } catch (error) {
      toast.error('Failed to delete course');
      return { error };
    }
  },

  incrementAttendance: async (courseId, attended = true) => {
    try {
      const course = get().courses.find(c => c.id === courseId);
      if (!course) throw new Error('Course not found');

      const updates = {
        total_classes: course.total_classes + 1,
        classes_attended: attended ? course.classes_attended + 1 : course.classes_attended,
      };

      await get().updateCourse(courseId, updates);
    } catch (error) {
      console.error('Failed to increment attendance:', error);
    }
  },
}));
