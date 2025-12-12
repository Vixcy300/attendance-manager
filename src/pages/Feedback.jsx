import { useState, useEffect } from 'react';
import { Send, Bug, Lightbulb, Heart, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { getBrowserInfo } from '../utils/helpers';

const Feedback = () => {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'General Feedback',
    subject: '',
    description: '',
    categories: [],
    priority: 'Medium',
  });

  const feedbackTypes = [
    { value: 'Bug Report', icon: Bug, color: 'text-red-400' },
    { value: 'Feature Request', icon: Lightbulb, color: 'text-amber-400' },
    { value: 'General Feedback', icon: Heart, color: 'text-pink-400' },
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submissionCount >= 10) {
      toast.error('Daily limit reached (10/day)');
      return;
    }

    if (formData.subject.length > 100) {
      toast.error('Subject too long (max 100 chars)');
      return;
    }

    if (formData.description.length < 30) {
      toast.error('Description too short (min 30 chars)');
      return;
    }

    setLoading(true);

    try {
      const feedbackData = {
        user_id: user.id,
        type: formData.type,
        subject: formData.subject,
        description: formData.description,
        categories: formData.categories,
        priority: formData.priority,
        browser_info: getBrowserInfo(),
        status: 'Pending',
        app_version: '3.0.0',
      };

      const { error } = await db.createFeedback(feedbackData);

      if (error) throw error;

      toast.success('Feedback submitted!');
      setFormData({
        type: 'General Feedback',
        subject: '',
        description: '',
        categories: [],
        priority: 'Medium',
      });
      checkSubmissionLimit();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    if (formData.categories.includes(cat)) {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...formData.categories, cat] });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Send Feedback</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Help us improve the app</p>
        <p className="text-xs text-neutral-600 mt-1">Submissions today: {submissionCount}/10</p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-5">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Feedback Type</label>
          <div className="grid grid-cols-3 gap-2">
            {feedbackTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  formData.type === type.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <type.icon className={`w-5 h-5 mx-auto mb-1 ${type.color}`} />
                <span className="text-xs text-white">{type.value.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm text-neutral-400 mb-1.5">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief summary of your feedback"
            required
            maxLength={100}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
          />
          <p className="text-xs text-neutral-600 mt-1">{formData.subject.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-neutral-400 mb-1.5">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your feedback in detail (minimum 30 characters)"
            required
            rows={4}
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
          <p className="text-xs text-neutral-600 mt-1">{formData.description.length} characters</p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Related to (optional)</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  formData.categories.includes(cat)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Priority</label>
          <div className="flex gap-2">
            {priorities.map(priority => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                  formData.priority === priority
                    ? priority === 'High' 
                      ? 'bg-red-500 text-white' 
                      : priority === 'Medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || submissionCount >= 10}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Send size={18} />
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
        <p className="text-neutral-400 text-sm">
          Your feedback helps us improve! All submissions are reviewed by our team.
        </p>
      </div>
    </div>
  );
};

export default Feedback;
