import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <span className="font-outfit font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
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
            <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
