import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { authSuccess, authFailure } from '../redux/slices/authSlice.js';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      const fetchUserData = async () => {
        try {
          // Temporarily attach token to request header to fetch user details
          const res = await axios.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          // Dispatch authentication success to Redux slice
          dispatch(authSuccess({ token, user: res.data.user }));

          // Route to matching user dashboard
          const userRole = res.data.user.role;
          if (userRole === 'student') navigate('/student-dashboard');
          else if (userRole === 'teacher') navigate('/teacher-dashboard');
          else if (userRole === 'admin') navigate('/admin-dashboard');
          else navigate('/');
        } catch (err) {
          console.error('OAuth profile retrieval failed:', err);
          dispatch(authFailure(err.response?.data?.message || 'OAuth authentication failed'));
          navigate('/login');
        }
      };

      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="flex flex-col items-center justify-center my-24">
      <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
      <h2 className="text-xl font-bold mt-4 dark:text-white">Authenticating with Google...</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please wait while we set up your session.</p>
    </div>
  );
}
