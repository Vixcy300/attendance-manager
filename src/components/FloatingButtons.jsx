import { Calculator, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

const FloatingButtons = () => {
  const navigate = useNavigate();
  const { setShowCalculator } = useAppStore();
  const { user } = useAuthStore();

  // Only show for authenticated users
  if (!user) return null;

  return (
    <>
      {/* Calculator Button */}
      <button
        onClick={() => setShowCalculator(true)}
        className="floating-btn"
        title="Quick Attendance Calculator"
        style={{ bottom: '8rem', right: '1.5rem' }}
      >
        <Calculator size={24} />
      </button>

      {/* Feedback Button */}
      <button
        onClick={() => navigate('/feedback')}
        className="floating-btn"
        title="Send Feedback"
      >
        <MessageSquare size={24} />
      </button>
    </>
  );
};

export default FloatingButtons;
