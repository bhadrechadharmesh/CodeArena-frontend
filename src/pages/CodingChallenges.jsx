import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MonacoEditor from '../components/MonacoEditor.jsx';
import WebcamMonitor from '../components/WebcamMonitor.jsx';
import { Code2, Play, Terminal, HelpCircle, AlertCircle, Award, CheckCircle } from 'lucide-react';

export default function CodingChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Editor States
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const [challengesRes, attemptsRes] = await Promise.all([
          axios.get('/api/challenges'),
          axios.get('/api/challenges/attempts/my').catch(() => ({ data: { attempts: [] } }))
        ]);
        setChallenges(challengesRes.data.challenges || []);
        setAttempts(attemptsRes.data.attempts || []);
      } catch (err) {
        console.error('Failed to load challenges:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleSelectChallenge = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/challenges/${id}`);
      const challenge = res.data.challenge;
      setActiveChallenge(challenge);
      
      // Default to JS template on selection
      setLanguage('javascript');
      setCode(`// Write your JavaScript code here\nimport fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);`);
      setTestResults(null);
    } catch (err) {
      alert('Failed to load challenge details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!activeChallenge || isSubmitting) return;
    setIsSubmitting(true);
    setTestResults(null);

    try {
      const res = await axios.post(`/api/challenges/${activeChallenge._id}/submit`, {
        code,
        language
      });
      setTestResults(res.data);
    } catch (err) {
      alert('Failed to evaluate submission. Please check compiler formats.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit on 3 violations
  useEffect(() => {
    if (activeChallenge && violationCount >= 3) {
      alert('CHALLENGE TERMINATED: You have exceeded the maximum of 3 proctoring violations. Your code is being submitted automatically.');
      handleSubmitCode().then(() => {
        setActiveChallenge(null);
      });
    }
  }, [violationCount, activeChallenge]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse text-center">
        <Code2 className="h-10 w-10 text-slate-300 mx-auto animate-spin mb-2" />
        <span className="text-slate-400">Loading coding environment...</span>
      </div>
    );
  }

  // Workspace Split View
  if (activeChallenge) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Proctoring Camera Feed */}
        <WebcamMonitor 
          challengeId={activeChallenge._id} 
          onViolationLog={() => setViolationCount((prev) => prev + 1)} 
        />

        {/* Back navigation */}
        <button
          onClick={() => setActiveChallenge(null)}
          className="text-brand-600 hover:text-brand-700 font-semibold text-sm mb-4 inline-flex items-center gap-1"
        >
          &larr; Back to Challenges
        </button>

        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          {/* Left panel: Description */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-3 ${
                activeChallenge.difficulty === 'easy' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                activeChallenge.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {activeChallenge.difficulty}
              </span>
              <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white mb-4">{activeChallenge.title}</h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-line">
                {activeChallenge.description}
              </div>

              {activeChallenge.constraints && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
                  <pre className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 text-xs font-mono dark:text-slate-300">
                    {activeChallenge.constraints}
                  </pre>
                </div>
              )}

              {/* Examples */}
              {activeChallenge.examples && activeChallenge.examples.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Examples</h4>
                  {activeChallenge.examples.map((ex, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-xs font-mono mb-2">
                      <div className="mb-1"><strong className="text-brand-500">Input:</strong> {ex.input}</div>
                      <div className="mb-1"><strong className="text-emerald-500">Output:</strong> {ex.output}</div>
                      {ex.explanation && <div><strong className="text-slate-400">Explanation:</strong> {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
              Created by CodeArena Instructors
            </div>
          </div>

          {/* Right panel: Editor & Console */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <MonacoEditor
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              supportedLanguages={activeChallenge.supportedLanguages}
            />

            {/* Run Console Controls */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-200">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" />
                  Terminal Console
                </span>
                <button
                  onClick={handleSubmitCode}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded shadow transition-all flex items-center gap-1"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Run Code'}</span>
                </button>
              </div>

              {/* Console Output */}
              <div className="font-mono text-xs h-[180px] overflow-y-auto space-y-2 bg-slate-950 p-3 rounded">
                {!testResults && !isSubmitting && (
                  <span className="text-slate-500">Console output will print here on execution.</span>
                )}
                {isSubmitting && (
                  <span className="text-brand-400 animate-pulse">Running test cases against compilation server...</span>
                )}
                {testResults && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold">
                        Status:{' '}
                        <strong className={testResults.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}>
                          {testResults.status}
                        </strong>
                      </span>
                      <span>Passed Cases: {testResults.passedCount} / {testResults.totalCount}</span>
                    </div>

                    {testResults.error && (
                      <div className="bg-red-950/50 border border-red-900 text-red-300 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {testResults.error}
                      </div>
                    )}

                    {/* Individual test cases summary */}
                    <div className="space-y-1">
                      {testResults.results?.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-900/60 rounded text-[11px]">
                          <span className="text-slate-400">Test Case #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            {res.isCorrect ? (
                              <span className="text-emerald-400 font-bold">Passed</span>
                            ) : (
                              <span className="text-red-400 font-bold">{res.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Challenges List
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-outfit font-extrabold text-3xl dark:text-white mb-2">Coding Challenges</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Improve your algorithm skills by writing code and executing test scripts</p>

      {challenges.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Code2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Coding Challenges</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please wait for instructors to seed problems.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((chal) => {
            const challengeAttempt = attempts.find(a => (a.challengeId?._id || a.challengeId) === chal._id);
            const hasAttempted = !!challengeAttempt;

            return (
              <div
                key={chal._id}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      chal.difficulty === 'easy' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                      chal.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                      'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                    }`}>
                      {chal.difficulty}
                    </span>
                    <Award className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="font-outfit font-bold text-xl text-slate-900 dark:text-white mt-1 leading-snug">{chal.title}</h3>
                  <div className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {/* strip markdown markers from description for cards display */}
                    {chal.description.replace(/[#*`]/g, '')}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Languages: {chal.supportedLanguages.join(', ')}
                  </span>
                  {hasAttempted ? (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg border ${
                      challengeAttempt.status === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-250 dark:border-emerald-800'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-250 dark:border-red-800'
                    }`}>
                      {challengeAttempt.status === 'Accepted' ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-red-650 dark:text-red-400" />
                      )}
                      <span>{challengeAttempt.status}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectChallenge(chal._id)}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Solve Problem
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
