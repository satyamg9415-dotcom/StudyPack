import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  GraduationCap,
  Settings,
  Sparkles,
  BookOpen,
  X,
  Server,
} from 'lucide-react';
import { useStudyPack } from '../../context/StudyPackContext';

export default function Sidebar({ isOpen, onClose }) {
  const { studyPacks, backendStatus } = useStudyPack();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Create Study Pack', icon: PlusCircle, highlight: true },
    {
      to: '/study-packs',
      label: 'My Study Packs',
      icon: FolderKanban,
      badge: studyPacks.length,
    },
    { to: '/quiz', label: 'Quiz Practice', icon: GraduationCap },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <NavLink to="/" onClick={onClose} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  StudyPack AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Academic SaaS
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100/60 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${item.highlight && !isActive ? 'hover:bg-indigo-50/50' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 bg-slate-100/70 group-hover:text-indigo-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.highlight && item.badge === undefined && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer: System Status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 m-3 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">FastAPI Backend</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      backendStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : backendStatus === 'connecting'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-[11px] text-slate-500">
                    {backendStatus === 'connected'
                      ? 'API Online'
                      : backendStatus === 'connecting'
                      ? 'Connecting...'
                      : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
