import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trophy, Terminal, Award, HelpCircle, Users, Code, Activity, Cpu } from 'lucide-react';
import Interactive3DCanvas from '../components/Interactive3DCanvas.jsx';

export default function Home() {
  const [terminalLine, setTerminalLine] = useState(0);
  const [compilingState, setCompilingState] = useState('idle');

  // Simple animation for the mock editor console
  useEffect(() => {
    const codeLinesInterval = setInterval(() => {
      setTerminalLine((prev) => (prev < 5 ? prev + 1 : 0));
    }, 2000);

    const compilingInterval = setInterval(() => {
      setCompilingState('compiling');
      setTimeout(() => {
        setCompilingState('success');
        setTimeout(() => {
          setCompilingState('idle');
        }, 1500);
      }, 1500);
    }, 6000);

    return () => {
      clearInterval(codeLinesInterval);
      clearInterval(compilingInterval);
    };
  }, []);

  const codeSnippets = [
    '#include <iostream>',
    'int main() {',
    '    std::cout << "Compiling Arena Workspace..." << std::endl;',
    '    int score = evaluate_submission(user_code);',
    '    if (score == 100) return STATUS_SUCCESS;',
    '    return STATUS_COMPILE_ERROR;',
    '}'
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic 3D Canvas Background */}
      <Interactive3DCanvas />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full nm-inset-sm text-xs font-extrabold uppercase text-brand-600 dark:text-brand-500 tracking-wider mb-6 animate-pulse">
          <Activity className="h-3.5 w-3.5" />
          <span>Next-Gen Competitive Playground</span>
        </div>

        <h1 className="font-outfit font-extrabold text-5xl sm:text-7xl tracking-tight text-slate-900 dark:text-white leading-tight">
          Forge Your Skills in <br />
          <span className="bg-gradient-to-r from-brand-600 to-purple-500 bg-clip-text text-transparent">
            The CodeArena
          </span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 font-medium">
          The ultimate full-stack competitive arena. Write algorithms in our live Monaco IDE, solve secure quiz assessments, schedule custom contests, and get certified.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/register"
            className="nm-btn-primary font-bold px-8 py-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Get Started Free
          </Link>
          <Link
            to="/about"
            className="nm-btn font-bold px-8 py-3.5 rounded-2xl flex items-center justify-center text-slate-800 dark:text-slate-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Live Telemetry Console Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20 relative z-10">
        <div className="nm-card rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/30 dark:border-slate-800/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 block"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold ml-2 font-mono">workspace_monaco.cpp</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <Cpu className="h-3 w-3" /> compiler_v3.2
              </span>
              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                compilingState === 'idle' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' :
                compilingState === 'compiling' ? 'bg-yellow-500/20 text-yellow-500 animate-pulse' :
                'bg-green-500/20 text-green-500'
              }`}>
                {compilingState}
              </span>
            </div>
          </div>

          {/* Console Content */}
          <div className="p-6 font-mono text-sm leading-relaxed bg-white/60 dark:bg-darkbg-card/60 backdrop-blur-md min-h-[220px]">
            {codeSnippets.map((line, idx) => (
              <div key={idx} className={`flex items-start transition-opacity duration-300 ${
                idx <= terminalLine ? 'opacity-100' : 'opacity-20'
              }`}>
                <span className="w-8 text-slate-400 select-none text-right pr-4">{idx + 1}</span>
                <span className={idx === terminalLine ? 'text-brand-500 font-semibold' : 'text-slate-600 dark:text-slate-300'}>
                  {line}
                </span>
              </div>
            ))}

            {/* Simulated Live Output log */}
            <div className="mt-6 pt-4 border-t border-slate-200/30 dark:border-slate-800/30 text-xs">
              <span className="text-slate-400">&gt;_ compiler output: </span>
              {compilingState === 'idle' && <span className="text-slate-500">Awaiting user submission...</span>}
              {compilingState === 'compiling' && <span className="text-yellow-500 animate-pulse">Running testcases on sandbox container...</span>}
              {compilingState === 'success' && <span className="text-green-500 font-bold">ALL 12 TEST CASES PASSED SUCCESSFULLY. execution_time=4.2ms.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-white/40 dark:bg-darkbg-card/40 backdrop-blur-sm py-20 border-t border-slate-200/30 dark:border-slate-800/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-outfit font-bold text-4xl text-slate-900 dark:text-white tracking-tight">
              Fully Packed Ecosystem
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">
              We provide state-of-the-art diagnostic resources to host secure, robust, and interactive competitions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: <Terminal className="h-6 w-6 text-brand-600 dark:text-brand-500" />,
                title: 'Monaco Code Editor',
                desc: 'Write answers inside standard VS Code Monaco editor with autocomplete, multi-language highlight, and instant online compilations.'
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-brand-600 dark:text-brand-500" />,
                title: 'AI Anti-Cheating Monitor',
                desc: 'Stay safe with browser lock configurations, visibility tab switch logging, and webcam facial tracking alarms.'
              },
              {
                icon: <Trophy className="h-6 w-6 text-brand-600 dark:text-brand-500" />,
                title: 'WebSocket Leaderboards',
                desc: 'Join coding tournaments with live leaderboards, synchronous countdown timers, and penalty rankings.'
              },
              {
                icon: <Award className="h-6 w-6 text-brand-600 dark:text-brand-500" />,
                title: 'PDF Scorecards',
                desc: 'Evaluate accuracy and speed. Download custom vector-generated PDF certificates instantly upon completion.'
              },
              {
                icon: <HelpCircle className="h-6 w-6 text-brand-600 dark:text-brand-500" />,
                title: 'Multiple Question Types',
                desc: 'Support MCQ, Multiple Correct, True/False, and Fill-in-the-Blank templates for flexible exam creation.'
              },
              {
                icon: <Users className="h-6 w-6 text-brand-600 dark:text-brand-500" />,
                title: 'Unified Dashboard Reporting',
                desc: 'Analyze strengths and weaknesses with interactive Recharts reports for student diagnostics, teachers, and admins.'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="nm-card p-8 rounded-2xl flex flex-col items-start hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className="nm-inset-sm p-3.5 rounded-xl mb-6 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-outfit font-semibold text-xl text-slate-900 dark:text-white tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
