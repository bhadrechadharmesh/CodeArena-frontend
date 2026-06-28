import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import MonacoEditor from '../components/MonacoEditor.jsx';
import WebcamMonitor from '../components/WebcamMonitor.jsx';
import { initiateSocketConnection, disconnectSocket, subscribeToContestLeaderboard, unsubscribeFromContestLeaderboard } from '../services/socketService.js';
import { Calendar, Users, Trophy, Play, Clock, Terminal, ChevronRight, BookOpen, CheckSquare, Save, ArrowLeft, ArrowRight, Download } from 'lucide-react';

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
  const [violationCount, setViolationCount] = useState(0);

  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizReviewed, setQuizReviewed] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizSubmittedResult, setQuizSubmittedResult] = useState(null);
  const [quizIsSubmitting, setQuizIsSubmitting] = useState(false);

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
    setActiveQuiz(null);
    setLanguage('javascript');
    setCode(`// Write your JavaScript code here\nimport fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);`);
    setTestResults(null);
  };

  const handleSelectQuiz = async (quiz) => {
    setActiveChallenge(null);
    setActiveQuiz(null);
    setQuizLoading(true);
    setQuizSubmittedResult(null);
    try {
      const res = await axios.get(`/api/quizzes/${quiz._id}`);
      const fetchedQuiz = res.data.quiz;
      setActiveQuiz(fetchedQuiz);
      setQuizCurrentIdx(0);
      
      const initialAnswers = fetchedQuiz.questions.map((q) => ({
        questionId: q._id,
        selectedOption: null,
        selectedOptions: [],
        booleanAnswer: null,
        textAnswer: ''
      }));
      setQuizAnswers(initialAnswers);
      setQuizReviewed([]);
      setQuizStartTime(Date.now());
    } catch (err) {
      alert('Failed to load quiz questions.');
    } finally {
      setQuizLoading(false);
    }
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

  const handleSubmitContestQuiz = async () => {
    if (quizIsSubmitting || !activeQuiz || !activeContest) return;
    setQuizIsSubmitting(true);

    try {
      const elapsedSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
      const res = await axios.post(`/api/contests/${activeContest._id}/submit-quiz/${activeQuiz._id}`, {
        answers: quizAnswers,
        timeTaken: elapsedSeconds
      });
      setQuizSubmittedResult(res.data.attempt);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setQuizIsSubmitting(false);
    }
  };

  const handleQuizOptionChange = (qIdx, optIdx) => {
    setQuizAnswers((prev) =>
      prev.map((ans, idx) => (idx === qIdx ? { ...ans, selectedOption: optIdx } : ans))
    );
  };

  const handleQuizCheckboxChange = (qIdx, optIdx) => {
    setQuizAnswers((prev) =>
      prev.map((ans, idx) => {
        if (idx !== qIdx) return ans;
        const selected = ans.selectedOptions || [];
        const newSelected = selected.includes(optIdx)
          ? selected.filter((item) => item !== optIdx)
          : [...selected, optIdx];
        return { ...ans, selectedOptions: newSelected };
      })
    );
  };

  const handleQuizBooleanChange = (qIdx, val) => {
    setQuizAnswers((prev) =>
      prev.map((ans, idx) => (idx === qIdx ? { ...ans, booleanAnswer: val } : ans))
    );
  };

  const handleQuizTextChange = (qIdx, val) => {
    setQuizAnswers((prev) =>
      prev.map((ans, idx) => (idx === qIdx ? { ...ans, textAnswer: val } : ans))
    );
  };

  const toggleQuizReview = (qIdx) => {
    setQuizReviewed((prev) =>
      prev.includes(qIdx) ? prev.filter((item) => item !== qIdx) : [...prev, qIdx]
    );
  };

  const handleLeaveContestWorkspace = () => {
    if (activeContest) {
      unsubscribeFromContestLeaderboard(activeContest._id, user.id);
    }
    setActiveContest(null);
    setActiveChallenge(null);
    setActiveQuiz(null);
    setLeaderboard([]);
    clearInterval(timerRef.current);
  };

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

  // Auto-submit and exit on 3 violations
  useEffect(() => {
    if (activeContest && violationCount >= 3) {
      alert('CONTEST TERMINATED: You have exceeded the maximum of 3 proctoring violations. Your current progress is being submitted and you are leaving the contest arena.');
      
      const submitAndLeave = async () => {
        if (activeChallenge) {
          await handleSubmitContestChallenge();
        }
        handleLeaveContestWorkspace();
      };
      
      submitAndLeave();
    }
  }, [violationCount, activeContest]);

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
        {/* Proctoring Camera Feed */}
        <WebcamMonitor 
          contestId={activeContest._id} 
          onViolationLog={() => setViolationCount((prev) => prev + 1)} 
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <button
              onClick={handleLeaveContestWorkspace}
              className="text-brand-600 hover:text-brand-700 font-semibold text-xs mb-1 nm-btn px-3 py-1 rounded-lg"
            >
              &larr; Exit Contest Arena
            </button>
            <h2 className="font-outfit font-extrabold text-2xl dark:text-white leading-none mt-1">{activeContest.title}</h2>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold nm-inset-sm text-indigo-655 dark:text-indigo-400">
            <Clock className="h-4 w-4" />
            <span>Time Left: {min}m {sec.toString().padStart(2, '0')}s</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: List Challenges, Quizzes, and Leaderboard */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contest Challenges list */}
            {activeContest.codingChallenges && activeContest.codingChallenges.length > 0 && (
              <div className="nm-card p-6 rounded-2xl">
                <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Contest Challenges</h3>
                <div className="space-y-2">
                  {activeContest.codingChallenges.map((chal) => (
                    <button
                      key={chal._id}
                      onClick={() => handleSelectChallenge(chal)}
                      className={`w-full text-left p-4 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                        activeChallenge?._id === chal._id ? 'nm-inset text-brand-750 dark:text-white border border-brand-500/30' : 'nm-btn text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{chal.title}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contest Quizzes list */}
            {activeContest.quizzes && activeContest.quizzes.length > 0 && (
              <div className="nm-card p-6 rounded-2xl">
                <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4">Contest Quizzes</h3>
                <div className="space-y-2">
                  {activeContest.quizzes.map((quiz) => {
                    const isCompleted = leaderboard.find(
                      (e) => e.userId?._id === user.id || e.userId === user.id
                    )?.completedQuizzes?.includes(quiz._id);

                    return (
                      <button
                        key={quiz._id}
                        onClick={() => handleSelectQuiz(quiz)}
                        className={`w-full text-left p-4 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                          activeQuiz?._id === quiz._id ? 'nm-inset text-brand-750 dark:text-white border border-brand-500/30' : 'nm-btn text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{quiz.title}</span>
                          <span className="text-[10px] text-slate-400 mt-1 font-normal uppercase tracking-wider">{quiz.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <span className="text-[9px] uppercase font-bold text-emerald-650 dark:text-emerald-400 nm-inset-sm px-2 py-0.5 rounded">
                              Completed
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Socket Live Leaderboard */}
            <div className="nm-card p-6 rounded-2xl">
              <h3 className="font-outfit font-semibold text-lg dark:text-white mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Live Standings
              </h3>
              <div className="overflow-y-auto max-h-64 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="nm-inset-sm text-slate-400 font-bold uppercase tracking-wider">
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

          {/* Right panel: Editor Workspace or Quiz Attempt */}
          <div className="lg:col-span-7">
            {quizLoading ? (
              <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
                <Clock className="h-10 w-10 text-brand-600 mx-auto animate-spin mb-2" />
                <span className="text-slate-400">Loading quiz questions...</span>
              </div>
            ) : activeQuiz ? (
              quizSubmittedResult ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="h-8 w-8" />
                  </div>
                  <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white">Quiz Submitted!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your score has been registered to the live standings.</p>

                  <div className="grid grid-cols-2 gap-4 my-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="text-center">
                      <span className="text-slate-500 dark:text-slate-400 text-xs block">Score</span>
                      <span className="font-outfit font-bold text-2xl text-slate-900 dark:text-white mt-1 block">{quizSubmittedResult.score} pts</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 dark:text-slate-400 text-xs block">Accuracy</span>
                      <span className="font-outfit font-bold text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">{quizSubmittedResult.accuracy}%</span>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleDownloadPDF(quizSubmittedResult._id || quizSubmittedResult.id, activeQuiz.title)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm transition-colors text-sm flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Scorecard</span>
                    </button>
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm transition-colors text-sm"
                    >
                      Back to Workspace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="nm-card p-6 rounded-2xl flex flex-col justify-between min-h-[450px]">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-400">
                      <span className="uppercase">Question {quizCurrentIdx + 1} of {activeQuiz.questions.length}</span>
                      <span className="nm-inset-sm px-2.5 py-0.5 rounded uppercase">{activeQuiz.questions[quizCurrentIdx]?.difficulty}</span>
                    </div>

                    <h3 className="font-outfit font-semibold text-lg text-slate-900 dark:text-white leading-relaxed mb-6">
                      {activeQuiz.questions[quizCurrentIdx]?.questionText}
                    </h3>

                    {/* Options */}
                    <div className="space-y-3">
                      {/* MCQ */}
                      {activeQuiz.questions[quizCurrentIdx]?.questionType === 'mcq' && activeQuiz.questions[quizCurrentIdx]?.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleQuizOptionChange(quizCurrentIdx, i)}
                          className={`w-full text-left p-4 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                            quizAnswers[quizCurrentIdx]?.selectedOption === i ? 'nm-inset text-brand-700 dark:text-white border border-brand-500/30' : 'nm-btn text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${quizAnswers[quizCurrentIdx]?.selectedOption === i ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'}`}>
                            {quizAnswers[quizCurrentIdx]?.selectedOption === i && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                          </span>
                        </button>
                      ))}

                      {/* Multiple Correct */}
                      {activeQuiz.questions[quizCurrentIdx]?.questionType === 'multiple_correct' && activeQuiz.questions[quizCurrentIdx]?.options.map((opt, i) => {
                        const isSelected = quizAnswers[quizCurrentIdx]?.selectedOptions?.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => handleQuizCheckboxChange(quizCurrentIdx, i)}
                            className={`w-full text-left p-4 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                              isSelected ? 'nm-inset text-brand-700 dark:text-white border border-brand-500/30' : 'nm-btn text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span>{opt}</span>
                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'}`}>
                              {isSelected && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                            </span>
                          </button>
                        );
                      })}

                      {/* True/False */}
                      {activeQuiz.questions[quizCurrentIdx]?.questionType === 'true_false' && (
                        <div className="flex gap-4">
                          {[true, false].map((val) => (
                            <button
                              key={val.toString()}
                              onClick={() => handleQuizBooleanChange(quizCurrentIdx, val)}
                              className={`flex-grow py-4 rounded-xl text-sm font-bold transition-all text-center ${
                                quizAnswers[quizCurrentIdx]?.booleanAnswer === val ? 'nm-inset text-brand-700 dark:text-white border border-brand-500/30' : 'nm-btn text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {val ? 'TRUE' : 'FALSE'}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Fill in the blank */}
                      {activeQuiz.questions[quizCurrentIdx]?.questionType === 'fill_blank' && (
                        <div>
                          <input
                            type="text"
                            value={quizAnswers[quizCurrentIdx]?.textAnswer || ''}
                            onChange={(e) => handleQuizTextChange(quizCurrentIdx, e.target.value)}
                            className="w-full nm-input rounded-xl py-4 px-4 text-sm focus:outline-none dark:text-white"
                            placeholder="Type your answer here..."
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Grid & Footer */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                    {/* Small grid navigation */}
                    <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
                      {activeQuiz.questions.map((_, index) => {
                        const isSelected = index === quizCurrentIdx;
                        const hasAns = quizAnswers[index] && (
                          quizAnswers[index].selectedOption !== null ||
                          quizAnswers[index].selectedOptions.length > 0 ||
                          quizAnswers[index].booleanAnswer !== null ||
                          quizAnswers[index].textAnswer.trim() !== ''
                        );
                        const isReview = quizReviewed.includes(index);

                        return (
                          <button
                            key={index}
                            onClick={() => setQuizCurrentIdx(index)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                              isSelected ? 'nm-inset text-brand-600 dark:text-brand-400 border border-brand-500/40 ring-1 ring-brand-500/20' :
                              isReview ? 'bg-amber-500 text-white border-amber-500 shadow-inner' :
                              hasAns ? 'bg-emerald-500 text-white border-emerald-500 shadow-inner' :
                              'nm-btn text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="flex gap-2">
                        <button
                          disabled={quizCurrentIdx === 0}
                          onClick={() => setQuizCurrentIdx((prev) => prev - 1)}
                          className="inline-flex items-center justify-center gap-1.5 nm-btn disabled:opacity-50 text-slate-700 dark:text-slate-250 font-semibold text-xs px-4 py-2.5 rounded-lg"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Prev</span>
                        </button>
                        <button
                          disabled={quizCurrentIdx === activeQuiz.questions.length - 1}
                          onClick={() => setQuizCurrentIdx((prev) => prev + 1)}
                          className="inline-flex items-center justify-center gap-1.5 nm-btn disabled:opacity-50 text-slate-700 dark:text-slate-250 font-semibold text-xs px-4 py-2.5 rounded-lg"
                        >
                          <span>Next</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleQuizReview(quizCurrentIdx)}
                        className={`font-semibold text-xs px-4 py-2.5 rounded-lg transition-all ${
                          quizReviewed.includes(quizCurrentIdx) ? 'nm-inset text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'nm-btn text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {quizReviewed.includes(quizCurrentIdx) ? 'Marked for Review' : 'Mark for Review'}
                      </button>

                      <button
                        onClick={handleSubmitContestQuiz}
                        disabled={quizIsSubmitting}
                        className="nm-btn-primary font-semibold text-xs px-6 py-2.5 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Submit Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : activeChallenge ? (
              <div className="flex flex-col gap-6">
                {/* Challenge description */}
                <div className="nm-card p-6 rounded-2xl text-sm">
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
                <div className="bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 shadow-inner">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                    <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5" />
                      Contest Console
                    </span>
                    <button
                      onClick={handleSubmitContestChallenge}
                      disabled={isSubmitting}
                      className="nm-btn bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-750 text-white font-semibold text-xs px-4 py-2 rounded-lg"
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
              <div className="nm-card p-12 rounded-2xl text-center">
                <Trophy className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold dark:text-white">Workspace Ready</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a challenge or quiz from the left menu to start.</p>
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
        <div className="text-center py-12 nm-card rounded-2xl">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Contests Scheduled</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Check back later for upcoming challenges.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {contests.map((cont) => {
            const isLive = new Date() >= new Date(cont.startTime) && new Date() <= new Date(cont.endTime);
            return (
              <div key={cont._id} className="nm-card p-6 rounded-2xl flex flex-col justify-between">
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

                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{cont.participants?.length || 0} registered</span>
                  </div>

                  <button
                    onClick={() => handleJoinContest(cont._id)}
                    className="nm-btn-primary font-semibold text-xs px-4 py-2 rounded-lg"
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
