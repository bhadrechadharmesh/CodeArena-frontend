import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';

export function SectionLayout({ label, title, description, count, children }) {
 return <div className="library-page"><header className="library-header"><div><p className="desk-label">{label}</p><h1>{title}</h1><p>{description}</p></div>{count !== undefined && <div className="library-total"><strong>{count}</strong><span>in the collection</span></div>}</header><nav className="library-nav" aria-label="Arena sections">{[['/quizzes','Quizzes'],['/challenges','Challenges'],['/contests','Contests'],['/leaderboards','Rankings']].map(([to,text])=><NavLink key={to} to={to}>{text}</NavLink>)}</nav>{children}</div>;
}
export function SearchField({ value, onChange, placeholder = 'Search' }) {
 return <label className="library-search"><Search size={16}/><input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/></label>;
}
export function FilterButtons({ options, value, onChange, label }) {
 return <div className="library-filters" role="group" aria-label={label}>{options.map(option=><button key={option} aria-pressed={value === option} className={value === option ? 'selected' : ''} onClick={()=>onChange(option)}>{option}</button>)}</div>;
}
export function EmptyState({ title, detail }) {
 return <div className="library-empty"><h2>{title}</h2><p>{detail}</p></div>;
}
export function LoadError({ error, retry }) {
 return error ? <div role="alert" className="desk-alert">{error}{retry && <button onClick={retry} className="inline-flex items-center gap-2 underline ml-4"><RefreshCw size={13}/>Retry</button>}</div> : null;
}
