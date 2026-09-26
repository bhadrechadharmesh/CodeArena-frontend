import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { forgotPasswordThunk, verifyResetOtpThunk, resetPasswordThunk } from '../redux/slices/authSlice.js';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reset errors/success messages on step change
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [step]);

  // Focus the first OTP input when moving to Step 2
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    const res = await dispatch(forgotPasswordThunk(email));
    setLoading(false);
    if (res.success) {
      setStep(2);
      setSuccessMsg(res.message || 'OTP sent successfully to your email.');
    } else {
      setErrorMsg(res.error || 'Failed to send OTP. Please try again.');
    }
  };

  // Step 2: Handle OTP code inputs
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMsg('');

    // Auto-focus next input if entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const digits = pasteData.split('');
    setOtp(digits);
    setErrorMsg('');
    inputRefs.current[5].focus();
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Call reset password
    const res = await dispatch(resetPasswordThunk(email, otpCode, newPassword));
    setLoading(false);

    if (res.success) {
      setStep(3);
    } else {
      setErrorMsg(res.error || 'Password reset failed. Please check the OTP and try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="surface-card p-8 rounded-lg transition-all duration-300">
        
        {/* Step 1: Request OTP */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 surface-card-small rounded-md flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Forgot Password</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Enter your email address to receive a One-Time Password (OTP) for password reset.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full field-control rounded-md py-3 pl-11 pr-4 text-sm dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full button-primary font-semibold py-3 rounded-md flex items-center justify-center gap-2"
              >
                {loading ? 'Sending OTP...' : (
                  <>
                    <span>Send Reset OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Verification and Reset Password */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 surface-card-small rounded-md flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Verify & Reset</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Verification code has been sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>.
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-md mb-6 text-sm">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 flex items-start gap-2 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              
              {/* OTP Digits */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-3 text-center">
                  Enter 6-Digit OTP
                </label>
                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-14 text-center font-display text-xl font-bold field-control rounded-md dark:text-white"
                      placeholder="-"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full field-control rounded-md py-3 pl-11 pr-4 text-sm dark:text-white"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full field-control rounded-md py-3 pl-11 pr-4 text-sm dark:text-white"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full button-primary font-semibold py-3 rounded-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 text-xs font-semibold text-brand-500 hover:text-brand-600 hover:underline block mx-auto"
            >
              Resend OTP / Change Email
            </button>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white mb-2">Reset Success!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Your password has been successfully reset. You can now use your new password to sign in.
            </p>
            <Link
              to="/login"
              className="w-full button-primary font-semibold py-3 rounded-md inline-flex items-center justify-center gap-2"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Back to Sign In Link (only shown for Steps 1 & 2) */}
        {step !== 3 && (
          <div className="mt-8 flex flex-col items-center gap-4 text-xs">
            <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2"></div>
            <Link
              to="/login"
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
