import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return <footer className="site-footer mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
      <div><span className="font-semibold tracking-[-.03em]">codearena<span className="site-footer-accent">.</span></span><span className="site-footer-muted text-xs ml-4">© {new Date().getFullYear()}</span></div>
      <div className="flex flex-wrap gap-5 text-xs site-footer-muted"><Link to="/challenges" className="site-footer-link">Practice</Link><Link to="/contests" className="site-footer-link">Contests</Link><Link to="/about" className="site-footer-link">About CodeArena</Link></div>
      <div className="flex gap-2"><a aria-label="GitHub" href="https://github.com/bhadrechadharmesh" className="site-footer-link p-2"><Github size={17}/></a><a aria-label="LinkedIn" href="https://www.linkedin.com/in/dharmesh-bhadrecha-45396b308/" className="site-footer-link p-2"><Linkedin size={17}/></a></div>
    </div>
  </footer>;
}
