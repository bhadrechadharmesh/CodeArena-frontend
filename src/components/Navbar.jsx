import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon, LogOut, Menu, X, Trophy, Code2, ShieldAlert } from 'lucide-react';
import { logout } from '../redux/slices/authSlice.js';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card bg-white/80 dark:bg-slate-900/80 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-brand-600 to-indigo-500 p-2 rounded-lg text-white">
              <Code2 className="h-6 w-6" />
            </div>
            <span className="font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
              CODEARENA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Home</Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">About</Link>
            
            {isAuthenticated && (
              <>
                {user.role === 'student' && (
                  <>
                    <Link to="/student-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Dashboard</Link>
                    <Link to="/quizzes" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Quizzes</Link>
                    <Link to="/challenges" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Coding</Link>
                    <Link to="/contests" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Contests</Link>
                    <Link to="/leaderboards" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Leaderboard</Link>
                  </>
                )}
                {user.role === 'teacher' && (
                  <>
                    <Link to="/teacher-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Dashboard</Link>
                    <Link to="/create-quiz" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Create Quiz</Link>
                    <Link to="/create-contest" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Schedule Contest</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium px-3 py-2 rounded-md text-sm transition-colors">Admin Panel</Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-500 hover:text-red-600 font-medium text-sm px-3 py-2 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-brand-500 font-medium text-sm px-3 py-2">Login</Link>
                <Link to="/register" className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-all duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Home</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">About</Link>

            {isAuthenticated ? (
              <>
                {user.role === 'student' && (
                  <>
                    <Link to="/student-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>
                    <Link to="/quizzes" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Quizzes</Link>
                    <Link to="/challenges" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Coding</Link>
                    <Link to="/contests" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Contests</Link>
                    <Link to="/leaderboards" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Leaderboard</Link>
                  </>
                )}
                {user.role === 'teacher' && (
                  <>
                    <Link to="/teacher-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>
                    <Link to="/create-quiz" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Create Quiz</Link>
                    <Link to="/create-contest" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Schedule Contest</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200">Admin Panel</Link>
                )}
                <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
                  <div className="flex items-center px-3 py-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                  </div>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout(); }}
                    className="block w-full text-left px-3 py-2 text-red-500 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-center text-slate-700 dark:text-slate-200 font-medium">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-center bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
