import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import MonacoEditor from '../components/MonacoEditor.jsx';
import { initiateSocketConnection, disconnectSocket, subscribeToContestLeaderboard, unsubscribeFromContestLeaderboard } from '../services/socketService.js';
import { Calendar, Users, Trophy, Play, Clock, Terminal, ChevronRight } from 'lucide-react';

export default function Contests() {
  const { user } = useSelector((state) => state.auth);
  const [contests, setContests] = useState([]);
  const [activeContest, setActiveContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Contest workspace challenges and editor states
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/contests');
      setContests(res.data.contests);
    } catch (err) {
      console.error('Failed to load contests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
    return () => {
      disconnectSocket();
      clearInterval(timerRef.current);
    };
  }, []);

  const handleJoinContest = async (contestId) => {
    try {
      setLoading(true);
      await axios.post(`/api/contests/${contestId}/join`);
      
      // Load details
      const res = await axios.get(`/api/contests/${contestId}`);
      const contestObj = res.data.contest;
      setActiveContest(contestObj);

      // Establish Sockets
      initiateSocketConnection();
      subscribeToContestLeaderboard(contestId, user.id, (updatedLeaderboard) => {
        setBoardState(updatedLeaderboard);
      });

      // Synchronize timer
      const remainingSecs = Math.floor((new Date(contestObj.endTime) - new Date()) / 1000);
      setTimeLeft(remainingSecs > 0 ? remainingSecs : 0);

      // Start countdown
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

    } catch (err) {
      alert('Failed to join contest.');
    } finally {
      setLoading(false);
    }
  };

  const setBoardState = (board) => {
    setLeaderboard(board);
  };

  const handleSelectChallenge = (chal) => {
    setActiveChallenge(chal);
    setLanguage('javascript');
    setCode(`// Write your JavaScript code here\nimport fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);`);
    setTestResults(null);
  };

  const handleSubmitContestChallenge = async () => {
    if (!activeChallenge || !activeContest || isSubmitting) return;
    setIsSubmitting(true);
    setTestResults(null);

    try {
      const res = await axios.post(`/api/contests/${activeContest._id}/submit-challenge/${activeChallenge._id}`, {
        code,
        language
      });
      setTestResults(res.data);
    } catch (err) {
      alert('Failed to evaluate solution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveContestWorkspace = () => {
    if (activeContest) {
      unsubscribeFromContestLeaderboard(activeContest._id, user.id);
    }
    setActiveContest(null);
    setActiveChallenge(null);
    setLeaderboard([]);
    clearInterval(timerRef.current);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">
        <Clock className="h-10 w-10 text-slate-300 mx-auto animate-spin mb-2" />
        <span className="text-slate-400">Loading contest environment...</span>
      </div>
    );
  }

  // Active Contest Arena Split Workspace
  if (activeContest) {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <button
              onClick={handleLeaveContestWorkspace}
              className="text-brand-600 hover:text-brand-700 font-semibold text-xs mb-1"
            >
              &larr; Exit Contest Arena
            </button>
            <h2 className="font-outfit font-extrabold text-2xl dark:text-white leading-none mt-1">{activeContest.title}</h2>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-50 border border-indigo-200 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700">
            <Clock className="h-4 w-4" />
            <span>Time Left: {min}m {sec.toString().padStart(2, '0')}s</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: List Challenges and Leaderboard */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contest Challenges list */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Contest Challenges</h3>
              <div className="space-y-2">
                {activeContest.codingChallenges?.map((chal) => (
                  <button
                    key={chal._id}
                    onClick={() => handleSelectChallenge(chal)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                      activeChallenge?._id === chal._id ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-slate-750 dark:border-brand-500 dark:text-white' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700 dark:text-slate-200 hover:bg-slate-100/50'
                    }`}
                  >
                    <span>{chal.title}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Socket Live Leaderboard */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Live Standings
              </h3>
              <div className="overflow-y-auto max-h-64 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2">Rank</th>
                      <th className="pb-2">Contestant</th>
                      <th className="pb-2 text-right">Score</th>
                      <th className="pb-2 text-right">Penalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium">
                    {leaderboard.map((entry, idx) => (
                      <tr key={entry.userId?._id || idx} className={entry.userId?._id === user.id ? 'bg-brand-50/50 dark:bg-slate-700/30' : ''}>
                        <td className="py-2.5 font-bold">#{idx + 1}</td>
                        <td className="py-2.5">{entry.userId?.name || 'Unknown Student'}</td>
                        <td className="py-2.5 text-right text-indigo-600 dark:text-indigo-400 font-bold">{entry.score}</td>
                        <td className="py-2.5 text-right text-slate-500">{entry.penaltyTime}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right panel: Editor Workspace */}
          <div className="lg:col-span-7">
            {activeChallenge ? (
              <div className="flex flex-col gap-6">
                {/* Challenge description */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-sm">
                  <h3 className="font-outfit font-bold text-xl dark:text-white mb-2">{activeChallenge.title}</h3>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeChallenge.description}
                  </div>
                </div>

                <MonacoEditor
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  supportedLanguages={activeChallenge.supportedLanguages}
                />

                {/* Submit Panel Console */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-200">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5" />
                      Contest Console
                    </span>
                    <button
                      onClick={handleSubmitContestChallenge}
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded shadow transition-all"
                    >
                      {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
                    </button>
                  </div>

                  <div className="font-mono text-xs h-[120px] overflow-y-auto space-y-2 bg-slate-950 p-3 rounded">
                    {!testResults && !isSubmitting && <span className="text-slate-500">Submit answer to compile code.</span>}
                    {isSubmitting && <span className="text-brand-400 animate-pulse">Grading submission...</span>}
                    {testResults && (
                      <div>
                        <div>
                          Status: <strong className={testResults.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}>{testResults.status}</strong>
                        </div>
                        <div>Passed Cases: {testResults.passedCount} / {testResults.totalCount}</div>
                        {testResults.error && <div className="text-red-400 mt-2 whitespace-pre-wrap">{testResults.error}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                <Trophy className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold dark:text-white">Workspace Ready</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a challenge from the left menu to start coding.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Contests List
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-outfit font-extrabold text-3xl dark:text-white mb-2">Contest Schedules</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Participate in tournaments and compete on real-time standings</p>

      {contests.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Contests Scheduled</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check back later for upcoming challenges.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {contests.map((cont) => {
            const isLive = new Date() >= new Date(cont.startTime) && new Date() <= new Date(cont.endTime);
            return (
              <div key={cont._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isLive ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-pulse' : 'bg-slate-50 text-slate-500 dark:bg-slate-900/30'
                    }`}>
                      {isLive ? 'Live Now' : 'Upcoming'}
                    </span>
                    <Trophy className="h-4 w-4 text-brand-600" />
                  </div>
                  <h3 className="font-outfit font-bold text-xl text-slate-900 dark:text-white mt-1 leading-snug">{cont.title}</h3>
                  
                  <div className="flex flex-col gap-1.5 mt-4 text-xs text-slate-500 dark:text-slate-400">
                    <div><strong>Starts:</strong> {new Date(cont.startTime).toLocaleString()}</div>
                    <div><strong>Ends:</strong> {new Date(cont.endTime).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{cont.participants?.length || 0} registered</span>
                  </div>

                  <button
                    onClick={() => handleJoinContest(cont._id)}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Enter Arena
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
