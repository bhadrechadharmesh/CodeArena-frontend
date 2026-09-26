import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

const topics = [
 ['01', 'Arrays & strings', 'Start with the fundamentals.', 'Fundamentals'],
 ['02', 'Hash maps & sets', 'Find a faster way to look things up.', 'Data structures'],
 ['03', 'Trees & graphs', 'Work through connected problems.', 'Traversal'],
 ['04', 'Dynamic programming', 'Break a problem into smaller decisions.', 'Algorithms'],
];

export default function Home() {
 const { isAuthenticated, user } = useSelector(state => state.auth);
 const destination = isAuthenticated ? '/' + (user?.role || 'student') + '-dashboard' : '/register';
 return <div className="arena-home">
  <section className="arena-intro">
   <div className="arena-kicker"><span className="arena-square"/>CODEARENA / PRACTICE & COMPETITION</div>
   <div className="arena-intro-grid">
    <h1>Good code takes<br/><em>practice.</em></h1>
    <div className="arena-intro-note"><p>A workspace for solving problems, taking quizzes, and competing against the clock.</p><Link to={destination} className="button-primary px-5 py-3 text-sm">{isAuthenticated ? 'Open dashboard' : 'Create an account'}<ArrowRight size={16}/></Link><span className="block text-xs text-[var(--muted)] mt-4">{isAuthenticated ? 'Your work, results, and upcoming sessions.' : <>Already a member? <Link to="/login" className="underline underline-offset-4 text-[var(--ink)]">Log in</Link></>}</span></div>
   </div>
  </section>
  <section className="arena-content">
   <div className="arena-practice">
    <div className="arena-section-heading"><h2>At the practice desk</h2><span className="font-mono text-xs text-[var(--muted)]">01 — EXPLORE</span></div>
    <p className="text-sm text-[var(--muted)] mb-7">A few of the ideas worth getting comfortable with.</p>
    <div>{topics.map(([number,title,description,tag])=><Link to="/challenges" className="topic-row" key={number}><span className="topic-number">{number}</span><div><h3>{title}</h3><p>{description}</p></div><span className="topic-tag">{tag}</span><ArrowUpRight size={18}/></Link>)}</div>
    <Link to="/challenges" className="arena-text-link mt-6">Browse available challenges<ArrowRight size={16}/></Link>
   </div>
   <aside className="arena-notice">
    <span className="font-mono text-xs tracking-wider">THE CONTEST BOARD</span>
    <div className="contest-symbol" aria-hidden="true">[ &nbsp; : &nbsp; ]</div>
    <h2>A problem.<br/>A clock.<br/>Your approach.</h2>
    <p>Find a contest, read the rules, and see how your solutions hold up under time pressure.</p>
    <Link to="/contests" className="arena-text-link">View contests<ArrowUpRight size={16}/></Link>
   </aside>
  </section>
  <section className="arena-bottom">
   <Link to="/quizzes"><span className="font-mono text-xs text-[var(--muted)]">02 / CHECK YOUR UNDERSTANDING</span><h2>Take a quiz <ArrowUpRight size={20}/></h2><p>Test what you know. Review what you missed.</p></Link>
   <Link to="/leaderboards"><span className="font-mono text-xs text-[var(--muted)]">03 / FOLLOW THE RESULTS</span><h2>View the standings <ArrowUpRight size={20}/></h2><p>Compare results across the arena.</p></Link>
   <Link to="/about"><span className="font-mono text-xs text-[var(--muted)]">04 / FOR EDUCATORS</span><h2>Run your own session <ArrowUpRight size={20}/></h2><p>Create challenges and assessments for your class.</p></Link>
  </section>
 </div>;
}
