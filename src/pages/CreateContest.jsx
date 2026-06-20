import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trophy, Code2, BookOpen, AlertCircle, Save, Plus, X, Search, Check } from 'lucide-react';

export default function CreateContest() {
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [contestType, setContestType] = useState('coding'); // quiz, coding, hybrid
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);

  // Dynamic Lists from API
  const [challenges, setChallenges] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  // Search / UI State
  const [challengeSearch, setChallengeSearch] = useState('');
  const [quizSearch, setQuizSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [challengesRes, quizzesRes] = await Promise.all([
          axios.get('/api/challenges'),
          axios.get('/api/quizzes')
        ]);
        setChallenges(challengesRes.data.challenges || []);
        setQuizzes(quizzesRes.data.quizzes || []);
      } catch (err) {
        console.error('Failed to load contest assets:', err.message);
        setErrorMsg('Failed to load existing quizzes or challenges. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleToggleChallenge = (id) => {
    if (selectedChallenges.includes(id)) {
      setSelectedChallenges(selectedChallenges.filter(item => item !== id));
    } else {
      setSelectedChallenges([...selectedChallenges, id]);
    }
  };

  const handleToggleQuiz = (id) => {
    if (selectedQuizzes.includes(id)) {
      setSelectedQuizzes(selectedQuizzes.filter(item => item !== id));
    } else {
      setSelectedQuizzes([...selectedQuizzes, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!title.trim()) {
      setErrorMsg('Please specify a contest title.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg('Both start time and end time are required.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      setErrorMsg('End time must be strictly after the start time.');
      return;
    }

    if (contestType === 'coding' && selectedChallenges.length === 0) {
      setErrorMsg('Please select at least one coding challenge.');
      return;
    }
    if (contestType === 'quiz' && selectedQuizzes.length === 0) {
      setErrorMsg('Please select at least one quiz.');
      return;
    }
    if (contestType === 'hybrid' && selectedChallenges.length === 0 && selectedQuizzes.length === 0) {
      setErrorMsg('Please select at least one coding challenge or quiz for hybrid contests.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/contests', {
        title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        contestType,
        codingChallenges: contestType !== 'quiz' ? selectedChallenges : [],
        quizzes: contestType !== 'coding' ? selectedQuizzes : []
      });

      // Redirect back to teacher dashboard
      navigate('/teacher-dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to schedule contest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Lists for rendering search
  const filteredChallenges = challenges.filter(c =>
    c.title.toLowerCase().includes(challengeSearch.toLowerCase()) ||
    c.difficulty.toLowerCase().includes(challengeSearch.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(quizSearch.toLowerCase()) ||
    q.category.toLowerCase().includes(quizSearch.toLowerCase())
  );

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse text-center">
        <Trophy className="h-10 w-10 text-slate-300 mx-auto animate-spin mb-3" />
        <span className="text-slate-400">Loading scheduled options and resources...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit font-extrabold text-3xl dark:text-white">Schedule New Contest</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create real-time tournaments with synchronized leaderboards, quizzes, and code evaluation.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-650 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-2 text-sm font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Configuration */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="font-outfit font-bold text-lg dark:text-white border-b border-slate-100 dark:border-slate-750 pb-2">
            General Specifications
          </h3>
          
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Contest Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
              placeholder="e.g. Summer Coding Championship 2026"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Contest Type
              </label>
              <select
                value={contestType}
                onChange={(e) => {
                  setContestType(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
              >
                <option value="coding">Coding Challenges Only</option>
                <option value="quiz">Quizzes Only</option>
                <option value="hybrid">Hybrid (Coding + Quiz)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand-500 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Coding Challenges Selection */}
        {contestType !== 'quiz' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-750 pb-2">
              <h3 className="font-outfit font-bold text-lg dark:text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-500" />
                Select Coding Challenges ({selectedChallenges.length} selected)
              </h3>
              <div className="relative mt-2 sm:mt-0 w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={challengeSearch}
                  onChange={(e) => setChallengeSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-550 dark:text-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {filteredChallenges.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                  No challenges found matching search terms.
                </div>
              ) : (
                filteredChallenges.map((chal) => {
                  const isChecked = selectedChallenges.includes(chal._id);
                  return (
                    <div
                      key={chal._id}
                      onClick={() => handleToggleChallenge(chal._id)}
                      className={`cursor-pointer border p-3.5 rounded-xl flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                          : 'border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-750/30'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-indigo-600 border-indigo-650 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{chal.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                            chal.difficulty === 'easy' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                            chal.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                            'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                          }`}>
                            {chal.difficulty}
                          </span>
                          <span className="text-[10px] text-slate-450 truncate">
                            {chal.supportedLanguages.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Quizzes Selection */}
        {contestType !== 'coding' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-750 pb-2">
              <h3 className="font-outfit font-bold text-lg dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                Select Quizzes ({selectedQuizzes.length} selected)
              </h3>
              <div className="relative mt-2 sm:mt-0 w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-emerald-550 dark:text-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {filteredQuizzes.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                  No quizzes found matching search terms.
                </div>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const isChecked = selectedQuizzes.includes(quiz._id);
                  return (
                    <div
                      key={quiz._id}
                      onClick={() => handleToggleQuiz(quiz._id)}
                      className={`cursor-pointer border p-3.5 rounded-xl flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'border-emerald-550 bg-emerald-50/20 dark:bg-emerald-950/15'
                          : 'border-slate-100 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-750/30'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-emerald-600 border-emerald-650 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{quiz.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {quiz.category}
                          </span>
                          <span className="text-[10px] text-slate-450">
                            • {quiz.questions?.length || 0} Questions
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/teacher-dashboard')}
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Scheduling...' : 'Schedule Contest'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
