import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-darkbg-card border-t border-slate-200/30 dark:border-slate-800/30 transition-colors duration-200 mt-auto shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <span className="font-outfit font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-650 to-indigo-550 bg-clip-text text-transparent">
              CODEARENA
            </span>
            <span className="text-slate-400 text-sm">|</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          {/* Made with love */}
          <div className="flex items-center space-x-1 my-4 md:my-0 text-slate-500 dark:text-slate-400 text-sm">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for developers everywhere.</span>
          </div>

          {/* Socials */}
          <div className="flex space-x-4">
            <a href="#" className="text-slate-500 dark:text-slate-400 p-2 nm-btn rounded-full flex items-center justify-center">
              <Github className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-500 dark:text-slate-400 p-2 nm-btn rounded-full flex items-center justify-center">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-slate-500 dark:text-slate-400 p-2 nm-btn rounded-full flex items-center justify-center">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
