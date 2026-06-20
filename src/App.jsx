import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { getMeThunk } from './redux/slices/authSlice.js';

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
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}
