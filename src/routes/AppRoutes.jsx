import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Page imports
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import OAuthCallback from '../pages/OAuthCallback.jsx';
import About from '../pages/About.jsx';
import StudentDashboard from '../pages/StudentDashboard.jsx';
import TeacherDashboard from '../pages/TeacherDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import QuizList from '../pages/QuizList.jsx';
import QuizAttempt from '../pages/QuizAttempt.jsx';
import CodingChallenges from '../pages/CodingChallenges.jsx';
import Contests from '../pages/Contests.jsx';
import Leaderboards from '../pages/Leaderboards.jsx';
import Profile from '../pages/Profile.jsx';
import CreateQuiz from '../pages/CreateQuiz.jsx';
import CreateContest from '../pages/CreateContest.jsx';
import CreateChallenge from '../pages/CreateChallenge.jsx';

// Protected Route Wrapper Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div className="text-center my-12 dark:text-white">Validating credentials...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If not allowed, redirect to correct dashboard
    if (user?.role === 'student') return <Navigate to="/student-dashboard" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/about" element={<About />} />

      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-quiz"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <CreateQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-contest"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <CreateContest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-challenge"
        element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <CreateChallenge />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <QuizList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:id/attempt"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizAttempt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <CodingChallenges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contests"
        element={
          <ProtectedRoute>
            <Contests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboards"
        element={
          <ProtectedRoute>
            <Leaderboards />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
