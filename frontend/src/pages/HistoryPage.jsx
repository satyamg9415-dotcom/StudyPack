import React from 'react';
import { NavLink } from 'react-router-dom';
import StudyPackList from '../components/history/StudyPackList';
import { FolderKanban, Plus } from 'lucide-react';
import { useStudyPack } from '../context/StudyPackContext';

export default function HistoryPage() {
  const { stats } = useStudyPack();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 flex-shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              My Study Packs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage and review your {stats.totalPacks} generated lecture study packs
            </p>
          </div>
        </div>

        <NavLink
          to="/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Pack</span>
        </NavLink>
      </div>

      {/* Main List */}
      <StudyPackList />
    </div>
  );
}
