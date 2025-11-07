import { useEffect, useState } from 'react';
import { User, Mail, Hash, Building2, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    university: '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    const { data } = await db.getUser(user.id);
    setUserData(data);
    if (data) {
      setFormData({
        name: data.name || '',
        roll_number: data.roll_number || '',
        university: data.university || 'SIMATS Engineering',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await updateProfile(formData);
    
    if (!error) {
      loadUserData();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-slide-up max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
          {userData?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Personal Information
        </h2>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Mail size={16} className="inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Email cannot be changed
          </p>
        </div>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User size={16} className="inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        {/* Roll Number */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Hash size={16} className="inline mr-2" />
            Roll Number *
          </label>
          <input
            type="text"
            required
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
            className="input-field"
            placeholder="CS21001"
          />
        </div>

        {/* University */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Building2 size={16} className="inline mr-2" />
            University/College
          </label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className="input-field"
            placeholder="SIMATS Engineering"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <div className="spinner w-5 h-5 border-2"></div>
          ) : (
            <>
              <Save size={20} />
              Save Changes
            </>
          )}
        </button>
      </form>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">Member Since</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {userData?.created_at
              ? new Date(userData.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'N/A'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <p className="text-sm text-green-800 dark:text-green-200 mb-1">Account Status</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">Active</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <p className="text-sm text-purple-800 dark:text-purple-200 mb-1">Account Type</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">Student</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Your data is stored securely and will never be shared with third parties. This is a
          student project and not affiliated with any official institution.
        </p>
      </div>
    </div>
  );
};

export default Profile;
