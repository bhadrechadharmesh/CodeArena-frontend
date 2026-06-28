import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { authSuccess } from '../redux/slices/authSlice.js';
import { User, Mail, GraduationCap, FileText, Save, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await axios.put('/api/auth/profile', {
        name,
        college,
        bio
      });

      // Update Redux state
      dispatch(authSuccess({ token, user: res.data.user }));
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-outfit font-extrabold text-3xl dark:text-white mb-2">My Profile</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Update your personal portfolio details and academic credentials</p>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Left Stats column */}
        <div className="nm-card p-6 rounded-2xl text-center">
          <div className="w-20 h-20 nm-inset-sm text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4 uppercase">
            {user?.name.charAt(0)}
          </div>
          <h3 className="font-bold text-lg dark:text-white leading-tight">{user?.name}</h3>
          <span className="text-xs text-brand-600 font-bold uppercase tracking-wider mt-1 block">{user?.role}</span>

          <div className="border-t border-slate-200/50 dark:border-slate-800/50 mt-6 pt-4 space-y-3 text-xs text-left text-slate-500">
            <div className="flex justify-between">
              <span>Member Since:</span>
              <strong className="text-slate-800 dark:text-white">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Points:</span>
              <strong className="text-slate-800 dark:text-white">{user?.totalPoints || 0} pts</strong>
            </div>
            <div className="flex justify-between">
              <span>Day Streak:</span>
              <strong className="text-slate-800 dark:text-white">{user?.streak || 0} days</strong>
            </div>
          </div>
        </div>

        {/* Right Form column */}
        <div className="md:col-span-2 nm-card p-6 rounded-2xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none dark:text-white"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Email Address (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full nm-input opacity-70 cursor-not-allowed rounded-xl py-3 pl-11 pr-4 text-sm text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">College / Institution</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none dark:text-white"
                  placeholder="College Name"
                />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Short Bio</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full nm-btn-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
