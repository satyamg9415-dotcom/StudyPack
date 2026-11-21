import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  FileText,
  Calendar,
  Trash2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Download,
  CheckCircle,
  FileDown,
} from 'lucide-react';
import Modal from '../common/Modal';
import { useStudyPack } from '../../context/StudyPackContext';
import { exportStudyPackPdf } from '../../api/client';

export default function StudyPackList() {
  const { studyPacks, deleteStudyPack } = useStudyPack();
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [deletePackTarget, setDeletePackTarget] = useState(null);

  // Extract subjects
  const subjects = ['All', ...new Set(studyPacks.map((p) => p.subject))];

  const filtered = studyPacks.filter((pack) => {
    const matchesSearch =
      pack.title.toLowerCase().includes(search.toLowerCase()) ||
      pack.fileName.toLowerCase().includes(search.toLowerCase()) ||
      pack.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || pack.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDeleteConfirm = () => {
    if (deletePackTarget) {
      deleteStudyPack(deletePackTarget.id);
      setDeletePackTarget(null);
    }
  };

  const handleDownloadMarkdown = (studyPack) => {
    let md = `# ${studyPack.title}\n`;
    md += `**Subject:** ${studyPack.subject} | **Source:** ${studyPack.fileName}\n\n`;
    md += `## Overview\n${studyPack.overview}\n\n`;
    md += `## Chapter Summaries\n`;
    studyPack.chapters?.forEach((chap) => {
      md += `### ${chap.chapter_title}\n`;
      chap.summary_points?.forEach((pt) => {
        md += `- ${pt}\n`;
      });
      md += `\n> **Key Takeaway:** ${chap.takeaway}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studyPack.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyPack.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async (studyPack) => {
    try {
      await exportStudyPackPdf(studyPack);
    } catch (e) {
      console.error('Failed to export PDF', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search study packs by title, file, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scroller">
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === subj
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Study Packs Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Study Packs Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Try adjusting your search criteria or create a new study pack.
          </p>
          <NavLink
            to="/upload"
            className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Study Pack</span>
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 truncate max-w-[180px]">
                    {pack.subject}
                  </span>
                  <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                    {pack.fileType || 'Doc'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {pack.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {pack.overview}
                </p>

                {/* Metadata Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pack.wordCount?.toLocaleString()} words</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(pack.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quiz score badge if attempted */}
                {pack.lastQuizScore && (
                  <div className="mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Score: {pack.lastQuizScore.percentage}%
                    </span>
                    <span className="text-[11px] text-emerald-600">
                      {pack.lastQuizScore.score}/{pack.lastQuizScore.total} Qs
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <NavLink
                    to={`/study-pack?selected=${pack.id}`}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="View Study Pack"
                  >
                    <BookOpen className="w-4 h-4" />
                  </NavLink>

                  <NavLink
                    to={`/quiz?packId=${pack.id}`}
                    className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Take Practice Quiz"
                  >
                    <GraduationCap className="w-4 h-4" />
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(pack)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Download PDF Study Pack"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadMarkdown(pack)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Export Markdown"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDeletePackTarget(pack)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete Study Pack"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!deletePackTarget}
        onClose={() => setDeletePackTarget(null)}
        title="Delete Study Pack?"
        message={`Are you sure you want to delete "${deletePackTarget?.title}"? All summaries, flashcards, and quiz records associated with this pack will be removed.`}
        confirmText="Delete Pack"
        cancelText="Keep Pack"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
