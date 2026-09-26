import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Check } from 'lucide-react';
import { SectionLayout, SearchField, FilterButtons, EmptyState, LoadError } from '../components/SectionLayout.jsx';

export default function QuizList() {
 const [quizzes,setQuizzes]=useState([]);
 const [attempts,setAttempts]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [status,setStatus]=useState('All quizzes');
 const [category,setCategory]=useState('All subjects');
 const fetchQuizzes=async()=>{
  setLoading(true); setError('');
  try {
   const [list,history]=await Promise.all([axios.get('/api/quizzes'),axios.get('/api/quizzes/attempts/my')]);
   setQuizzes(list.data.quizzes || []); setAttempts(history.data.attempts || []);
  } catch { setError('Could not load the quiz library and your attempt history.'); }
  finally { setLoading(false); }
 };
 useEffect(()=>{fetchQuizzes();},[]);
 const attemptFor=id=>attempts.find(a=>(a.quizId?._id || a.quizId)===id);
 const categories=['All subjects',...new Set(quizzes.map(q=>q.category || 'General'))];
 const visible=quizzes.filter(q=>(q.title+' '+(q.category || '')).toLowerCase().includes(query.toLowerCase()) && (category==='All subjects' || (q.category || 'General')===category) && (status==='All quizzes' || (status==='Completed' ? !!attemptFor(q._id) : !attemptFor(q._id))));
 return <SectionLayout label="ASSESSMENTS / QUIZ LIBRARY" title="Check what you know." description="Browse by subject, set aside the time, and work through a quiz." count={quizzes.length}>
  <LoadError error={error} retry={fetchQuizzes}/>
  <div className="library-columns"><aside className="library-sidebar"><p className="desk-label">SUBJECT INDEX</p>{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}><span>{c}</span><small>{c==='All subjects'?quizzes.length:quizzes.filter(q=>(q.category || 'General')===c).length}</small></button>)}<div className="library-note"><h3>Before you begin</h3><p>Check the time limit and camera requirements. Completed quizzes stay here with your score.</p></div></aside>
  <section className="library-main"><div className="library-toolbar"><FilterButtons label="Quiz status" options={['All quizzes','Not attempted','Completed']} value={status} onChange={setStatus}/><SearchField value={query} onChange={setQuery} placeholder="Find a quiz"/></div>
   <p className="library-result-count" aria-live="polite">{visible.length} quizzes · {category}</p>
   {loading?<EmptyState title="Loading quizzes…" detail="Getting your library and results."/>:!visible.length?<EmptyState title={error?'Library unavailable':'No quizzes to show'} detail={error?'Use Retry to load the library.':'Try another subject or search, or return when new quizzes are published.'}/>:<div className="quiz-shelf">{visible.map((quiz,index)=>{const attempt=attemptFor(quiz._id);return <article className="quiz-sheet" key={quiz._id}><div className="quiz-sheet-top"><span className="font-mono">{String(index+1).padStart(2,'0')}</span><span className="level-label" data-level={quiz.difficulty}>{quiz.difficulty || 'Mixed'}</span></div><p className="desk-label mt-6">{quiz.category || 'General'}</p><h2>{quiz.title}</h2><p className="quiz-description">{quiz.description || 'Test your understanding of this subject.'}</p><div className="quiz-facts"><span><Clock size={13}/>{quiz.duration} min</span><span>{quiz.totalMarks} marks</span></div><footer>{attempt?<span className="quiz-complete"><Check size={15}/>Completed · {attempt.score}/{quiz.totalMarks}</span>:<Link to={'/quizzes/'+quiz._id+'/attempt'}>Start quiz<ArrowUpRight size={17}/></Link>}</footer></article>;})}</div>}
  </section></div>
 </SectionLayout>;
}
