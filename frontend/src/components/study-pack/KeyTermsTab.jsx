import React, { useState, useId } from 'react';
import {
  Bookmark,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  SlidersHorizontal,
  GraduationCap,
  Quote,
  Loader2,
  Tag,
  AlertCircle,
} from 'lucide-react';

export default function KeyTermsTab({
  keywords = [],
  onExtractTerms,
  isExtractingTerms = false,
  activePackTitle,
}) {
  const [search, setSearch] = useState('');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [copiedTerm, setCopiedTerm] = useState(null);

  // Initialize with the first 2 terms expanded for immediate discoverability
  const [expandedTerms, setExpandedTerms] = useState(() => {
    const initial = new Set();
    if (keywords && keywords.length > 0) {
      initial.add(keywords[0].term);
      if (keywords[1]) initial.add(keywords[1].term);
    }
    return initial;
  });

  const toggleTerm = (term) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  // Filter terms by search text and importance level
  const filtered = (keywords || []).filter((kw) => {
    const termMatches =
      kw.term.toLowerCase().includes(search.toLowerCase()) ||
      kw.definition.toLowerCase().includes(search.toLowerCase()) ||
      (kw.topic && kw.topic.toLowerCase().includes(search.toLowerCase()));

    if (!termMatches) return false;

    if (selectedImportance === 'all') return true;
    const importance = kw.importance || 'Medium';
    return importance.toLowerCase() === selectedImportance.toLowerCase();
  });

  // Calculate counts for importance filter pills
  const counts = {
    all: keywords?.length || 0,
    high: (keywords || []).filter((k) => (k.importance || '').toLowerCase() === 'high').length,
    medium: (keywords || []).filter((k) => (k.importance || 'medium').toLowerCase() === 'medium').length,
    low: (keywords || []).filter((k) => (k.importance || '').toLowerCase() === 'low').length,
  };

  // Expand / Collapse all logic per Modern Web Guidance (accordion)
  const allFilteredExpanded =
    filtered.length > 0 && filtered.every((k) => expandedTerms.has(k.term));

  const handleToggleAll = () => {
    if (allFilteredExpanded) {
      setExpandedTerms(new Set());
    } else {
      const allVisible = new Set(filtered.map((k) => k.term));
      setExpandedTerms(allVisible);
    }
  };

  const handleCopy = (e, term, def) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${term}: ${def}`);
    setCopiedTerm(term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  const getImportanceBadge = (importance) => {
    const level = (importance || 'medium').toLowerCase();
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium Priority
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Low Priority
          </span>
        );
      default:
        return null;
    }
  };

  // Empty state if no keywords have been extracted yet
  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-2xs">
          <Bookmark className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-800">
            No Key Terms Extracted Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Extract technical terminology, exam-critical definitions, conceptual topics, and importance levels from your lecture notes using Google Gemini.
          </p>
        </div>
        {onExtractTerms && (
          <button
            type="button"
            onClick={onExtractTerms}
            disabled={isExtractingTerms}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExtractingTerms ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Key Terms with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Key Terms with Gemini (P02)</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search key terms, definitions, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Action Buttons: Expand All & AI Re-Extract */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleToggleAll}
              aria-expanded={allFilteredExpanded}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {allFilteredExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  <span>Expand All</span>
                </>
              )}
            </button>

            {onExtractTerms && (
              <button
                type="button"
                onClick={onExtractTerms}
                disabled={isExtractingTerms}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isExtractingTerms ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Re-Extract Terms</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Importance Filter Pills */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scroller py-0.5">
            <button
              type="button"
              onClick={() => setSelectedImportance('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedImportance === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Terms ({counts.all})
            </button>

            {counts.high > 0 && (
              <button
                type="button"
                onClick={() => setSelectedImportance('high')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedImportance === 'high'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                High Priority ({counts.high})
              </button>
            )}

            {counts.medium > 0 && (
              <button
                type="button"
                onClick={() => setSelectedImportance('medium')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedImportance === 'medium'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Medium Priority ({counts.medium})
              </button>
            )}

            {counts.low > 0 && (
              <button
                type="button"
                onClick={() => setSelectedImportance('low')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedImportance === 'low'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Low Priority ({counts.low})
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {keywords.length} terms
          </span>
        </div>
      </div>

      {/* Grid of Expandable Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-bold text-sm">No matching terms found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or switching the priority filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((kw, idx) => {
            const isExpanded = expandedTerms.has(kw.term);
            const topic = kw.topic || 'Core Concept';

            return (
              <div
                key={`${kw.term}-${idx}`}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-sm overflow-hidden flex flex-col justify-between ${
                  isExpanded
                    ? 'border-indigo-300/80 ring-2 ring-indigo-500/10'
                    : 'border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                {/* Clickable Card Header */}
                <div
                  onClick={() => toggleTerm(kw.term)}
                  className="p-5 cursor-pointer select-none space-y-3"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTerm(kw.term);
                    }
                  }}
                >
                  {/* Top Bar: Topic & Importance Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/70">
                      <Tag className="w-3 h-3 text-indigo-500" />
                      {topic}
                    </span>

                    <div className="flex items-center gap-2">
                      {getImportanceBadge(kw.importance)}
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 transition-transform">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Term Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {kw.term}
                    </h4>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, kw.term, kw.definition)}
                      title="Copy definition"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
                    >
                      {copiedTerm === kw.term ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Definition */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {kw.definition}
                  </p>
                </div>

                {/* Expandable Section (Revealed on click) */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 space-y-3 border-t border-slate-100 bg-slate-50/40">
                    {/* Lecture Context & Significance */}
                    {kw.context && (
                      <div className="mt-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs flex items-start gap-2.5">
                        <Quote className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                            Lecture Context & Application
                          </span>
                          <p className="text-xs text-purple-950 mt-0.5 leading-relaxed italic">
                            "{kw.context}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer Meta & Quick Copy Action */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                        <GraduationCap className="w-3 h-3 text-indigo-400" />
                        Topic: <strong className="text-slate-700">{topic}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, kw.term, kw.definition)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        {copiedTerm === kw.term ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied to clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy definition</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
