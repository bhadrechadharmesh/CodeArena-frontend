import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { FileText, Users, Award, Percent, ChevronRight, PlusCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/analytics/teacher');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load teacher dashboard details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    totalQuizzesCreated: 0,
    totalAttempts: 0,
    averageClassScore: 0,
    averageClassAccuracy: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl dark:text-white">Teacher Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review student rankings and schedule new contest exams</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/create-quiz"
            className="inline-flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Quiz</span>
          </Link>
          <button onClick={fetchData} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 dark:bg-slate-700/50 rounded-xl text-brand-600 dark:text-brand-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Created Quizzes</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.totalQuizzesCreated}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-slate-700/50 rounded-xl text-indigo-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Exam Attempts</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.totalAttempts}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-slate-700/50 rounded-xl text-emerald-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Class Avg. Score</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.averageClassScore} pts</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-slate-700/50 rounded-xl text-purple-500">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Class Avg. Acc.</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.averageClassAccuracy}%</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Top Performers */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Top Performing Candidates</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">College</th>
                  <th className="pb-3 text-right">Contest Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {analytics?.topPerformers?.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-slate-400">No candidates registered.</td>
                  </tr>
                ) : (
                  analytics?.topPerformers?.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{student.name}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{student.college || 'N/A'}</td>
                      <td className="py-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{student.totalPoints} pts</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Difficulty Distribution Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Quiz Difficulty Split</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.difficultyDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.difficultyDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
