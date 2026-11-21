import React, { useState } from 'react';
import { FileText, Hash, BookOpen, Download, Sparkles, CheckCircle2, Bookmark, Loader2, FileDown } from 'lucide-react';
import { exportStudyPackPdf } from '../../api/client';

export default function OverviewTab({ studyPack, onOpenSummarizer, onDownloadPdf, isDownloadingPdf: externalDownloading }) {
  const [internalDownloading, setInternalDownloading] = useState(false);
  const isDownloadingPdf = externalDownloading || internalDownloading;

  if (!studyPack) return null;

  const fileName = studyPack.fileName || studyPack.document_name || 'Uploaded Notes';
  const createdDate = studyPack.createdAt || studyPack.date || new Date().toISOString();

  const handleDownloadPdf = async () => {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }
    setInternalDownloading(true);
    try {
      await exportStudyPackPdf(studyPack);
    } catch (e) {
      console.error('Failed to download PDF', e);
    } finally {
      setInternalDownloading(false);
    }
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${studyPack.title}\n`;
    md += `**Subject:** ${studyPack.subject} | **Source:** ${fileName}\n\n`;
    md += `## Overview\n${studyPack.overview}\n\n`;

    if (studyPack.chapters?.length) {
      md += `## Chapter Summaries\n`;
      studyPack.chapters.forEach((chap, idx) => {
        md += `### ${idx + 1}. ${chap.chapter_title}\n`;
        chap.summary_points?.forEach((pt) => {
          md += `- ${pt}\n`;
        });
        if (chap.takeaway) {
          md += `\n> **Key Takeaway:** ${chap.takeaway}\n\n`;
        }
      });
    }

    if (studyPack.important_explanations?.length) {
      md += `## Important Concept Explanations\n`;
      studyPack.important_explanations.forEach((exp, idx) => {
        md += `${idx + 1}. ${exp}\n`;
      });
      md += `\n`;
    }

    if (studyPack.key_takeaways?.length) {
      md += `## Key Takeaways\n`;
      studyPack.key_takeaways.forEach((kt) => {
        md += `- ${kt}\n`;
      });
      md += `\n`;
    }

    if (studyPack.keywords?.length) {
      md += `## Key Terms & Definitions\n`;
      studyPack.keywords.forEach((kw) => {
        md += `- **${kw.term}**: ${kw.definition} *(Context: ${kw.context})*\n`;
      });
      md += `\n`;
    }

    if (studyPack.practice_questions?.length) {
      md += `## Practice Questions\n`;
      studyPack.practice_questions.forEach((q, idx) => {
        md += `**Q${idx + 1}: ${q.question}**\n- **Answer:** ${q.answer}\n- **Explanation:** ${q.explanation}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studyPack.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_StudyPack.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero Overview Card */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white p-6 sm:p-8 rounded-2xl border border-indigo-100/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-indigo-100/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                {studyPack.subject}
              </span>
              <span className="text-xs font-medium text-slate-400">
                Created {new Date(createdDate).toLocaleDateString()}
              </span>
              {studyPack.summary_length && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 capitalize">
                  {studyPack.summary_length} mode
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {studyPack.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {onOpenSummarizer && (
              <button
                type="button"
                onClick={onOpenSummarizer}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Re-Summarize</span>
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Download publication-grade Study Pack PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Study Pack (PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
              title="Export as Markdown notes"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export (.MD)</span>
            </button>
          </div>
        </div>

        <p className="mt-4 text-slate-700 leading-relaxed text-sm sm:text-base">
          {studyPack.overview}
        </p>

        {/* Source File Meta Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Source File
            </span>
            <p className="font-semibold text-slate-800 mt-1 truncate" title={fileName}>
              {fileName}
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Hash className="w-3.5 h-3.5 text-purple-500" /> Extracted Words
            </span>
            <p className="font-semibold text-slate-800 mt-1">
              {studyPack.wordCount ? studyPack.wordCount.toLocaleString() : (studyPack.chapters?.length ? '1,500+' : '0')} words
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Chapters
            </span>
            <p className="font-semibold text-slate-800 mt-1">
              {studyPack.chapters?.length || 0} Modules
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-slate-200/70">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Glossary
            </span>
            <p className="font-semibold text-slate-800 mt-1">
              {studyPack.keywords?.length || 0} Key Terms
            </p>
          </div>
        </div>
      </div>

      {/* Highlights & Modules Quick Peek */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Core Chapter Modules
          </h3>
          <ul className="space-y-3">
            {studyPack.chapters?.map((chap, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{chap.chapter_title}</p>
                  <p className="text-slate-500 mt-1">{chap.takeaway}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Study Readiness Check
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Detailed Summaries</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {studyPack.chapters?.length ? `${studyPack.chapters.length} Chapters` : 'Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Flashcard Definitions</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {studyPack.keywords?.length || 0} Terms
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Practice Q&A</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {studyPack.practice_questions?.length || 0} Questions
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Interactive Quiz</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                {studyPack.quiz?.length || 0} MCQs Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
