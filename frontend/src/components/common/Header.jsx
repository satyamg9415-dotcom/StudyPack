import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { useStudyPack } from '../../context/StudyPackContext';

export default function Header({ onMenuClick }) {
  const { backendStatus, refreshHealth, stats } = useStudyPack();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-20 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Google Gemini 1.5
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              {stats.totalPacks} Active Study Packs
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Backend Status & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Backend Status Pill */}
        <button
          onClick={refreshHealth}
          title="Click to re-check FastAPI backend health"
          className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            backendStatus === 'connected'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : backendStatus === 'connecting'
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : backendStatus === 'connecting'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span>
            {backendStatus === 'connected'
              ? 'Backend API Ready'
              : backendStatus === 'connecting'
              ? 'Checking API...'
              : 'API Offline'}
          </span>
          <RefreshCw className="w-3 h-3 text-slate-400 hover:text-slate-600" />
        </button>

        {/* Quick Create CTA */}
        <NavLink
          to="/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Pack</span>
        </NavLink>

        {/* User Profile Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            SC
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Scholar Alex</p>
            <p className="text-[11px] text-slate-400 leading-tight">College Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}
