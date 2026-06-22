import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { verifyOtpThunk, resendOtpThunk } from '../redux/slices/authSlice.js';

export default function OTPVerify() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErr, setValidationErr] = useState('');
  
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student') navigate('/student-dashboard');
      else if (user.role === 'teacher') navigate('/teacher-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Handle URL missing email
  useEffect(() => {
    if (!email) {
      setValidationErr('Invalid verification link. Please sign up or login again.');
    }
  }, [email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle key input and automatic focusing
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValidationErr('');
    setSuccessMessage('');

    // Auto-focus next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return; // verify exactly 6 digits

    const digits = pasteData.split('');
    setOtp(digits);
    setValidationErr('');
    setSuccessMessage('');

    // Focus the last input
    inputRefs.current[5].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErr('');
    setSuccessMessage('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setValidationErr('Please enter all 6 digits of the OTP code.');
      return;
    }

    if (!email) {
      setValidationErr('Email address is missing. Please register again.');
      return;
    }

    const res = await dispatch(verifyOtpThunk({ email, otp: otpCode }));
    if (res.success) {
      // Redirect happens in useEffect on authentication success
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setValidationErr('');
    setSuccessMessage('');
    
    const res = await dispatch(resendOtpThunk(email));
    if (res.success) {
      setSuccessMessage('A new OTP has been sent successfully.');
      setResendCooldown(60);
      // Reset inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } else {
      setValidationErr(res.error || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass-card p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-brand-50 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 border border-brand-100 dark:border-brand-900/50">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Verify Your Email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 flex items-center justify-center gap-1.5">
            <Mail className="h-4 w-4 shrink-0" />
            <span>Code sent to <strong className="text-slate-700 dark:text-slate-300 font-semibold">{email || 'your email'}</strong></span>
          </p>
        </div>

        {/* Errors & Alerts */}
        {(error || validationErr) && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start gap-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error || validationErr}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl mb-6 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[idx] = el)}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center font-outfit text-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
                placeholder="-"
                disabled={!email || loading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || !email}
            className={`flex items-center gap-1.5 font-semibold transition-colors ${
              resendCooldown > 0 || !email
                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'text-brand-500 hover:text-brand-600 hover:underline'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${resendCooldown > 0 ? '' : 'hover:animate-spin'}`} />
            <span>
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Verification Code'}
            </span>
          </button>

          <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2"></div>

          <Link
            to="/login"
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
