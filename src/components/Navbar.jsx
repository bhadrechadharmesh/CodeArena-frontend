import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Moon, Sun, X, LogOut } from 'lucide-react';
import { logout } from '../redux/slices/authSlice.js';

const roleLinks = {
  student: [['/student-dashboard', 'Overview'], ['/quizzes', 'Quizzes'], ['/challenges', 'Challenges'], ['/contests', 'Contests'], ['/leaderboards', 'Rankings']],
  teacher: [['/teacher-dashboard', 'Overview'], ['/create-challenge', 'New challenge'], ['/create-quiz', 'New quiz'], ['/create-contest', 'Schedule']],
  admin: [['/admin-dashboard', 'Admin panel']],
};

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); const navigate = useNavigate(); const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [open, setOpen] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('theme', theme); }, [theme]);
  const links = isAuthenticated ? (roleLinks[user?.role] || []) : [['/about', 'About']];
  const signOut = () => { dispatch(logout()); navigate('/login'); setOpen(false); };
  const active = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return <nav className="sticky top-0 z-50 border-b border-[var(--line)]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-[72px] flex items-center justify-between gap-6">
      <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setOpen(false)}><span className="w-8 h-8 bg-[var(--accent)] text-[#181a1b] grid place-items-center font-bold text-sm">CA</span><span className="font-bold tracking-[-0.04em] text-lg">codearena<span className="text-[#9dbf25]">.</span></span></Link>
      <div className="hidden md:flex items-center gap-1 flex-1">{links.map(([path, label]) => <Link key={path} to={path} className={`px-3 py-2 text-sm font-medium ${active(path) ? 'text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}><span className={active(path) ? 'border-b-2 border-[var(--accent-dark)] pb-1' : ''}>{label}</span></Link>)}</div>
      <div className="hidden md:flex items-center gap-3">
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-[var(--muted)] hover:text-[var(--ink)]" aria-label="Toggle theme">{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}</button>
        {isAuthenticated ? <><Link to="/profile" className="flex items-center gap-2 text-sm font-medium"><span className="w-8 h-8 rounded-full bg-[var(--ink)] text-[var(--surface)] grid place-items-center text-xs">{user?.name?.charAt(0)?.toUpperCase()}</span><span className="max-w-[120px] truncate">{user?.name}</span></Link><button onClick={signOut} className="text-[var(--muted)] hover:text-red-600 p-2" title="Log out"><LogOut size={17}/></button></> : <><Link to="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]">Log in</Link><Link to="/register" className="nm-btn-primary text-sm font-semibold px-4 py-2">Create account</Link></>}
      </div>
      <div className="md:hidden flex items-center gap-2"><button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 text-[var(--muted)]">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button><button onClick={() => setOpen(!open)} className="p-2 text-[var(--ink)]">{open ? <X size={21}/> : <Menu size={21}/>}</button></div>
    </div></div>
    {open && <div className="md:hidden border-t border-[var(--line)] px-4 py-3 bg-[var(--surface)]">{links.map(([path,label]) => <Link key={path} to={path} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium border-b border-[var(--line)]">{label}</Link>)}{isAuthenticated ? <button onClick={signOut} className="py-3 text-sm text-red-600">Log out</button> : <Link to="/login" onClick={() => setOpen(false)} className="block py-3 text-sm">Log in</Link>}</div>}
  </nav>;
}
