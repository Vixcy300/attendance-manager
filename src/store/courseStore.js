import { create } from 'zustand';
import { db } from '../lib/supabase';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

export const useCourseStore = create((set, get) => ({
  courses: [],
  loading: false,

  fetchCourses: async (userId) => {
    set({ loading: true });
    try {
      const isGuest = useAuthStore.getState().isGuest;
      if (isGuest) {
        const stored = localStorage.getItem('guest_courses');
        set({ courses: stored ? JSON.parse(stored) : [], loading: false });
        return;
      }

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
      const isGuest = useAuthStore.getState().isGuest;
      let newCourse;

      if (isGuest) {
        newCourse = { ...courseData, id: `guest-${Date.now()}` };
        const updatedCourses = [newCourse, ...get().courses];
        set({ courses: updatedCourses });
        localStorage.setItem('guest_courses', JSON.stringify(updatedCourses));
      } else {
        const { data, error } = await db.createCourse(courseData);
        if (error) throw error;
        newCourse = data;
        set({ courses: [data, ...get().courses] });
      }

      toast.success('Course added successfully');
      return { data: newCourse, error: null };
    } catch (error) {
      toast.error('Failed to add course');
      return { data: null, error };
    }
  },

  batchImportCourses: async (importedCourses, userId) => {
    try {
      const isGuest = useAuthStore.getState().isGuest;
      const currentCourses = [...get().courses];
      let newCount = 0;
      let updateCount = 0;

      for (const imported of importedCourses) {
        const existingIndex = currentCourses.findIndex(c => c.course_code === imported.course_code);
        
        if (existingIndex !== -1) {
          // Update existing
          const existing = currentCourses[existingIndex];
          if (existing.classes_attended !== imported.classes_attended || existing.total_classes !== imported.total_classes) {
            const updates = {
              classes_attended: imported.classes_attended,
              total_classes: imported.total_classes,
            };
            if (!isGuest) {
              await db.updateCourse(existing.id, updates);
            }
            currentCourses[existingIndex] = { ...existing, ...updates };
            updateCount++;
          }
        } else {
          // Add new
          let newCourse;
          const courseData = { ...imported, user_id: userId };
          if (isGuest) {
            newCourse = { ...courseData, id: `guest-${Date.now()}-${Math.random()}` };
          } else {
            const { data } = await db.createCourse(courseData);
            newCourse = data;
          }
          currentCourses.push(newCourse);
          newCount++;
        }
      }

      set({ courses: currentCourses });
      if (isGuest) {
        localStorage.setItem('guest_courses', JSON.stringify(currentCourses));
      }

      if (newCount > 0 || updateCount > 0) {
        toast.success(`Sync complete: ${newCount} added, ${updateCount} updated`);
      } else {
        toast.success('Sync complete: All courses are up to date');
      }
      return { error: null };
    } catch (error) {
      console.error('Batch import error:', error);
      toast.error('Failed to sync courses');
      return { error };
    }
  },

  updateCourse: async (courseId, updates) => {
    try {
      const isGuest = useAuthStore.getState().isGuest;
      let updatedCourse;

      if (isGuest) {
        const updatedCourses = get().courses.map(c => 
          c.id === courseId ? { ...c, ...updates } : c
        );
        set({ courses: updatedCourses });
        localStorage.setItem('guest_courses', JSON.stringify(updatedCourses));
        updatedCourse = updatedCourses.find(c => c.id === courseId);
      } else {
        const { data, error } = await db.updateCourse(courseId, updates);
        if (error) throw error;
        set({ courses: get().courses.map(c => c.id === courseId ? data : c) });
        updatedCourse = data;
      }

      toast.success('Course updated successfully');
      return { data: updatedCourse, error: null };
    } catch (error) {
      toast.error('Failed to update course');
      return { data: null, error };
    }
  },

  deleteCourse: async (courseId) => {
    try {
      const isGuest = useAuthStore.getState().isGuest;

      if (isGuest) {
        const updatedCourses = get().courses.filter(c => c.id !== courseId);
        set({ courses: updatedCourses });
        localStorage.setItem('guest_courses', JSON.stringify(updatedCourses));
      } else {
        const { error } = await db.deleteCourse(courseId);
        if (error) throw error;
        set({ courses: get().courses.filter(c => c.id !== courseId) });
      }

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
