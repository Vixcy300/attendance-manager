import { useEffect, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/supabase';
import { formatDate } from '../utils/helpers';

const FeedbackHistory = () => {
  const { user } = useAuthStore();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [user]);

  const loadFeedback = async () => {
    setLoading(true);
    const { data } = await db.getFeedback(user.id);
    setFeedbackList(data || []);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return '🟡';
      case 'Under Review':
        return '🔵';
      case 'Completed':
        return '✅';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            My Feedback History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track the status of your submitted feedback
          </p>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-gray-400 mb-4">
            <Clock size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No feedback submitted yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your feedback history will appear here
          </p>
          <button
            onClick={() => window.location.href = '/feedback'}
            className="btn-primary"
          >
            Submit Your First Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="card hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        feedback.status
                      )}`}
                    >
                      {getStatusIcon(feedback.status)} {feedback.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(feedback.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                    {feedback.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Type: {feedback.type} • Priority: {feedback.priority}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {feedback.description}
                  </p>
                </div>
              </div>

              {feedback.categories && feedback.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {feedback.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;
