import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trophy, Terminal, Award, HelpCircle, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-tr from-brand-100/30 to-indigo-100/30 dark:from-brand-900/10 dark:to-indigo-900/10 blur-3xl -z-10 rounded-full"></div>

      {/* Hero section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
        <h1 className="font-outfit font-extrabold text-5xl sm:text-6xl tracking-tight text-slate-900 dark:text-white leading-none">
          Evaluate & Showcase Your <br />
          <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
            Coding & Quiz Expertise
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
          The ultimate full-stack competitive playground. Attempt randomized MCQ quizzes, solve algorithmic coding challenges in Monaco IDE, join scheduled contests, and get certified.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
          <Link
            to="/about"
            className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold px-8 py-3 rounded-xl transition-all"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-slate-100/50 dark:bg-slate-900/30 py-20 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-outfit font-bold text-3xl text-slate-900 dark:text-white">Why CodeArena Platform?</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              We provide state-of-the-art tools and resources to host secure, robust, and interactive competitions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: <Terminal className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
                title: 'Monaco Code Editor',
                desc: 'Write answers inside standard VS Code Monaco editor with autocomplete, multi-language highlight, and instant online compilations.'
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
                title: 'AI Anti-Cheating Monitor',
                desc: 'Stay safe with browser lock configurations, visibility tab switch logging, and webcam facial tracking alarms.'
              },
              {
                icon: <Trophy className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
                title: 'WebSocket Leaderboards',
                desc: 'Join coding tournaments with live leaderboards, synchronous countdown timers, and penalty rankings.'
              },
              {
                icon: <Award className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
                title: 'PDF Scorecards',
                desc: 'Evaluate accuracy and speed. Download custom vector-generated PDF certificates instantly upon completion.'
              },
              {
                icon: <HelpCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
                title: 'Multiple Question Types',
                desc: 'Support MCQ, Multiple Correct, True/False, and Fill-in-the-Blank templates for flexible exam creation.'
              },
              {
                icon: <Users className="h-6 w-6 text-brand-600 dark:text-brand-400" />,
                title: 'Unified Dashboard Reporting',
                desc: 'Analyze strengths and weaknesses with interactive Recharts reports for student diagnostics, teachers, and admins.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                <div className="bg-brand-50 dark:bg-slate-700/50 p-3 rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-outfit font-semibold text-xl text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
