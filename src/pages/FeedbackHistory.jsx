import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/supabase';
import { formatDate } from '../utils/helpers';

const FeedbackHistory = () => {
  const { user } = useAuthStore();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadFeedback();
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
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400';
      case 'Under Review':
        return 'bg-blue-500/10 text-blue-400';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400';
      default:
        return 'bg-neutral-500/10 text-neutral-400';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          to="/feedback" 
          className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft size={18} className="text-neutral-400" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Feedback History</h1>
          <p className="text-neutral-500 text-sm mt-0.5">View your submitted feedback</p>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
          <p className="text-neutral-500">Loading...</p>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl text-center py-12 px-6">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No feedback yet</h3>
          <p className="text-neutral-500 mb-6">You haven't submitted any feedback</p>
          <Link
            to="/feedback"
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
          >
            Submit Feedback
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-white">{feedback.subject}</h3>
                <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${getStatusColor(feedback.status)}`}>
                  {feedback.status}
                </span>
              </div>
              
              <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{feedback.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                  {feedback.type}
                </span>
                <span className="text-neutral-600 flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(new Date(feedback.created_at))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackHistory;
