import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Zap, Award, Target, Hourglass, ArrowUpRight, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [attempts, setAttempts] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, attemptsRes] = await Promise.all([
        axios.get('/api/analytics/student'),
        axios.get('/api/quizzes/attempts/my')
      ]);
      setAnalytics(analyticsRes.data);
      setAttempts(attemptsRes.data.attempts);
    } catch (err) {
      console.error('Failed to load student dashboard metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadPDF = async (attemptId, quizTitle) => {
    try {
      const response = await axios.get(`/api/quizzes/attempts/${attemptId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scorecard_${quizTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to download scorecard PDF. Please try again.');
    }
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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalQuizzes: 0,
    avgScore: 0,
    accuracy: 0,
    timeSpent: 0,
    points: 0,
    streak: 0,
    contestsParticipated: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl dark:text-white">Welcome, {user?.name}!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your performance and attempt coding challenges</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-brand-50 dark:bg-slate-700/50 rounded-xl text-brand-600 dark:text-brand-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Total Points</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.points}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-slate-700/50 rounded-xl text-orange-500">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Day Streak</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.streak} days</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-slate-700/50 rounded-xl text-emerald-500">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Avg. Accuracy</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.accuracy}%</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-slate-700/50 rounded-xl text-indigo-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Quizzes Done</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.totalQuizzes}</span>
          </div>
        </div>
      </div>

      {/* Visual Graphs */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Line Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Weekly Progress (Scores)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.weeklyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Topic Performance</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics?.topicPerformance || []}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                <Radar name="Student A" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent quiz attempts list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-outfit font-semibold text-lg dark:text-white">Recent Quiz Attempts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Quiz Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Difficulty</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Accuracy</th>
                <th className="px-6 py-3">Attempt Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                    No attempts registered yet. Join a quiz!
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {attempt.quizId?.title || 'Unknown Quiz'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {attempt.quizId?.category || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        attempt.quizId?.difficulty === 'easy' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                        attempt.quizId?.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {attempt.quizId?.difficulty || 'medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {attempt.score} / {attempt.quizId?.totalMarks || 100}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {attempt.accuracy}%
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(attempt.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownloadPDF(attempt._id, attempt.quizId?.title)}
                        className="inline-flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-brand-400 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Scorecard</span>
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
