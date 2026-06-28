import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, GraduationCap, AlertCircle } from 'lucide-react';
import { registerUserThunk } from '../redux/slices/authSlice.js';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [college, setCollege] = useState('');
  const [validationErr, setValidationErr] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student-dashboard');
      else if (user.role === 'teacher') navigate('/teacher-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErr('');

    if (!name || !email || !password) {
      setValidationErr('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setValidationErr('Password must be at least 6 characters.');
      return;
    }

    const res = await dispatch(registerUserThunk({ name, email, password, role, college }));
    if (res.success) {
      if (res.requiresVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(res.email || email)}`);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="nm-card p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Join the ultimate competitive coding arena</p>
        </div>

        {(error || validationErr) && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error || validationErr}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm dark:text-white"
                placeholder="Tony Stark"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm dark:text-white"
                placeholder="tony@stark.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm dark:text-white"
                placeholder="Min. 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">I want to join as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full nm-input rounded-xl py-3 px-4 text-sm dark:text-white"
            >
              <option value="student">Student (Take contests & solve challenges)</option>
              <option value="teacher">Teacher (Schedule contests & review stats)</option>
            </select>
          </div>

          {role === 'student' && (
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">College Name</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm dark:text-white"
                  placeholder="MIT"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full nm-btn-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
