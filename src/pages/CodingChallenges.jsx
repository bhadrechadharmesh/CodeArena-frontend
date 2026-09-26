import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SectionLayout, SearchField, FilterButtons, EmptyState, LoadError } from '../components/SectionLayout.jsx';
import MonacoEditor, { LANGUAGE_TEMPLATES } from '../components/MonacoEditor.jsx';
import WebcamMonitor from '../components/WebcamMonitor.jsx';
import CameraStartConfirmation from '../components/CameraStartConfirmation.jsx';
import { Code2, Play, Terminal, HelpCircle, AlertCircle, Award, CheckCircle } from 'lucide-react';

export default function CodingChallenges() {
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All levels');
  const [listError, setListError] = useState('');
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
  const [challengeConfirmed, setChallengeConfirmed] = useState(false);

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
        setListError('Could not load challenges. Please reload this page to try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleSelectChallenge = async (id) => {
    try {
      setLoading(true);
      setChallengeConfirmed(false);
      setViolationCount(0);
      const res = await axios.get(`/api/challenges/${id}`);
      const challenge = res.data.challenge;
      setActiveChallenge(challenge);
      
      // Default to first supported language or javascript
      const defaultLang = challenge.supportedLanguages?.[0] || 'javascript';
      setLanguage(defaultLang);
      
      // Load sample starter template if provided
      const sample = challenge.sampleCode?.[defaultLang] || '';
      setCode(sample || LANGUAGE_TEMPLATES[defaultLang] || '');
      setTestResults(null);
    } catch (err) {
      alert('Failed to load challenge details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (runOnly = false) => {
    if (!activeChallenge || isSubmitting) return;
    setIsSubmitting(true);
    setTestResults(null);

    try {
      const res = await axios.post(`/api/challenges/${activeChallenge._id}/submit`, {
        code,
        language,
        runOnly
      });
      setTestResults(res.data);
      if (!runOnly) {
        setAttempts(previous => [...previous.filter(a => (a.challengeId?._id || a.challengeId) !== activeChallenge._id), { challengeId: activeChallenge._id, status: res.data.status }]);
      }
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
      handleSubmitCode(false).then(() => {
        setActiveChallenge(null);
        setChallengeConfirmed(false);
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

  // Workspace Confirmation Page
  if (activeChallenge && !challengeConfirmed) {
    return (
      <CameraStartConfirmation
        title={`Start Challenge: ${activeChallenge.title}`}
        subtitle={`Difficulty: ${activeChallenge.difficulty.toUpperCase()} | Supported Languages: ${activeChallenge.supportedLanguages.join(', ')}`}
        onConfirm={() => setChallengeConfirmed(true)}
        onCancel={() => {
          setActiveChallenge(null);
          setChallengeConfirmed(false);
        }}
      />
    );
  }

  // Workspace Split View
  if (activeChallenge) {
    return (
      <div className="coding-workbench max-w-[1440px] mx-auto px-4 py-6">
        {/* Proctoring Camera Feed */}
        <WebcamMonitor 
          challengeId={activeChallenge._id} 
          onViolationLog={() => setViolationCount((prev) => prev + 1)} 
        />

        {/* Back navigation */}
        <button
          onClick={() => {
            setActiveChallenge(null);
            setChallengeConfirmed(false);
          }}
          className="text-brand-600 hover:text-brand-700 font-semibold text-sm mb-4 inline-flex items-center gap-1"
        >
          &larr; Back to Challenges
        </button>

        <div className="grid lg:grid-cols-12 gap-0 items-stretch workbench-panels">
          {/* Left panel: Description */}
          <div className="lg:col-span-5 workbench-description p-6 flex flex-col justify-between">
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-3 ${
                activeChallenge.difficulty === 'easy' ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                activeChallenge.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
              }`}>
                {activeChallenge.difficulty}
              </span>
              <h2 className="font-display font-medium text-3xl text-slate-900 dark:text-white mb-4">{activeChallenge.title}</h2>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-line">
                {activeChallenge.description}
              </div>

              {activeChallenge.constraints && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
                  <pre className="surface-subtle rounded-md p-3 text-xs font-mono dark:text-slate-350">
                    {activeChallenge.constraints}
                  </pre>
                </div>
              )}

              {/* Examples */}
              {activeChallenge.examples && activeChallenge.examples.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Examples</h4>
                  {activeChallenge.examples.map((ex, i) => (
                    <div key={i} className="surface-subtle rounded-md p-4 text-xs font-mono mb-2">
                      <div className="mb-1"><strong className="text-brand-500">Input:</strong> {ex.input}</div>
                      <div className="mb-1"><strong className="text-emerald-500">Output:</strong> {ex.output}</div>
                      {ex.explanation && <div><strong className="text-slate-400">Explanation:</strong> {ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400">
              Created by CodeArena Instructors
            </div>
          </div>

          {/* Right panel: Editor & Console */}
          <div className="lg:col-span-7 min-w-0 flex flex-col justify-between gap-0">
            <MonacoEditor
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              supportedLanguages={activeChallenge.supportedLanguages}
              sampleCode={activeChallenge.sampleCode}
            />

            {/* Run Console Controls */}
            <div className="bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 shadow-inner">
              <div className="flex flex-wrap gap-3 items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" />
                  Terminal Console
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubmitCode(true)}
                    disabled={isSubmitting}
                    className="button-secondary bg-slate-700 hover:bg-slate-650 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Code</span>
                  </button>
                  <button
                    onClick={() => handleSubmitCode(false)}
                    disabled={isSubmitting}
                    className="button-secondary bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Submit Code</span>
                  </button>
                </div>
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

  const visible = challenges.filter(challenge => (challenge.title || '').toLowerCase().includes(query.toLowerCase()) && (difficulty === 'All levels' || challenge.difficulty === difficulty.toLowerCase()));
  const solved = attempts.filter(a => a.status === 'Accepted').length;
  return <SectionLayout label="PRACTICE / PROBLEM SET" title="Work through a problem." description="Read the constraints. Choose your language. Test your approach." count={challenges.length}>
   <LoadError error={listError}/>
   <div className="problem-overview"><div><strong>{solved}</strong><span>accepted solutions</span></div><div><strong>{challenges.length}</strong><span>available problems</span></div><p>Each workspace includes an editor, examples, and test feedback. Camera confirmation is required before starting.</p></div>
   <div className="library-toolbar"><FilterButtons label="Challenge difficulty" options={['All levels','Easy','Medium','Hard']} value={difficulty} onChange={setDifficulty}/><SearchField value={query} onChange={setQuery} placeholder="Find a problem"/></div>
   <div className="problem-list"><div className="problem-list-heading"><span>Problem</span><span>Difficulty</span><span>Languages</span><span>Workspace</span></div>
   {!visible.length?<EmptyState title="No problems to show" detail="Try a different difficulty or search. New challenges will appear here when published."/>:visible.map((challenge,index)=>{const attempt=attempts.find(a=>(a.challengeId?._id || a.challengeId)===challenge._id);return <article className="problem-row" key={challenge._id}><div className="problem-title"><span className="problem-index">{String(index+1).padStart(2,'0')}</span><div><h2>{challenge.title}</h2><p>{attempt ? attempt.status : 'Not attempted'}</p></div></div><span className="level-label" data-level={challenge.difficulty}>{challenge.difficulty}</span><span className="problem-languages">{challenge.supportedLanguages?.join(' / ') || '—'}</span><button onClick={()=>handleSelectChallenge(challenge._id)} className="arena-text-link">{attempt?'Open':'Solve'}<Play size={13}/></button></article>;})}</div>
   <p className="library-footnote">Accepted solutions earn 50 points for easy, 100 for medium, and 200 for hard problems.</p>
  </SectionLayout>;
}
