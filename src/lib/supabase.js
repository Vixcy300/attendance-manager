import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Users
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Courses
  async getCourses(userId) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    return { data, error };
  },

  async updateCourse(courseId, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();
    return { data, error };
  },

  async deleteCourse(courseId) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    return { error };
  },

  // Attendance Records
  async getAttendanceRecords(userId, courseId = null) {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  async createAttendanceRecord(recordData) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert([recordData])
      .select()
      .single();
    return { data, error };
  },

  async updateAttendanceRecord(recordId, updates) {
    const { data, error } = await supabase
      .from('attendance_records')
      .update(updates)
      .eq('id', recordId)
      .select()
      .single();
    return { data, error };
  },

  async deleteAttendanceRecord(recordId) {
    const { error } = await supabase
      .from('attendance_records')
      .delete()
      .eq('id', recordId);
    return { error };
  },

  async bulkCreateAttendance(records) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert(records)
      .select();
    return { data, error };
  },

  // Feedback
  async createFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select()
      .single();
    return { data, error };
  },

  async getFeedback(userId) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async updateFeedbackStatus(feedbackId, status) {
    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', feedbackId)
      .select()
      .single();
    return { data, error };
  },
};
