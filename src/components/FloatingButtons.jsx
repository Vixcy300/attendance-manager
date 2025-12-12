import { Calculator, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const FloatingButtons = () => {
  const navigate = useNavigate();
  const { setShowCalculator } = useAppStore();
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <>
      {/* Calculator Button */}
      <button
        onClick={() => setShowCalculator(true)}
        className="fixed z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-lg transition-colors"
        title="Quick Calculator"
        style={{ bottom: '5rem', right: '1rem' }}
      >
        <Calculator size={20} />
      </button>

      {/* Feedback Button */}
      <button
        onClick={() => navigate('/feedback')}
        className="fixed z-50 bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl shadow-lg transition-colors"
        title="Feedback"
        style={{ bottom: '1rem', right: '1rem' }}
      >
        <MessageSquare size={20} />
      </button>
    </>
  );
};

export default FloatingButtons;
