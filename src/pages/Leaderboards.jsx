import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionLayout, SearchField, EmptyState, LoadError } from '../components/SectionLayout.jsx';

export default function Leaderboards() {
 const { user } = useSelector(state=>state.auth);
 const [users,setUsers]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [college,setCollege]=useState('All colleges');
 const fetchLeaderboard=useCallback(async()=>{
  setLoading(true);setError('');
  try {
   const res=await axios.get('/api/analytics/leaderboard');
   if(!Array.isArray(res.data.users)) throw new Error('Invalid response');
   setUsers(res.data.users);
  } catch(err){setError(err.response?.data?.message || 'Could not load rankings. Please try again.');}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{fetchLeaderboard();},[fetchLeaderboard]);
 const myId=user?._id || user?.id;
 const own=users.find(item=>item._id===myId);
 const colleges=[...new Set(users.map(item=>item.college).filter(Boolean))].sort();
 const visible=users.filter(item=>((item.name || '')+' '+(item.college || '')).toLowerCase().includes(query.trim().toLowerCase()) && (college==='All colleges' || item.college===college));
 return <SectionLayout label="COMMUNITY / GLOBAL STANDINGS" title="The standings." description="Cumulative points from quizzes, coding challenges, and contests. Equal points share a rank.">
  <LoadError error={error} retry={fetchLeaderboard}/>
  <div className="rank-layout"><aside className="rank-sidebar"><p className="desk-label">YOUR POSITION</p><strong className="rank-position">{own?'#'+own.rank:'—'}</strong><h2>{own?.name || user?.name || 'Your standing'}</h2><p>{own?own.totalPoints.toLocaleString()+' arena points':loading?'Loading your position…':error?'Your position is unavailable.':'No student ranking available.'}</p><Link to="/challenges" className="arena-text-link mt-6">Go to practice<ArrowRight size={14}/></Link><div className="ranking-rules"><p className="desk-label">HOW TO READ THE BOARD</p><p>Rankings include verified students. Your global rank stays the same when you filter this list.</p><p>Tied scores share a position. The next position skips the number of tied competitors.</p><span>{users.length} students ranked</span></div></aside>
  <section className="rank-main"><div className="library-toolbar"><SearchField value={query} onChange={setQuery} placeholder="Search name or college"/><div className="flex flex-wrap gap-3"><select aria-label="Filter rankings by college" className="library-select" value={college} onChange={e=>setCollege(e.target.value)}><option>All colleges</option>{colleges.map(name=><option key={name}>{name}</option>)}</select><button className="button-secondary px-3 py-2 text-xs" disabled={loading} onClick={fetchLeaderboard}><RefreshCw size={14} className={loading?'animate-spin':''}/>{loading?'Updating':'Refresh'}</button></div></div>
  <p className="library-result-count" aria-live="polite">{visible.length} students shown{error && users.length>0?' · Previously loaded standings':''}</p>
  {loading&&!users.length?<EmptyState title="Loading standings…" detail="Getting the latest points and positions."/>:!visible.length?<EmptyState title={error?'Standings unavailable':'No matching students'} detail={error?'Retry to fetch the standings.':'Try a different name or college. Verified students will appear here.'}/>:<div className="rank-table-wrap"><table className="rank-table"><thead><tr><th>Position</th><th>Student</th><th>College</th><th>Streak</th><th>Points</th></tr></thead><tbody>{visible.map(item=><tr key={item._id} className={item._id===myId?'own-rank':''}><td><span className={item.rank<=3?'leading-rank':''}>{String(item.rank).padStart(2,'0')}</span></td><td><strong>{item.name || 'Unnamed student'}</strong>{item._id===myId && <small>You</small>}</td><td>{item.college || 'Not specified'}</td><td>{item.streak ?? 0}</td><td>{(item.totalPoints ?? 0).toLocaleString()}</td></tr>)}</tbody></table></div>}
  </section></div>
 </SectionLayout>;
}
