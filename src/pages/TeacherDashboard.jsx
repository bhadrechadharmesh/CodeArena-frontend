import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { FileText, Users, Award, Percent, ChevronRight, PlusCircle, RefreshCw, Calendar, Trash2, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function TeacherDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [contests, setContests] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('contests');
  const [selectedItemForAttempts, setSelectedItemForAttempts] = useState(null);
  const [attemptsList, setAttemptsList] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const handleViewAttempts = async (type, id, title) => {
    try {
      setLoadingAttempts(true);
      setSelectedItemForAttempts({ type, id, title });
      const endpoint = type === 'quiz' ? `/api/quizzes/${id}/attempts` : `/api/challenges/${id}/attempts`;
      const res = await axios.get(endpoint);
      setAttemptsList(res.data.attempts || []);
    } catch (err) {
      alert('Failed to fetch attempts: ' + (err.response?.data?.message || err.message));
      setSelectedItemForAttempts(null);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, contestsRes, quizzesRes, challengesRes] = await Promise.all([
        axios.get('/api/analytics/teacher'),
        axios.get('/api/contests'),
        axios.get('/api/quizzes'),
        axios.get('/api/challenges')
      ]);
      setAnalytics(analyticsRes.data);
      setContests(contestsRes.data.contests || []);
      setQuizzes(quizzesRes.data.quizzes || []);
      setChallenges(challengesRes.data.challenges || []);
    } catch (err) {
      console.error('Failed to load teacher dashboard details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteContest = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel the contest "${title}"?`)) return;
    try {
      await axios.delete(`/api/contests/${id}`);
      setContests(contests.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete contest.');
    }
  };

  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the quiz "${title}"?`)) return;
    try {
      await axios.delete(`/api/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz.');
    }
  };

  const handleDeleteChallenge = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the challenge "${title}"?`)) return;
    try {
      await axios.delete(`/api/challenges/${id}`);
      setChallenges(challenges.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete challenge.');
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
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalQuizzesCreated: 0,
    totalAttempts: 0,
    averageClassScore: 0,
    averageClassAccuracy: 0
  };

  const myContests = contests.filter(c => {
    const creatorId = c.creatorId?._id || c.creatorId;
    return creatorId === user?.id || creatorId === user?._id;
  });

  const myQuizzes = quizzes.filter(q => {
    const creatorId = q.creatorId?._id || q.creatorId;
    return creatorId === user?.id || creatorId === user?._id;
  });

  const myChallenges = challenges.filter(c => {
    const creatorId = c.creatorId?._id || c.creatorId;
    return creatorId === user?.id || creatorId === user?._id;
  });

  const getContestStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    return 'live';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl dark:text-white">Teacher Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review student rankings and schedule new contest exams</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/create-challenge"
            className="inline-flex items-center gap-1 nm-btn font-semibold text-sm px-4 py-2 rounded-xl text-slate-800 dark:text-slate-200"
          >
            <PlusCircle className="h-4 w-4 text-indigo-500" />
            <span>Create Challenge</span>
          </Link>
          <Link
            to="/create-quiz"
            className="inline-flex items-center gap-1 nm-btn font-semibold text-sm px-4 py-2 rounded-xl text-slate-800 dark:text-slate-200"
          >
            <PlusCircle className="h-4 w-4 text-emerald-500" />
            <span>Create Quiz</span>
          </Link>
          <Link
            to="/create-contest"
            className="inline-flex items-center gap-1 nm-btn-primary font-semibold text-sm px-4 py-2 rounded-xl"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule Contest</span>
          </Link>
          <button onClick={fetchData} className="p-2 rounded-lg nm-btn text-slate-600 dark:text-slate-300">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="nm-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-brand-600 dark:text-brand-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Created Quizzes</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.totalQuizzesCreated}</span>
          </div>
        </div>

        <div className="nm-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-indigo-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Exam Attempts</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.totalAttempts}</span>
          </div>
        </div>

        <div className="nm-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-emerald-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider block">Class Avg. Score</span>
            <span className="font-outfit font-bold text-2xl dark:text-white mt-1 block">{metrics.averageClassScore} pts</span>
          </div>
        </div>

        <div className="nm-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 nm-inset-sm rounded-xl text-purple-500">
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
        <div className="md:col-span-2 nm-card p-6 rounded-2xl">
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
        <div className="nm-card p-6 rounded-2xl">
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

      {/* Tab Selectors */}
      <div className="flex p-1.5 nm-inset rounded-2xl gap-2 mt-10 mb-8 max-w-fit">
        <button
          onClick={() => setActiveTab('contests')}
          className={`py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
            activeTab === 'contests'
              ? 'nm-card-sm text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Scheduled Contests ({myContests.length})
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
            activeTab === 'quizzes'
              ? 'nm-card-sm text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          My Quizzes ({myQuizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
            activeTab === 'challenges'
              ? 'nm-card-sm text-brand-600 dark:text-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Coding Challenges ({myChallenges.length})
        </button>
      </div>

      {/* Tab Content Panel */}
      {activeTab === 'contests' && (
        <div className="nm-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="font-outfit font-semibold text-lg dark:text-white">Scheduled Contests</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {myContests.length} {myContests.length === 1 ? 'Contest' : 'Contests'} Scheduled
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="nm-inset-sm text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Contest Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Timeline</th>
                  <th className="px-6 py-3">Participants</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {myContests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      No contests scheduled by you yet. Click "Schedule Contest" to create one!
                    </td>
                  </tr>
                ) : (
                  myContests.map((c) => {
                    const status = getContestStatus(c.startTime, c.endTime);
                    return (
                      <tr key={c._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                          {c.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {c.contestType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                          <div>
                            <span className="font-semibold text-slate-750 dark:text-slate-350">Starts:</span>{' '}
                            {new Date(c.startTime).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-750 dark:text-slate-350">Ends:</span>{' '}
                            {new Date(c.endTime).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                          {c.participants?.length || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            status === 'upcoming' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' :
                            status === 'ended' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                            'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteContest(c._id, c.title)}
                            className="inline-flex items-center gap-1.5 nm-btn font-semibold text-xs px-2.5 py-1.5 rounded-lg text-red-650 dark:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="nm-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="font-outfit font-semibold text-lg dark:text-white">My Quizzes</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {myQuizzes.length} {myQuizzes.length === 1 ? 'Quiz' : 'Quizzes'} Created
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="nm-inset-sm text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Quiz Title</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Difficulty</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Questions</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {myQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      No quizzes created by you yet. Click "Create Quiz" to make one!
                    </td>
                  </tr>
                ) : (
                  myQuizzes.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {q.title}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {q.category || 'General'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                          q.difficulty === 'hard' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {q.duration} mins
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-350">
                        {q.questions?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewAttempts('quiz', q._id, q.title)}
                          className="inline-flex items-center gap-1.5 nm-btn font-semibold text-xs px-2.5 py-1.5 rounded-lg text-brand-600 dark:text-brand-400"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Attempts</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(q._id, q.title)}
                          className="inline-flex items-center gap-1.5 nm-btn font-semibold text-xs px-2.5 py-1.5 rounded-lg text-red-650 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="nm-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="font-outfit font-semibold text-lg dark:text-white">Coding Challenges</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {myChallenges.length} {myChallenges.length === 1 ? 'Challenge' : 'Challenges'} Created
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="nm-inset-sm text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3">Challenge Title</th>
                  <th className="px-6 py-3">Difficulty</th>
                  <th className="px-6 py-3">Supported Languages</th>
                  <th className="px-6 py-3">Examples</th>
                  <th className="px-6 py-3">Test Cases</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                {myChallenges.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      No coding challenges created by you yet. Click "Create Challenge" to make one!
                    </td>
                  </tr>
                ) : (
                  myChallenges.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {c.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          c.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                          c.difficulty === 'hard' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {c.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.supportedLanguages?.map((lang) => (
                            <span key={lang} className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-350">
                        {c.examples?.length || 0}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-350">
                        {c.testCases?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewAttempts('challenge', c._id, c.title)}
                          className="inline-flex items-center gap-1.5 nm-btn font-semibold text-xs px-2.5 py-1.5 rounded-lg text-brand-600 dark:text-brand-400"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Attempts</span>
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(c._id, c.title)}
                          className="inline-flex items-center gap-1.5 nm-btn font-semibold text-xs px-2.5 py-1.5 rounded-lg text-red-650 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Attempts Modal */}
      {selectedItemForAttempts && (() => {
        const totalAttemptsCount = attemptsList.length;
        const avgScore = selectedItemForAttempts.type === 'quiz' && totalAttemptsCount > 0
          ? (attemptsList.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalAttemptsCount).toFixed(1)
          : null;
        const highestScore = selectedItemForAttempts.type === 'quiz' && totalAttemptsCount > 0
          ? Math.max(...attemptsList.map(a => a.score || 0))
          : null;
        const successRate = selectedItemForAttempts.type === 'challenge' && totalAttemptsCount > 0
          ? ((attemptsList.filter(a => a.status === 'Accepted').length / totalAttemptsCount) * 100).toFixed(1)
          : null;
        const passedCountTotal = selectedItemForAttempts.type === 'challenge'
          ? attemptsList.filter(a => a.status === 'Accepted').length
          : null;

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="nm-card rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col transition-all transform scale-100 duration-300">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-750 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="font-outfit font-bold text-xl text-slate-900 dark:text-white">
                    Attempts Tracking: {selectedItemForAttempts.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Resource Type: <span className="font-semibold text-brand-600 dark:text-brand-400 uppercase">{selectedItemForAttempts.type === 'quiz' ? 'Quiz Exam' : 'Coding Challenge'}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItemForAttempts(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {loadingAttempts ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <RefreshCw className="h-10 w-10 text-brand-600 animate-spin mb-4" />
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Fetching student submissions...</span>
                  </div>
                ) : attemptsList.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Users className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                    <p className="font-medium text-slate-700 dark:text-slate-350">No Submissions Recorded</p>
                    <p className="text-xs text-slate-550 dark:text-slate-455 mt-1">Students have not attempted this {selectedItemForAttempts.type === 'quiz' ? 'quiz' : 'challenge'} yet.</p>
                  </div>
                ) : (
                  <>
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="nm-inset-sm p-4 rounded-xl">
                        <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Submissions</span>
                        <span className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white mt-1 block">{totalAttemptsCount}</span>
                      </div>
                      {selectedItemForAttempts.type === 'quiz' ? (
                        <>
                          <div className="nm-inset-sm p-4 rounded-xl">
                            <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Average Score</span>
                            <span className="font-outfit font-extrabold text-2xl text-brand-600 dark:text-brand-400 mt-1 block">{avgScore} pts</span>
                          </div>
                          <div className="nm-inset-sm p-4 rounded-xl">
                            <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Highest Score</span>
                            <span className="font-outfit font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">{highestScore} pts</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="nm-inset-sm p-4 rounded-xl">
                            <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Success Rate</span>
                            <span className="font-outfit font-extrabold text-2xl text-brand-600 dark:text-brand-400 mt-1 block">{successRate}%</span>
                          </div>
                          <div className="nm-inset-sm p-4 rounded-xl">
                            <span className="text-slate-450 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Passed Submissions</span>
                            <span className="font-outfit font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">{passedCountTotal}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="overflow-x-auto nm-inset rounded-xl">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="nm-card-sm border-b border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-5 py-3">Student Name</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">College</th>
                            {selectedItemForAttempts.type === 'quiz' ? (
                              <>
                                <th className="px-5 py-3">Score</th>
                                <th className="px-5 py-3">Accuracy</th>
                                <th className="px-5 py-3">Time Taken</th>
                              </>
                            ) : (
                              <>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Passed Cases</th>
                                <th className="px-5 py-3">Points Awarded</th>
                              </>
                            )}
                            <th className="px-5 py-3">Attempted At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                          {attemptsList.map((attempt) => (
                            <tr key={attempt._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/20 text-slate-750 dark:text-slate-350 transition-colors">
                              <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                                {attempt.userId?.name || 'N/A'}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                                {attempt.userId?.email || 'N/A'}
                              </td>
                              <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                                {attempt.userId?.college || 'N/A'}
                              </td>
                              {selectedItemForAttempts.type === 'quiz' ? (
                                <>
                                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                                    {attempt.score} pts
                                  </td>
                                  <td className="px-5 py-3.5 text-brand-600 dark:text-brand-400 font-semibold">
                                    {attempt.accuracy?.toFixed(1)}%
                                  </td>
                                  <td className="px-5 py-3.5 text-slate-550 dark:text-slate-450 font-medium">
                                    {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-5 py-3.5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                      attempt.status === 'Accepted'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-105 dark:border-emerald-900/30'
                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-105 dark:border-rose-900/30'
                                    }`}>
                                      {attempt.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-300">
                                    {attempt.passedCount} / {attempt.totalCount}
                                  </td>
                                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                                    {attempt.pointsAwarded} pts
                                  </td>
                                </>
                              )}
                              <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                                {new Date(attempt.submittedAt || attempt.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-705 flex justify-end bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setSelectedItemForAttempts(null)}
                  className="nm-btn-primary font-semibold text-xs px-5 py-2.5 rounded-xl"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
