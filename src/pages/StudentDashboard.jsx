import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Zap, Award, Target, Hourglass, ArrowUpRight, FileSpreadsheet, Download, RefreshCw, BookOpen, Code2, Calendar } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.16em] text-[var(--muted)] mb-3">Student overview</p>
          <h1 className="font-outfit font-semibold text-4xl tracking-[-.04em] dark:text-white">Good to see you, {user?.name}.</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your recent work, progress, and next steps.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-1 nm-btn-primary font-semibold text-xs px-3.5 py-2.5 rounded-xl"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Browse Quizzes</span>
          </Link>
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1 nm-btn font-semibold text-xs px-3.5 py-2.5 rounded-xl text-slate-750 dark:text-slate-200"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Practice Coding</span>
          </Link>
          <Link
            to="/contests"
            className="inline-flex items-center gap-1 nm-btn font-semibold text-xs px-3.5 py-2.5 rounded-xl text-slate-750 dark:text-slate-200"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Join Contests</span>
          </Link>
          <button onClick={fetchData} className="p-2.5 rounded-xl nm-btn text-slate-650 dark:text-slate-300">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--line)] border border-[var(--line)] mb-8">
        <div className="bg-[var(--surface)] p-6 flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-brand-600 dark:text-brand-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Total Points</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.points}</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-6 flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-orange-500">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Day Streak</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.streak} days</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-6 flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-emerald-500">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Avg. Accuracy</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.accuracy}%</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-6 flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-indigo-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Quizzes Done</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.totalQuizzes}</span>
          </div>
        </div>
      </div>

      {/* Visual Graphs */}
      <div className="grid md:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)] mb-8">
        {/* Line Chart */}
        <div className="bg-[var(--surface)] p-6">
          <div className="flex items-start justify-between mb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">Last 7 days</p><h3 className="font-outfit font-semibold text-lg dark:text-white mt-1">Score trend</h3></div><span className="w-2 h-2 bg-[var(--accent)] mt-1" /></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.weeklyProgress || []}>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 5" />
                <XAxis dataKey="name" stroke="#7c867e" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#7c867e" fontSize={10} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 0, fontSize: 11 }} cursor={{ stroke: 'var(--line)' }} />
                <Line type="monotone" dataKey="score" stroke="var(--ink)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--ink)', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--ink)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-[var(--surface)] p-6">
          <div className="flex items-start justify-between mb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-[var(--muted)]">By subject</p><h3 className="font-outfit font-semibold text-lg dark:text-white mt-1">Topic performance</h3></div><span className="text-[10px] font-mono text-[var(--muted)]">0–100</span></div>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics?.topicPerformance || []}>
                <PolarGrid stroke="var(--line)" />
                <PolarAngleAxis dataKey="subject" stroke="#7c867e" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} stroke="#7c867e" />
                <Radar name="Your score" dataKey="A" stroke="var(--ink)" fill="var(--accent)" fillOpacity={0.65} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent quiz attempts list */}
      <div className="nm-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-outfit font-semibold text-lg dark:text-white">Recent Quiz Attempts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="nm-inset-sm text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
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
                        onClick={() => handleDownloadPDF(attempt._id || attempt.id, attempt.quizId?.title)}
                        className="inline-flex items-center gap-1.5 nm-btn font-semibold text-xs px-3 py-1.5 rounded-lg text-brand-600 dark:text-brand-400"
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
