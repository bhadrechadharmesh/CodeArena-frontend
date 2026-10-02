import { enterFullscreen } from '../services/fullscreen.js';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Download, RefreshCw, Search } from 'lucide-react';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [historyReady, setHistoryReady] = useState(false);
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('title');
  const [selectedId, setSelectedId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const detailRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setErrors({});
    const [library, history] = await Promise.allSettled([
      axios.get('/api/quizzes'), axios.get('/api/quizzes/attempts/my'),
    ]);
    const nextErrors = {};
    if (library.status === 'fulfilled') setQuizzes(library.value.data.quizzes || []);
    else nextErrors.library = 'The quiz library could not be refreshed.';
    if (history.status === 'fulfilled') {
      setAttempts(history.value.data.attempts || []);
      setHistoryReady(true);
    } else {
      setHistoryReady(false);
      nextErrors.history = 'Your attempt history is unavailable. Retry before starting a quiz.';
    }
    setErrors(nextErrors);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const attemptFor = id => attempts.find(attempt => String(attempt.quizId?._id || attempt.quizId) === String(id));
  const completed = quizzes.filter(quiz => attemptFor(quiz._id)).length;
  const subjects = [...new Set(quizzes.map(quiz => quiz.category || 'General'))].sort();
  const visible = quizzes.filter(quiz => {
    const matchesText = [quiz.title, quiz.category, quiz.description].filter(Boolean).join(' ').toLowerCase().includes(query.trim().toLowerCase());
    return matchesText && (!subject || (quiz.category || 'General') === subject) && (!difficulty || quiz.difficulty === difficulty)
      && (status === 'All' || (status === 'Completed' ? !!attemptFor(quiz._id) : !attemptFor(quiz._id)));
  }).sort((a, b) => sort === 'duration' ? (a.duration || 0) - (b.duration || 0) : (a.title || '').localeCompare(b.title || ''));
  const selected = visible.find(quiz => quiz._id === selectedId) || visible[0];
  const selectedAttempt = selected && historyReady ? attemptFor(selected._id) : null;
  const clearFilters = () => { setQuery(''); setSubject(''); setDifficulty(''); setStatus('All'); };
  const selectQuiz = id => {
    setSelectedId(id);
    setDownloadError('');
    if (window.matchMedia('(max-width: 800px)').matches) {
      detailRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      detailRef.current?.focus({ preventScroll: true });
    }
  };
  const download = async () => {
    if (!selectedAttempt || downloading) return;
    setDownloading(true); setDownloadError('');
    try {
      const response = await axios.get('/api/quizzes/attempts/' + (selectedAttempt._id || selectedAttempt.id) + '/pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scorecard_' + (selected.title || 'quiz').replace(/[^a-z0-9]+/gi, '_') + '.pdf';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setDownloadError('Could not download the scorecard. Please try again.'); }
    finally { setDownloading(false); }
  };

  return <div className="quiz-hub">
    <header className="quiz-hub-header">
      <div><Link to="/student-dashboard" className="quiz-back"><ArrowLeft size={13}/>Your workspace</Link><h1>Quiz room<span>.</span></h1><p>Choose an assessment. Make time to think.</p></div>
      <div className="quiz-hub-progress"><p className="desk-label">YOUR LIBRARY</p><strong>{historyReady ? completed : '—'}<span> / {quizzes.length}</span></strong><p>assessments completed</p><div className="quiz-progress-track"><span style={{ width: (historyReady && quizzes.length ? completed / quizzes.length * 100 : 0) + '%' }}/></div></div>
    </header>

    {Object.values(errors).length > 0 && <div className="desk-alert" role="alert">{Object.values(errors).join(' ')}<button onClick={load} disabled={loading} className="underline ml-3">Retry</button></div>}
    <div className="quiz-hub-controls">
      <div className="quiz-hub-tabs" role="group" aria-label="Filter by completion">{['All', 'Not attempted', 'Completed'].map(value => <button key={value} disabled={value !== 'All' && !historyReady} aria-pressed={status === value} onClick={() => setStatus(value)}>{value}<span>{value === 'All' ? quizzes.length : !historyReady ? '—' : value === 'Completed' ? completed : quizzes.length - completed}</span></button>)}</div>
      <button onClick={load} disabled={loading} className="quiz-refresh" aria-label="Refresh quiz library"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/><span>Refresh</span></button>
    </div>
    <div className="quiz-hub-filters">
      <label className="quiz-hub-search"><Search size={16}/><input type="search" aria-label="Search quizzes" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a quiz, subject, or keyword"/></label>
      <label><span>Subject</span><select value={subject} onChange={event => setSubject(event.target.value)}><option value="">All subjects</option>{subjects.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span>Level</span><select value={difficulty} onChange={event => setDifficulty(event.target.value)}><option value="">Any level</option>{['easy', 'medium', 'hard'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
      <label><span>Sort</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="title">A–Z</option><option value="duration">Shortest first</option></select></label>
    </div>

    {loading && !quizzes.length ? <div className="quiz-hub-empty" role="status"><RefreshCw size={20} className="animate-spin"/><h2>Opening the quiz library…</h2></div> : !visible.length ? <div className="quiz-hub-empty"><span className="desk-label">NOTHING HERE YET</span><h2>{errors.library ? 'The library is unavailable.' : quizzes.length ? 'No quizzes match this view.' : 'The next assessment is on its way.'}</h2><p>{errors.library ? 'Retry to fetch available assessments.' : quizzes.length ? 'Try another subject or remove a filter.' : 'Published quizzes will appear here when they are ready.'}</p>{quizzes.length > 0 && <button onClick={clearFilters} className="button-secondary px-4 py-2 text-sm">Clear filters</button>}</div> : <div className="quiz-hub-body">
      <section className="quiz-hub-list" aria-label="Available assessments"><div className="quiz-list-caption"><span>ASSESSMENT INDEX</span><span aria-live="polite">{visible.length} results</span></div>
        {visible.map((quiz, index) => {
          const attempt = historyReady && attemptFor(quiz._id);
          return <button key={quiz._id} className={'quiz-index-item ' + (selected?._id === quiz._id ? 'is-selected' : '')} onClick={() => selectQuiz(quiz._id)} aria-pressed={selected?._id === quiz._id} aria-controls="quiz-brief">
            <span className="quiz-index-number">{String(index + 1).padStart(2, '0')}</span><span className="quiz-index-content"><span className="quiz-index-category">{quiz.category || 'General'}</span><strong>{quiz.title}</strong><span className="quiz-index-meta"><span>{quiz.duration ?? '—'} min</span><span className="level-label" data-level={quiz.difficulty}>{quiz.difficulty || 'Mixed'}</span>{attempt && <span className="quiz-index-done"><Check size={12}/>Completed</span>}</span></span><ChevronRight size={17}/>
          </button>;
        })}
      </section>
      <aside id="quiz-brief" className="quiz-brief" ref={detailRef} tabIndex={-1} aria-label="Selected quiz details">
        <div className="quiz-brief-top"><span>ASSESSMENT BRIEF</span><span>{selectedAttempt ? 'COMPLETED' : 'READ BEFORE STARTING'}</span></div>
        <p className="quiz-brief-subject">{selected.category || 'General'}</p><h2>{selected.title}</h2><p className="quiz-brief-description">{selected.description || 'Review the assessment details below before you begin.'}</p>
        <dl className="quiz-brief-facts"><div><dt>Time limit</dt><dd>{selected.duration ?? '—'}<small> minutes</small></dd></div><div><dt>Total marks</dt><dd>{selected.totalMarks ?? '—'}</dd></div><div><dt>Difficulty</dt><dd className="quiz-fact-level">{selected.difficulty || 'Mixed'}</dd></div></dl>
        {selectedAttempt ? <div className="quiz-brief-result"><p className="desk-label">YOUR RESULT</p><strong>{selectedAttempt.score ?? '—'}<span> / {selected.totalMarks ?? '—'}</span></strong><p>{selectedAttempt.accuracy ?? '—'}% accuracy</p><button onClick={download} disabled={downloading} className="button-secondary px-4 py-3 text-sm"><Download size={15}/>{downloading ? 'Preparing scorecard…' : 'Download scorecard'}</button>{downloadError && <p role="alert">{downloadError}</p>}</div> : <><div className="quiz-before"><h3>Before you settle in</h3><ol><li><span>01</span>Have your camera ready for the session check.</li><li><span>02</span>Allow enough time to finish in one sitting.</li><li><span>03</span>Your submitted result will appear in this library.</li></ol></div>{historyReady ? <Link className="quiz-start" onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) enterFullscreen().catch(() => {}); }} to={'/quizzes/' + selected._id + '/attempt'}>Continue to setup<ArrowRight size={17}/></Link> : <button className="quiz-start" onClick={load} disabled={loading}>Retry attempt history<RefreshCw size={15}/></button>}<p className="quiz-start-note">The assessment opens after the session check.</p></>}
      </aside>
    </div>}
    <footer className="quiz-hub-footer"><span>CodeArena / Assessment library</span><Link to="/student-dashboard">View your activity<ArrowRight size={13}/></Link></footer>
  </div>;
}
