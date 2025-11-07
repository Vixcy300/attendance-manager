import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Upload, X, Heart, Bug, Lightbulb } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getBrowserInfo } from '../utils/helpers';

const Feedback = () => {
  const { user } = useAuthStore();
  const { showFeedbackForm, setShowFeedbackForm } = useAppStore();
  const [userData, setUserData] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [formData, setFormData] = useState({
    type: 'General Feedback',
    subject: '',
    description: '',
    categories: [],
    priority: 'Medium',
    screenshot: null,
  });

  const feedbackTypes = [
    { value: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { value: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'General Feedback', icon: Heart, color: 'text-pink-500' },
    { value: 'UI/UX Improvement', icon: '🎨', color: 'text-purple-500' },
  ];

  const categories = ['Dashboard', 'Courses', 'Calculator', 'Statistics', 'Calendar', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    if (user) {
      loadUserData();
      checkSubmissionLimit();
    }
  }, [user]);

  const loadUserData = async () => {
    const { data } = await db.getUser(user.id);
    setUserData(data);
  };

  const checkSubmissionLimit = async () => {
    const { data } = await db.getFeedback(user.id);
    const today = new Date().toDateString();
    const todaySubmissions = data?.filter(f => 
      new Date(f.created_at).toDateString() === today
    ).length || 0;
    setSubmissionCount(todaySubmissions);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, screenshot: file });
    }
  };

  const handleQuickFeedback = (type, message) => {
    setFormData({
      ...formData,
      type,
      subject: message,
      description: message,
    });
    toast.success(`Quick feedback: ${message}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check submission limit
    if (submissionCount >= 10) {
      toast.error('You have reached the daily submission limit (10 submissions per day)');
      return;
    }

    // Validate
    if (formData.subject.length > 100) {
      toast.error('Subject must be less than 100 characters');
      return;
    }

    if (formData.description.length < 30) {
      toast.error('Description must be at least 30 characters');
      return;
    }

    try {
      // Save to database
      const feedbackData = {
        user_id: user.id,
        type: formData.type,
        subject: formData.subject,
        description: formData.description,
        categories: formData.categories,
        priority: formData.priority,
        status: 'Submitted',
      };

      const { data: savedFeedback, error } = await db.createFeedback(feedbackData);
      if (error) throw error;

      // Feedback saved successfully - you can view it in Feedback History
      console.log('✅ Feedback saved to database:', savedFeedback?.id);

      // Send email via Formspree
      try {
        const formspreeData = {
          name: userData?.name || 'Anonymous',
          email: userData?.email || user.email,
          rollNumber: userData?.roll_number || 'N/A',
          feedbackType: formData.type,
          subject: formData.subject,
          description: formData.description,
          categories: formData.categories.join(', '),
          priority: formData.priority,
          timestamp: new Date().toLocaleString('en-IN'),
          feedbackId: savedFeedback?.id,
        };

        const emailResponse = await fetch('https://formspree.io/f/xqawzkzd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formspreeData),
        });

        if (emailResponse.ok) {
          console.log('✅ Email sent successfully via Formspree!');
          toast.success('Thank you! Your feedback has been submitted and emailed!');
        } else {
          console.error('Email failed:', await emailResponse.text());
          toast.success('Feedback saved! (Email notification pending)');
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        toast.success('Feedback saved successfully!');
      }
      
      // Reset form
      setFormData({
        type: 'General Feedback',
        subject: '',
        description: '',
        categories: [],
        priority: 'Medium',
        screenshot: null,
      });
      
      setSubmissionCount(submissionCount + 1);
      if (showFeedbackForm) {
        setShowFeedbackForm(false);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const toggleCategory = (category) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter(c => c !== category)
        : [...formData.categories, category],
    });
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Feedback & Suggestions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us improve the Student Attendance Manager
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/feedback-history'}
          className="btn-secondary"
        >
          My Feedback History
        </button>
      </div>

      {/* Daily Limit Warning */}
      {submissionCount >= 8 && (
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ You have submitted {submissionCount}/10 feedback today. {10 - submissionCount} remaining.
          </p>
        </div>
      )}

      {/* Quick Feedback Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFeedback('General Feedback', 'Love this! ❤️')}
          className="card bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-2 border-pink-200 dark:border-pink-700"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">❤️</div>
            <p className="font-semibold text-pink-800 dark:text-pink-200">Love this!</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFeedback('Bug Report', 'Found bug 🐛')}
          className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🐛</div>
            <p className="font-semibold text-red-800 dark:text-red-200">Found a Bug</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFeedback('Feature Request', 'Suggest improvement 💡')}
          className="card bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-200 dark:border-yellow-700"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">💡</div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">Suggest Improvement</p>
          </div>
        </motion.button>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Detailed Feedback Form
        </h2>

        {/* Feedback Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Feedback Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {feedbackTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === type.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">
                  {typeof type.icon === 'string' ? type.icon : <type.icon className={type.color} />}
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {type.value}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject * (Max 100 characters)
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="input-field"
            placeholder="Brief summary of your feedback"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.subject.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description * (Min 30 characters)
          </label>
          <textarea
            required
            minLength={30}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows="5"
            placeholder="Please provide detailed information..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.description.length} characters
          </p>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Related Categories (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  formData.categories.includes(category)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Priority
          </label>
          <div className="flex gap-3">
            {priorities.map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  formData.priority === priority
                    ? priority === 'High'
                      ? 'bg-red-500 text-white'
                      : priority === 'Medium'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Screenshot (Optional, Max 5MB)
          </label>
          <div className="flex items-center gap-4">
            <label className="btn-secondary cursor-pointer flex items-center gap-2">
              <Upload size={18} />
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {formData.screenshot && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.screenshot.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, screenshot: null })}
                  className="text-red-500 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submissionCount >= 10}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          <Send size={20} />
          Submit Feedback
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Your feedback will be reviewed by the developer
        </p>
      </form>
    </div>
  );
};

export default Feedback;
