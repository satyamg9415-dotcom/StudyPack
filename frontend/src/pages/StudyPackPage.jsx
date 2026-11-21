import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import StudyPackDashboard from '../components/study-pack/StudyPackDashboard';
import { useStudyPack } from '../context/StudyPackContext';
import {
  BookOpen,
  PlusCircle,
  Sparkles,
  Sliders,
  GraduationCap,
  FileText,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Download,
  FileDown,
} from 'lucide-react';
import { generateSummary, generateKeyTerms, generateQuestions, exportStudyPackPdf } from '../api/client';

export default function StudyPackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { studyPacks, activePackId, setActivePackId, activePack, updateStudyPack } = useStudyPack();

  const selectedParam = searchParams.get('selected');
  const dialogRef = useRef(null);

  // Summarizer dialog state
  const [subject, setSubject] = useState('');
  const [academicLevel, setAcademicLevel] = useState('College / Undergraduate');
  const [summaryLength, setSummaryLength] = useState('standard');
  const [lectureText, setLectureText] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExtractingTerms, setIsExtractingTerms] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  useEffect(() => {
    if (selectedParam) {
      setActivePackId(selectedParam);
    }
  }, [selectedParam, setActivePackId]);

  // Keep dialog fields aligned with the currently active study pack
  useEffect(() => {
    if (activePack) {
      setSubject(activePack.subject || 'General Lecture');
      setAcademicLevel(activePack.academic_level || 'College / Undergraduate');
      setSummaryLength(activePack.summary_length || 'standard');
      // If active pack has lecture_text, use it; otherwise use overview as placeholder
      setLectureText(activePack.lecture_text || activePack.overview || '');
    }
  }, [activePack]);

  const handleSelectPack = (id) => {
    setActivePackId(id);
    setSearchParams({ selected: id });
  };

  const openSummarizerModal = () => {
    setError(null);
    if (activePack) {
      setSubject(activePack.subject || 'General Lecture');
      setAcademicLevel(activePack.academic_level || 'College / Undergraduate');
      setSummaryLength(activePack.summary_length || 'standard');
      setLectureText(activePack.lecture_text || activePack.overview || '');
    }
    dialogRef.current?.showModal();
  };

  const closeSummarizerModal = () => {
    if (!isSummarizing) {
      dialogRef.current?.close();
    }
  };

  // Light dismiss on backdrop click
  const handleDialogClick = (e) => {
    if (dialogRef.current && e.target === dialogRef.current) {
      closeSummarizerModal();
    }
  };

  const handleRunSummarizer = async (e) => {
    e.preventDefault();
    if (!lectureText.trim() || lectureText.trim().length < 10) {
      setError('Lecture notes must contain at least 10 characters.');
      return;
    }

    if (!activePack) {
      setError('No active study pack selected.');
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      const summaryResult = await generateSummary({
        lecture_text: lectureText.trim(),
        subject: subject.trim() || 'General Lecture',
        academic_level: academicLevel,
        summary_length: summaryLength,
      });

      // Update study pack with new AI summary
      updateStudyPack(activePack.id, {
        title: summaryResult.lecture_title || activePack.title,
        subject: subject.trim() || activePack.subject,
        academic_level: academicLevel,
        summary_length: summaryLength,
        lecture_text: lectureText.trim(),
        overview: summaryResult.overview,
        chapters: summaryResult.chapters,
        important_explanations: summaryResult.important_explanations,
        key_takeaways: summaryResult.key_takeaways,
      });

      dialogRef.current?.close();
      setSuccessToast(`Summary refreshed with Gemini for "${summaryResult.lecture_title || activePack.title}"`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate summary with Gemini. Please check backend connection and API key.';
      setError(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExtractKeyTerms = async () => {
    if (!activePack) return;

    const textToAnalyze = activePack.lecture_text || activePack.overview || '';
    if (!textToAnalyze.trim() || textToAnalyze.trim().length < 10) {
      setSuccessToast('No lecture content available in this study pack to extract terms.');
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    setIsExtractingTerms(true);
    try {
      const result = await generateKeyTerms({
        lecture_text: textToAnalyze.trim(),
        subject: activePack.subject || 'General Lecture',
        term_limit: 15,
      });

      updateStudyPack(activePack.id, {
        keywords: result.terms,
      });

      setSuccessToast(`Extracted ${result.terms.length} key terms with Gemini!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to extract key terms with Gemini. Please check backend connection.';
      setSuccessToast(`Error extracting terms: ${msg}`);
      setTimeout(() => setSuccessToast(null), 5000);
    } finally {
      setIsExtractingTerms(false);
    }
  };

  const handleGenerateQuestions = async (options = {}) => {
    if (!activePack) return;

    const textToAnalyze = activePack.lecture_text || activePack.overview || '';
    if (!textToAnalyze.trim() || textToAnalyze.trim().length < 10) {
      setSuccessToast('No lecture notes available to generate practice questions.');
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const result = await generateQuestions({
        lecture_text: textToAnalyze.trim(),
        subject: activePack.subject || 'General Lecture',
        question_count: options.question_count || 6,
        difficulty_distribution: options.difficulty_distribution || 'Balanced (Easy, Medium, Hard)',
      });

      updateStudyPack(activePack.id, {
        practice_questions: result.questions,
      });

      setSuccessToast(`Generated ${result.questions.length} practice questions with Gemini!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate practice questions with Gemini.';
      setSuccessToast(`Error generating questions: ${msg}`);
      setTimeout(() => setSuccessToast(null), 5000);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!activePack) return;
    setIsDownloadingPdf(true);
    try {
      await exportStudyPackPdf(activePack);
      setSuccessToast(`Downloaded "${activePack.title}" as PDF!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate PDF. Ensure FastAPI backend is running.';
      setSuccessToast(`PDF Export Error: ${msg}`);
      setTimeout(() => setSuccessToast(null), 5000);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Selector Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Study Pack Viewer
            </h1>
            <p className="text-xs text-slate-500">
              Select an active study pack or synthesize fresh notes with Gemini
            </p>
          </div>
        </div>

        {/* Pack Selector & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={activePackId || ''}
            onChange={(e) => handleSelectPack(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 max-w-xs"
          >
            {studyPacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title} ({pack.subject})
              </option>
            ))}
          </select>

          {/* Download Study Pack PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !activePack}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Download complete Study Pack as publication-grade PDF"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download Study Pack (PDF)</span>
                <span className="sm:hidden">PDF</span>
              </>
            )}
          </button>

          {/* Re-Summarize / AI Options Button */}
          <button
            type="button"
            onClick={openSummarizerModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer"
            title="Re-run Gemini Summarizer with custom length or notes"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Re-Summarize with Gemini</span>
            <span className="sm:hidden">AI Summary</span>
          </button>

          <NavLink
            to="/upload"
            className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-200"
            title="Create New Study Pack from Document"
          >
            <PlusCircle className="w-5 h-5" />
          </NavLink>
        </div>
      </div>

      {/* Main Tabbed Study Pack Dashboard */}
      <StudyPackDashboard
        studyPack={activePack}
        onOpenSummarizer={openSummarizerModal}
        onExtractTerms={handleExtractKeyTerms}
        isExtractingTerms={isExtractingTerms}
        onGenerateQuestions={handleGenerateQuestions}
        isGeneratingQuestions={isGeneratingQuestions}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* Native Modal Dialog for Gemini Summarizer (Modern Web Guidance: dialog) */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        aria-labelledby="summarizer-dialog-title"
        className="rounded-3xl p-0 backdrop:bg-slate-900/40 backdrop:backdrop-blur-xs max-w-2xl w-full mx-auto shadow-2xl border border-slate-200/90 text-slate-800 modal-overscroll"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 id="summarizer-dialog-title" className="text-lg font-bold text-slate-900">
                  Gemini Lecture Notes Summarizer
                </h2>
                <p className="text-xs text-slate-500">
                  Configure prompt parameters to re-generate structured chapters, explanations, and takeaways
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSummarizerModal}
              disabled={isSummarizing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleRunSummarizer} className="space-y-4">
            {/* Options Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Biology, CS, History"
                  disabled={isSummarizing}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Academic Level
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  disabled={isSummarizing}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="High School">High School</option>
                  <option value="College / Undergraduate">College / Undergraduate</option>
                  <option value="Graduate / Advanced">Graduate / Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Summary Length
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {['concise', 'standard', 'in-depth'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSummaryLength(len)}
                      disabled={isSummarizing}
                      className={`text-[11px] font-bold py-1.5 rounded-lg capitalize transition-all ${
                        summaryLength === len
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lecture Notes Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Lecture Notes / Extracted Text
                </span>
                <span className="text-[11px] font-normal text-slate-400">
                  {lectureText.length} characters
                </span>
              </label>
              <textarea
                rows={7}
                value={lectureText}
                onChange={(e) => setLectureText(e.target.value)}
                placeholder="Paste or edit lecture notes to analyze with Google Gemini..."
                disabled={isSummarizing}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-y"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Progress Message */}
            {isSummarizing && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 text-purple-700 animate-spin flex-shrink-0" />
                <span>
                  Synthesizing with Google Gemini via <strong>POST /api/generate-summary</strong>... This typically takes 3-6 seconds.
                </span>
              </div>
            )}

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeSummarizerModal}
                disabled={isSummarizing}
                autoFocus
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSummarizing || !lectureText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-purple-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Summary with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
