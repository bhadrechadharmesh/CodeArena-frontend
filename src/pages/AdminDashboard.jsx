import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldAlert, Users, FolderCheck, CalendarRange, EyeOff, Trash2, Ban } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [violations, setViolations] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, violationsRes] = await Promise.all([
        axios.get('/api/analytics/admin'),
        axios.get('/api/violations')
      ]);
      setAnalytics(analyticsRes.data);
      setViolations(violationsRes.data.violations);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBanUser = (studentName) => {
    alert(`Proctor System: Warning letter sent to ${studentName}. Violation flagged.`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 w-48 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalQuizzes: 0,
    totalContests: 0,
    totalViolations: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-outfit font-extrabold text-3xl dark:text-white mb-2">Platform Administration</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium">Moderate proctor audits and track platform registrations</p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-brand-50 dark:bg-slate-700/50 rounded-xl text-brand-600 dark:text-brand-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Users</span>
            <span className="font-outfit font-bold text-xl dark:text-white block mt-0.5">{metrics.totalUsers}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-slate-700/50 rounded-xl text-emerald-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Active Users</span>
            <span className="font-outfit font-bold text-xl dark:text-white block mt-0.5">{metrics.activeUsers}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-slate-700/50 rounded-xl text-indigo-500">
            <FolderCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Quizzes</span>
            <span className="font-outfit font-bold text-xl dark:text-white block mt-0.5">{metrics.totalQuizzes}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-slate-700/50 rounded-xl text-purple-500">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Contests</span>
            <span className="font-outfit font-bold text-xl dark:text-white block mt-0.5">{metrics.totalContests}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="p-2.5 bg-red-50 dark:bg-slate-700/50 rounded-xl text-red-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Violations</span>
            <span className="font-outfit font-bold text-xl dark:text-white block mt-0.5">{metrics.totalViolations}</span>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
        <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Monthly Platform Growth</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.growthData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip />
              <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proctoring Log */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-outfit font-semibold text-lg dark:text-white">Active Proctoring Violations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Violation Type</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Quiz/Contest</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No proctor violations flagged yet. Safe workspace!
                  </td>
                </tr>
              ) : (
                violations.map((violation) => (
                  <tr key={violation._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {violation.userId?.name || 'Unknown Student'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                        {violation.violationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {violation.details || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {violation.contestId?.title || violation.quizId?.title || 'System'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(violation.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleBanUser(violation.userId?.name || 'Student')}
                        className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold text-xs bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded transition-colors"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Warn</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
