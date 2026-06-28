import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUserThunk } from '../redux/slices/authSlice.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!email || !password) {
      setValidationErr('Please fill in all fields.');
      return;
    }

    const res = await dispatch(loginUserThunk({ email, password }));
    if (res.success) {
      // Redirect happens in useEffect
    } else if (res.requiresVerification) {
      navigate(`/verify-otp?email=${encodeURIComponent(res.email || email)}`);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect browser directly to backend passport google OAuth route
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="nm-card p-8 rounded-3xl">
        <div className="text-center mb-8">
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Log in to access your dashboard and competitions</p>
        </div>

        {/* Errors */}
        {(error || validationErr) && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error || validationErr}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full nm-input rounded-xl py-3 pl-11 pr-4 text-sm dark:text-white"
                placeholder="you@example.com"
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
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full nm-btn-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="text-xs text-slate-400 px-3 uppercase tracking-wider">Or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          disabled
          type="button"
          className="w-full nm-inset-sm rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 cursor-not-allowed"
        >
          <Chrome className="h-4 w-4 text-slate-400 dark:text-slate-500 fill-current" />
          <span>Login with Google (Coming Soon)</span>
        </button>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
