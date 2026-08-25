import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Code2, LockKeyhole, Trophy } from 'lucide-react';

const capabilities = [
  ['01', 'Write and run', 'A focused Monaco workspace with multiple languages and immediate test feedback.'],
  ['02', 'Compete live', 'Timed contests, shared scoreboards, and ranking rules everyone can understand.'],
  ['03', 'Review the work', 'Quiz analytics, submission history, downloadable scorecards, and audit logs.'],
];

export default function Home() {
  return <div>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
      <div className="grid lg:grid-cols-[1.02fr_.98fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-[.16em] text-[var(--muted)] mb-7"><span className="w-2 h-2 bg-[var(--accent)]"></span> Practice · Assess · Compete</div>
          <h1 className="text-5xl sm:text-6xl md:text-[76px] leading-[.98] tracking-[-.065em] font-semibold max-w-3xl">A serious place to get better at code.</h1>
          <p className="mt-7 text-lg leading-8 text-[var(--muted)] max-w-xl">Solve programming challenges, take secure assessments, and run fair contests—without the clutter that gets between you and the problem.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3"><Link to="/register" className="nm-btn-primary px-5 py-3 text-sm font-semibold inline-flex items-center gap-3">Start solving <ArrowRight size={16}/></Link><Link to="/about" className="px-5 py-3 text-sm font-semibold border border-[var(--line)] bg-[var(--surface)]">See how it works</Link></div>
          <div className="mt-10 pt-6 border-t border-[var(--line)] flex flex-wrap gap-x-7 gap-y-3 text-xs text-[var(--muted)]"><span className="flex items-center gap-2"><Check size={14}/> Instant code execution</span><span className="flex items-center gap-2"><Check size={14}/> Proctored sessions</span><span className="flex items-center gap-2"><Check size={14}/> Live rankings</span></div>
        </div>

        <div className="border border-[var(--line)] bg-[#151816] text-[#e8ede8] shadow-[14px_14px_0_var(--accent)]">
          <div className="h-12 px-4 border-b border-[#343a35] flex items-center justify-between text-xs font-mono"><span className="text-[#a7b0aa]">two_sum.cpp</span><span className="flex items-center gap-2 text-[var(--accent)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span> RUNNING</span></div>
          <div className="grid grid-cols-[42px_1fr] font-mono text-[12px] sm:text-[13px] leading-7 py-5 min-h-[270px] overflow-hidden"><div className="text-right pr-3 text-[#606861] select-none">1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7<br/>8</div><pre className="m-0 whitespace-pre text-[#d8ddd9]"><span className="text-[#9ead9f]">#include</span> &lt;vector&gt;{`\n`}<span className="text-[#9ead9f]">using namespace</span> std;{`\n\n`}vector&lt;<span className="text-[var(--accent)]">int</span>&gt; twoSum(vector&lt;<span className="text-[var(--accent)]">int</span>&gt;& nums, <span className="text-[var(--accent)]">int</span> target) {'{'}{`\n`}  unordered_map&lt;<span className="text-[var(--accent)]">int</span>, <span className="text-[var(--accent)]">int</span>&gt; seen;{`\n`}  <span className="text-[#9ead9f]">for</span> (<span className="text-[var(--accent)]">int</span> i = 0; i &lt; nums.size(); i++) {'{'}{`\n`}    <span className="text-[#9ead9f]">if</span> (seen.count(target - nums[i])){`\n`}      <span className="text-[#9ead9f]">return</span> {'{'}seen[target - nums[i]], i{'}'};</pre></div>
          <div className="grid grid-cols-3 border-t border-[#343a35] text-xs"><div className="p-4 border-r border-[#343a35]"><span className="block text-[#778079] mb-1">Tests</span><strong className="text-[var(--accent)]">12 / 12</strong></div><div className="p-4 border-r border-[#343a35]"><span className="block text-[#778079] mb-1">Runtime</span><strong>4.2 ms</strong></div><div className="p-4"><span className="block text-[#778079] mb-1">Memory</span><strong>8.1 MB</strong></div></div>
        </div>
      </div>
    </section>

    <section className="border-y border-[var(--line)] bg-[var(--surface)]"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"><div className="grid md:grid-cols-3">{capabilities.map(([n,title,text], i) => <div key={n} className={`py-5 md:px-8 ${i ? 'md:border-l border-[var(--line)]' : ''}`}><span className="font-mono text-xs text-[var(--muted)]">{n}</span><h2 className="text-xl font-semibold tracking-tight mt-5">{title}</h2><p className="text-sm leading-6 text-[var(--muted)] mt-2 max-w-sm">{text}</p></div>)}</div></div></section>

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"><div className="grid lg:grid-cols-2 gap-12 items-start"><div><p className="font-mono text-xs uppercase tracking-[.15em] text-[var(--muted)]">Built for real sessions</p><h2 className="text-4xl md:text-5xl font-semibold tracking-[-.045em] mt-4 max-w-lg">Everything the contest needs. Nothing it doesn’t.</h2></div><div className="grid sm:grid-cols-2 gap-px bg-[var(--line)] border border-[var(--line)]">{[[Code2,'Judge','Compile and evaluate against hidden test cases.'],[Clock3,'Timing','Synchronized clocks and clear submission states.'],[LockKeyhole,'Integrity','Tab, focus, and camera event reporting.'],[Trophy,'Results','Live standings and downloadable scorecards.']].map(([Icon,t,d]) => <div key={t} className="bg-[var(--surface)] p-6"><Icon size={20}/><h3 className="font-semibold mt-7">{t}</h3><p className="text-sm text-[var(--muted)] leading-6 mt-2">{d}</p></div>)}</div></div></section>
  </div>;
}
