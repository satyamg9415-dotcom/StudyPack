import React from 'react';
import { BookOpen, Sparkles, Activity } from 'lucide-react';

export default function Navbar({ backendStatus }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                StudyPack AI
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 mr-1" /> Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Transform Lecture Notes into Structured Study Packs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Backend API:</span>
            {backendStatus === 'connected' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected (Port 8000)
              </span>
            ) : backendStatus === 'connecting' ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Activity className="w-3 h-3 mr-1 animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2 h-2 mr-1.5 rounded-full bg-rose-500"></span>
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
