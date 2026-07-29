import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../api';
import { User, Mail, Calendar, Shield, Sun, Moon, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const { dark, toggleDark } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/me', { name });
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your account settings</p>
      </div>

      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-gray-800">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <Mail size={18} className="text-indigo-500" />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Email</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
              <Calendar size={18} className="text-purple-500" />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Joined</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit name */}
          <div className="space-y-3">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Display Name</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-50 shadow-lg shadow-indigo-500/25"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Shield size={18} className="text-indigo-500" /> Preferences
        </h3>
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
          <div className="flex items-center gap-3">
            {dark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-indigo-500" />}
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Toggle dark/light theme</p>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-indigo-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute w-5 h-5 rounded-full bg-white shadow top-0.5 transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
