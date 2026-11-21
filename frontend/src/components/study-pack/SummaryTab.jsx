import React from 'react';
import { Layers, Lightbulb, CheckCircle2, BookmarkCheck, HelpCircle, Sparkles } from 'lucide-react';

export default function SummaryTab({
  chapters,
  importantExplanations,
  keyTakeaways,
  onOpenSummarizer,
}) {
  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100 shadow-2xs">
          <Layers className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-800">No Chapter Summaries Generated Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Use the Gemini Lecture Notes Summarizer to generate chapter-wise breakdowns, simplified explanations, and key takeaways.
          </p>
        </div>
        {onOpenSummarizer && (
          <button
            type="button"
            onClick={onOpenSummarizer}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Summary with Gemini</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Subheader / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-xs border border-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {chapters.length} Chapter {chapters.length === 1 ? 'Module' : 'Modules'} Generated
            </h3>
            <p className="text-[11px] text-slate-500">
              Structured output via Google Gemini SDK (prompt <code>P01_summarizer</code>)
            </p>
          </div>
        </div>

        {onOpenSummarizer && (
          <button
            type="button"
            onClick={onOpenSummarizer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-Summarize / Options</span>
          </button>
        )}
      </div>

      {/* Chapter Breakdown */}
      {chapters.map((chap, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs hover:shadow-sm transition-all"
        >
          {/* Chapter Title */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm flex items-center justify-center border border-indigo-100">
              {idx + 1}
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {chap.chapter_title}
            </h3>
          </div>

          {/* Key Bullet Points */}
          <div className="space-y-2.5 my-4">
            {chap.summary_points?.map((pt, pIdx) => (
              <div key={pIdx} className="flex items-start space-x-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{pt}</span>
              </div>
            ))}
          </div>

          {/* Key Takeaway Callout */}
          {chap.takeaway && (
            <div className="mt-5 p-4 rounded-xl bg-purple-50/70 border border-purple-100/80 flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
                  Core Concept Takeaway
                </span>
                <p className="text-xs sm:text-sm text-purple-950 font-medium mt-0.5 leading-relaxed">
                  {chap.takeaway}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Important Explanations Section (if returned by Gemini) */}
      {importantExplanations && importantExplanations.length > 0 && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-6 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-indigo-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Important Concept Explanations
              </h3>
              <p className="text-xs text-slate-500">
                Complex topics, formulas, and methodologies explained in simple language
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {importantExplanations.map((exp, eIdx) => (
              <div
                key={eIdx}
                className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-xs sm:text-sm text-slate-800 leading-relaxed flex items-start space-x-3"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {eIdx + 1}
                </span>
                <span>{exp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaways Summary (if returned by Gemini) */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/70 rounded-2xl border border-purple-200/80 p-6 sm:p-7 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-purple-200/60">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-purple-950">
                Overall Lecture Key Takeaways
              </h3>
              <p className="text-xs text-purple-700">
                Essential takeaways and conclusions to master for examination
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {keyTakeaways.map((tk, tIdx) => (
              <div key={tIdx} className="flex items-start space-x-3 text-xs sm:text-sm text-purple-950">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{tk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
