import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Download, RefreshCw, Search, Code2, BookOpen, Trophy } from 'lucide-react';

const percent = value => Math.min(100, Math.max(0, Number(value) || 0));
const dateLabel = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function StudentDashboard() {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [query, setQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      axios.get('/api/analytics/student'),
      axios.get('/api/quizzes/attempts/my'),
    ]);
    if (results[0].status === 'fulfilled') setAnalytics(results[0].value.data);
    if (results[1].status === 'fulfilled') setAttempts(results[1].value.data.attempts || []);
    if (results.some(result => result.status === 'rejected')) {
      setError('Some dashboard data could not be loaded. Displayed results may be incomplete or out of date.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const downloadScorecard = async attempt => {
    const id = attempt._id || attempt.id;
    setDownloading(id);
    setDownloadError('');
    try {
      const response = await axios.get('/api/quizzes/attempts/' + id + '/pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'scorecard_' + (attempt.quizId?.title || 'quiz').replace(/[^a-z0-9]+/gi, '_') + '.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError('The scorecard could not be downloaded. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const sorted = useMemo(() => [...attempts].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)), [attempts]);
  const filtered = sorted.filter(attempt => ((attempt.quizId?.title || 'Deleted quiz') + ' ' + (attempt.quizId?.category || 'General')).toLowerCase().includes(query.toLowerCase()));
  const subjects = useMemo(() => {
    const groups = new Map();
    attempts.forEach(attempt => {
      const name = attempt.quizId?.category || 'General';
      const group = groups.get(name) || { name, total: 0, count: 0 };
      group.total += percent(attempt.accuracy);
      group.count++;
      groups.set(name, group);
    });
    return [...groups.values()].map(group => ({ ...group, accuracy: Math.round(group.total / group.count) })).sort((a, b) => a.accuracy - b.accuracy);
  }, [attempts]);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), count: attempts.filter(attempt => new Date(attempt.submittedAt) >= date && new Date(attempt.submittedAt) < next).length };
  });
  const maxCount = Math.max(1, ...week.map(day => day.count));
  const weeklyCount = week.reduce((sum, day) => sum + day.count, 0);
  const metrics = analytics?.metrics;
  const metric = key => loading && !metrics ? '…' : metrics?.[key] ?? '—';

  return <div className="student-workspace" aria-busy={loading}>
    <header className="desk-header">
      <div><p className="desk-label">MY WORKSPACE / OVERVIEW</p><h1>{user?.name ? user.name.split(' ')[0] + '’s desk' : 'Your desk'}</h1><p className="desk-muted">Your practice, results, and what to work on next.</p></div>
      <button className="button-secondary px-3 py-2 text-xs" onClick={fetchData} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''}/>{loading ? 'Updating' : 'Refresh'}</button>
    </header>
    {error && <div className="desk-alert" role="alert">{error}<button onClick={fetchData} disabled={loading} className="underline ml-3">Retry</button></div>}
    <div className="desk-layout">
      <aside className="desk-sidebar">
        <p className="desk-label">START A SESSION</p>
        {[[Code2, 'Coding practice', 'Write & run a solution', '/challenges'], [BookOpen, 'Quiz library', 'Check your understanding', '/quizzes'], [Trophy, 'Contests', 'Work against the clock', '/contests']].map(([Icon, title, detail, to]) => <Link className="desk-session" key={to} to={to}><Icon size={18}/><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight size={15}/></Link>)}
        <div className="desk-record"><p className="desk-label">YOUR RECORD</p><dl>{[['Points', 'points'], ['Day streak', 'streak'], ['Quizzes completed', 'totalQuizzes'], ['Contests entered', 'contestsParticipated']].map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{metric(key)}</dd></div>)}</dl><Link to="/leaderboards" className="arena-text-link">View standings<ArrowRight size={14}/></Link></div>
        <Link to="/profile" className="desk-profile">Manage your profile<ArrowUpRight size={14}/></Link>
      </aside>
      <div className="desk-main">
        <section className="desk-summary">
          <div><p className="desk-label">LAST SEVEN DAYS</p><h2>{loading && !attempts.length ? '…' : weeklyCount}<span> quiz {weeklyCount === 1 ? 'attempt' : 'attempts'}</span></h2><p className="desk-muted">{weeklyCount ? 'Each bar represents completed quiz attempts.' : 'Your next quiz will appear here.'}</p></div>
          <div className="desk-week" aria-label="Quiz attempts over the last seven days">{week.map((day, index) => <div key={index} className="desk-day" aria-label={day.label + ': ' + day.count + ' attempts'}><span>{day.count}</span><div className="desk-bar-track"><div style={{ height: day.count ? Math.max(8, day.count / maxCount * 100) + '%' : '0%' }}/></div><small>{day.label}</small></div>)}</div>
        </section>
        <section className="desk-log">
          <div className="desk-section-top"><div><p className="desk-label">ACTIVITY LOG</p><h2>Recent quiz work</h2></div><label className="desk-search"><Search size={15}/><input type="search" aria-label="Search quiz attempts" placeholder="Find a quiz or subject" value={query} onChange={event => setQuery(event.target.value)}/></label></div>
          {downloadError && <p className="desk-alert" role="alert">{downloadError}</p>}
          {loading && !attempts.length ? <div className="desk-empty" role="status">Loading your activity…</div> : !filtered.length ? <div className="desk-empty"><h3>{query ? 'No matching attempts' : 'Your work log starts here.'}</h3><p>{query ? 'Try another quiz name or subject.' : 'Complete a quiz to see your score, accuracy, and downloadable scorecard.'}</p>{query ? <button onClick={() => setQuery('')} className="arena-text-link">Clear search</button> : <Link to="/quizzes" className="arena-text-link">Find a quiz<ArrowRight size={15}/></Link>}</div> : <div className="desk-table-wrap"><table className="desk-table"><thead><tr><th>Quiz / subject</th><th>Score</th><th>Accuracy</th><th>Submitted</th><th><span className="sr-only">Scorecard</span></th></tr></thead><tbody>{filtered.map(attempt => <tr key={attempt._id || attempt.id}><td><strong>{attempt.quizId?.title || 'Deleted quiz'}</strong><span>{attempt.quizId?.category || 'General'} · {attempt.quizId?.difficulty || 'Unspecified'}</span></td><td className="font-mono">{attempt.score ?? '—'}<span> / {attempt.quizId?.totalMarks ?? '—'}</span></td><td className="font-mono">{attempt.accuracy == null ? '—' : percent(attempt.accuracy) + '%'}</td><td>{dateLabel(attempt.submittedAt)}</td><td><button disabled={downloading !== null} onClick={() => downloadScorecard(attempt)} className="desk-download" aria-label={'Download scorecard for ' + (attempt.quizId?.title || 'quiz')}><Download size={15}/><span>{downloading === (attempt._id || attempt.id) ? 'Saving…' : 'PDF'}</span></button></td></tr>)}</tbody></table></div>}
        </section>
        <section className="desk-subjects">
          <div><p className="desk-label">REVIEW & PLAN</p><h2>Accuracy by subject</h2><p className="desk-muted">Based on your quiz attempts, ordered from lowest accuracy.</p><div className="desk-average"><strong>{metric('accuracy')}{metrics ? '%' : ''}</strong><span>overall accuracy</span></div></div>
          <div>{subjects.length ? subjects.map(subject => <div className="desk-subject" key={subject.name}><div><span>{subject.name}</span><strong>{subject.accuracy}%</strong></div><div className="desk-meter" role="meter" aria-label={subject.name + ' accuracy'} aria-valuenow={subject.accuracy} aria-valuemin={0} aria-valuemax={100}><span style={{ width: subject.accuracy + '%' }}/></div><small>{subject.count} {subject.count === 1 ? 'attempt' : 'attempts'}</small></div>) : <p className="desk-muted py-8">{loading ? 'Loading subject results…' : 'Subject results will appear after your first quiz.'}</p>}</div>
        </section>
      </div>
    </div>
  </div>;
}
