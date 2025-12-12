import { useEffect, useState } from 'react';
import { User, Mail, Hash, Building2, Save, Shield } from 'lucide-react';
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
    if (user) loadUserData();
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
    if (!error) loadUserData();
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
          {userData?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">My Profile</h1>
        <p className="text-neutral-500 text-sm">Manage your account information</p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 space-y-5">
        <h2 className="font-semibold text-white mb-4">Personal Information</h2>

        {/* Email (Read-only) */}
        <div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
            <Mail size={14} />
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-500 cursor-not-allowed"
          />
          <p className="text-xs text-neutral-600 mt-1">Email cannot be changed</p>
          
          <div className="mt-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400 flex items-start gap-2">
              <Shield size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Secure Storage:</strong> Your data is encrypted with AES-256 and protected with SSL/TLS.
              </span>
            </p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
            <User size={14} />
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your name"
            required
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Roll Number */}
        <div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
            <Hash size={14} />
            Roll Number
          </label>
          <input
            type="text"
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
            placeholder="Enter your roll number"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* University */}
        <div>
          <label className="flex items-center gap-2 text-sm text-neutral-400 mb-1.5">
            <Building2 size={14} />
            University / College
          </label>
          <input
            type="text"
            value={formData.university}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            placeholder="Enter your institution"
            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Account Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h3 className="font-medium text-white mb-3">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Member Since</span>
            <span className="text-neutral-300">
              {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Account Status</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
