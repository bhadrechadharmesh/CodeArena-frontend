import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { SessionNavigationProvider } from './components/SessionNavigation.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { getMeThunk } from './redux/slices/authSlice.js';

function PageLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <main id="main-content" className="flex-grow" tabIndex={-1}><AppRoutes/></main>;
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if token exists to restore active login session on browser refresh
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMeThunk());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col app-container transition-colors duration-200">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:p-3 focus:bg-blue-600 focus:text-white">Skip to content</a>
        <SessionNavigationProvider>
          <PageLayout />
        </SessionNavigationProvider>
      </div>
    </Router>
  );
}
