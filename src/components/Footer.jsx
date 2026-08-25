import React from 'react';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return <footer className="mt-auto text-[#d9ded9]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
      <div><span className="font-semibold tracking-[-.03em]">codearena<span className="text-[#b9f227]">.</span></span><span className="text-[#808881] text-xs ml-4">© {new Date().getFullYear()}</span></div>
      <p className="text-xs text-[#909890]">Practice with purpose. Compete on merit.</p>
      <div className="flex gap-2"><a aria-label="GitHub" href="https://github.com/bhadrechadharmesh" className="p-2 text-[#9ba39c] hover:text-[#b9f227]"><Github size={17}/></a><a aria-label="LinkedIn" href="https://www.linkedin.com/in/dharmesh-bhadrecha-45396b308/" className="p-2 text-[#9ba39c] hover:text-[#b9f227]"><Linkedin size={17}/></a></div>
    </div>
  </footer>;
}
