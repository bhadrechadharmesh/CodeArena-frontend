import React from 'react';
import { ShieldCheck, Cpu, Code2, RefreshCw } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white text-center mb-4">About CodeArena</h1>
      <p className="text-slate-600 dark:text-slate-350 text-center max-w-2xl mx-auto text-sm leading-relaxed mb-12">
        CodeArena is a state-of-the-art competitive coding and diagnostic testing ecosystem built to bridge learning gaps for developers and simplify proctored examinations for educational institutions.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-outfit font-semibold text-lg dark:text-white flex items-center gap-2 mb-3">
            <Cpu className="h-5 w-5 text-brand-600" />
            Execution Judge Architecture
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            The platform compiles code submissions in real-time inside secure, isolated processes. Using timeout guarantees and standard IO streaming, we validate answers against hidden test case criteria.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-outfit font-semibold text-lg dark:text-white flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Proctoring & Audit Trailing
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
            To prevent fraud, active proctoring tracks tab switching, browser unfocusing, and camera availability. These security violations are logged directly to the admin center for review.
          </p>
        </div>
      </div>
    </div>
  );
}
