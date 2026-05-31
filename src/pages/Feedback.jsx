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
      console.error('Feedback error full details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to submit: ${error.message || 'Unknown error'}`);
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
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">Send Feedback</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Help us improve the app</p>
        <p className="text-xs text-neutral-600 mt-1">Submissions today: {submissionCount}/10</p>
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="glass-card space-y-5">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-2">Feedback Type</label>
          <div className="grid grid-cols-3 gap-2">
            {feedbackTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`p-3 rounded-lg border text-center transition-all duration-300 ${formData.type === type.value
                  ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                  : 'border-gray-200 dark:border-white/5 bg-white/80 dark:bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-gray-300 dark:border-white/10'
                  }`}
              >
                <type.icon className={`w-5 h-5 mx-auto mb-1 ${formData.type === type.value ? 'text-blue-400' : type.color
                  }`} />
                <span className={`text-xs ${formData.type === type.value ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {type.value.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1.5">Subject *</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief summary of your feedback"
            required
            maxLength={100}
            className="input-field"
          />
          <p className="text-xs text-neutral-600 mt-1 text-right">{formData.subject.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-1.5">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your feedback in detail (minimum 30 characters)"
            required
            rows={4}
            className="input-field resize-none"
          />
          <p className="text-xs text-neutral-600 mt-1 text-right">{formData.description.length} characters</p>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-2">Related to (optional)</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-300 border ${formData.categories.includes(cat)
                  ? 'bg-blue-600 border-blue-500 text-neutral-900 dark:text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/80 dark:bg-neutral-900/40 border-gray-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-white/5'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm text-neutral-500 dark:text-neutral-400 mb-2">Priority</label>
          <div className="flex gap-2 bg-white/80 dark:bg-neutral-900/40 p-1 rounded-xl border border-gray-200 dark:border-white/5">
            {priorities.map(priority => (
              <button
                key={priority}
                type="button"
                onClick={() => setFormData({ ...formData, priority })}
                className={`flex-1 py-2 rounded-lg text-sm transition-all duration-300 ${formData.priority === priority
                  ? priority === 'High'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : priority === 'Medium'
                      ? 'bg-amber-500 text-neutral-900 dark:text-white shadow-lg shadow-amber-500/20'
                      : 'bg-blue-500 text-neutral-900 dark:text-white shadow-lg shadow-blue-500/20'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-white hover:bg-white/5'
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
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Info */}
      <div className="glass-card text-center">
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Your feedback helps us improve! All submissions are reviewed by our team.
        </p>
      </div>
    </div>
  );
};

export default Feedback;
