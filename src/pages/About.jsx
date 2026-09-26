import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function About() {
 return <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
  <p className="eyebrow">ABOUT / CODEARENA</p>
  <h1 className="text-4xl sm:text-5xl font-medium mt-6 mb-6">A place to work on<br/>your problem-solving.</h1>
  <p className="text-lg leading-8 text-[var(--muted)] max-w-2xl">CodeArena brings programming practice, quizzes, and timed contests into one workspace for students and educators.</p>
  <div className="mt-12 border-t border-[var(--line)]">{[
   ['01', 'Practice', 'Write and run code in the integrated editor. Use test-case feedback to review your approach and improve your solution.'],
   ['02', 'Compete', 'Join timed contests and follow the standings. Review the rules and submit solutions before the session ends.'],
   ['03', 'Assess', 'Take quizzes and review your results. Educators can create challenges, schedule contests, and manage assessments.'],
   ['04', 'Review', 'Access submission history and scorecards. Proctored sessions record tab, focus, and camera events for educator review.'],
  ].map(([n,title,text])=><section key={n} className="grid grid-cols-[32px_1fr] sm:grid-cols-[40px_140px_1fr] gap-4 py-7 border-b border-[var(--line)]"><span className="font-mono text-xs text-[var(--muted)] pt-1">{n}</span><h2 className="text-xl font-medium">{title}</h2><p className="col-start-2 sm:col-start-auto text-sm leading-7 text-[var(--muted)]">{text}</p></section>)}</div>
  <Link to="/challenges" className="arena-text-link mt-8">Browse challenges<ArrowRight size={16}/></Link>
 </div>;
}
