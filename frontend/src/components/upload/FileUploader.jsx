import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Zap,
  Sliders,
  GraduationCap,
  ArrowRight,
  Loader2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { uploadDocument, generateSummary, generateKeyTerms, generateQuestions, generateQuiz } from '../../api/client';
import { useStudyPack } from '../../context/StudyPackContext';

export default function FileUploader({ onExtractionSuccess }) {
  const navigate = useNavigate();
  const { addStudyPack } = useStudyPack();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [extractionResult, setExtractionResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedText, setExpandedText] = useState(false);

  // Gemini Summarizer Parameters
  const [subject, setSubject] = useState('');
  const [academicLevel, setAcademicLevel] = useState('College / Undergraduate');
  const [summaryLength, setSummaryLength] = useState('standard');
  const [questionCount, setQuestionCount] = useState(6);
  const [quizDifficulty, setQuizDifficulty] = useState('Medium');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generationStage, setGenerationStage] = useState('idle'); // 'summarizing' | 'terms' | 'questions' | 'quiz' | 'complete'
  const [summaryError, setSummaryError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    setExtractionResult(null);
    setProgress(0);
    if (!file) return;

    const allowedExtensions = ['pdf', 'pptx', 'txt'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file format (.${ext}). StudyPack AI supports PDF, PPTX, and TXT files.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB limit. Please upload a smaller document.');
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setError('Uploaded file is empty (0 bytes). Please upload a valid lecture file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleExtractText = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setError(null);
    setProgress(20);

    try {
      setProgress(45);
      // Call POST /api/upload endpoint
      const result = await uploadDocument(selectedFile);
      setProgress(100);
      setExtractionResult(result);

      if (!subject) {
        const cleanName = selectedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/^(lecture|notes|chapter|unit)[\s_-]*\d*[\s_-]*/i, '')
          .replace(/[_-]+/g, ' ')
          .trim();
        if (cleanName) {
          setSubject(cleanName);
        }
      }

      if (onExtractionSuccess) {
        onExtractionSuccess(result);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to extract text from document. Ensure FastAPI backend is running.';
      setError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyText = () => {
    if (!extractionResult?.extracted_text) return;
    navigator.clipboard.writeText(extractionResult.extracted_text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateStudyPack = async () => {
    if (!extractionResult?.extracted_text) return;

    setIsGeneratingSummary(true);
    setSummaryError(null);

    try {
      const [summarySettled, termsSettled, questionsSettled, quizSettled] = await Promise.allSettled([
        generateSummary({
          lecture_text: extractionResult.extracted_text,
          subject: subject.trim() || 'General Lecture',
          academic_level: academicLevel,
          summary_length: summaryLength,
        }),
        generateKeyTerms({
          lecture_text: extractionResult.extracted_text,
          subject: subject.trim() || 'General Lecture',
          term_limit: 15,
        }),
        generateQuestions({
          lecture_text: extractionResult.extracted_text,
          subject: subject.trim() || 'General Lecture',
          question_count: questionCount,
          difficulty_distribution: 'Balanced (Easy, Medium, Hard)',
        }),
        generateQuiz({
          lecture_text: extractionResult.extracted_text,
          subject: subject.trim() || 'General Lecture',
          number_of_questions: 5,
          difficulty: quizDifficulty,
        }),
      ]);

      if (summarySettled.status === 'rejected') {
        throw summarySettled.reason;
      }

      const summaryData = summarySettled.value;
      const extractedKeywords =
        termsSettled.status === 'fulfilled' && termsSettled.value?.terms
          ? termsSettled.value.terms
          : [];
      const extractedQuestions =
        questionsSettled.status === 'fulfilled' && questionsSettled.value?.questions
          ? questionsSettled.value.questions
          : [];
      const extractedQuiz =
        quizSettled.status === 'fulfilled' && quizSettled.value?.questions
          ? quizSettled.value.questions
          : [];

      const newPack = {
        id: `pack-${Date.now()}`,
        title: summaryData.lecture_title || extractionResult.filename.replace(/\.[^/.]+$/, ''),
        subject: subject.trim() || 'General Lecture',
        academic_level: academicLevel,
        summary_length: summaryLength,
        question_count: questionCount,
        currentDifficulty: quizDifficulty,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        fileName: extractionResult.filename,
        document_name: extractionResult.filename,
        fileType: extractionResult.file_type,
        fileSize: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : '1.5 MB',
        wordCount: extractionResult.word_count,
        characterCount: extractionResult.total_characters,
        lecture_text: extractionResult.extracted_text,
        overview: summaryData.overview,
        chapters: summaryData.chapters,
        important_explanations: summaryData.important_explanations,
        key_takeaways: summaryData.key_takeaways,
        keywords: extractedKeywords,
        practice_questions: extractedQuestions,
        quiz: extractedQuiz,
      };

      addStudyPack(newPack);
      navigate(`/study-pack?selected=${newPack.id}`);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate lecture summary with Gemini. Please check backend connection and API key.';
      setSummaryError(msg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Document Text Extraction
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Upload lecture slides or readings to extract structured text using PyMuPDF and python-pptx.
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
          ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
          : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
          }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & drop lecture notes here, or{' '}
              <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline font-bold">
                browse files
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.pptx,.txt"
                  onChange={handleChange}
                />
              </label>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports <strong>PDF (PyMuPDF)</strong>, <strong>PowerPoint (.pptx)</strong>, and <strong>UTF-8 Text (.txt)</strong> up to 25MB
            </p>
          </div>

          {/* Format Badges */}
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
              PDF (Pages & Blocks)
            </span>
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-200/60">
              PPTX (Slides & Tables)
            </span>
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
              TXT (UTF-8)
            </span>
          </div>

          {/* Selected File Card */}
          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-xs max-w-md w-full">
              <FileCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.name.split('.').pop().toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar (Visible during processing) */}
      {isExtracting && (
        <div className="space-y-2 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
              Uploading to /api/upload & extracting text boundaries...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-start gap-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200/80 p-3.5 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Extraction Error:</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Action Button: Extract Text */}
      {selectedFile && !extractionResult && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setError(null);
            }}
            disabled={isExtracting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleExtractText}
            disabled={isExtracting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span>{isExtracting ? 'Extracting Text...' : 'Upload & Extract Document'}</span>
          </button>
        </div>
      )}

      {/* Extraction Success & Results Preview */}
      {extractionResult && (
        <div className="mt-6 border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 space-y-6">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200/70">
            <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Document Text Extracted Successfully!</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                Status: {extractionResult.upload_status}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setExtractionResult(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-white transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block font-medium">Filename</span>
              <span className="font-bold text-slate-800 truncate block mt-0.5" title={extractionResult.filename}>
                {extractionResult.filename}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block font-medium">Format & Layout</span>
              <span className="font-bold text-slate-800 mt-0.5 block uppercase">
                {extractionResult.file_type}{' '}
                {extractionResult.page_count
                  ? `(${extractionResult.page_count} ${extractionResult.file_type === 'pptx' ? 'slides' : 'pages'
                  })`
                  : ''}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block font-medium">Total Characters</span>
              <span className="font-bold text-indigo-700 mt-0.5 block">
                {extractionResult.total_characters.toLocaleString()} chars
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs">
              <span className="text-slate-400 block font-medium">Word Count</span>
              <span className="font-bold text-purple-700 mt-0.5 block">
                {extractionResult.word_count.toLocaleString()} words
              </span>
            </div>
          </div>

          {/* Extracted Text Content Viewer */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Extracted Text (Preserved Boundaries & Paragraphs)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedText(!expandedText)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline px-1"
                >
                  {expandedText ? 'Collapse' : 'Expand All'}
                </button>
              </div>
            </div>

            <pre
              className={`text-xs bg-slate-50 text-slate-800 p-4 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto transition-all ${expandedText ? 'max-h-[500px]' : 'max-h-56'
                }`}
            >
              {extractionResult.extracted_text}
            </pre>
          </div>

          {/* Step 2: Gemini Lecture Notes Summarizer */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-white border border-purple-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Generate Structured Study Pack with Gemini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prompt-engineered academic tutor converts extracted lecture text into chapters, explanations, and takeaways.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                P01_summarizer
              </span>
            </div>

            {/* Prompt Tuning Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                  Subject / Course
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Biology, CS 101, Organic Chem"
                  disabled={isGeneratingSummary}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Academic Level
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  disabled={isGeneratingSummary}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="High School">High School</option>
                  <option value="College / Undergraduate">College / Undergraduate</option>
                  <option value="Graduate / Advanced">Graduate / Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Summary Length
                </label>
                <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {['concise', 'standard', 'in-depth'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSummaryLength(len)}
                      disabled={isGeneratingSummary}
                      className={`text-[11px] font-bold py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                        summaryLength === len
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Generation Preferences Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Practice Questions Count
                </label>
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      disabled={isGeneratingSummary}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        questionCount === num
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  Quiz Difficulty Tier
                </label>
                <div className="flex items-center gap-2">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setQuizDifficulty(diff)}
                      disabled={isGeneratingSummary}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        quizDifficulty === diff
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {summaryError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Gemini Synthesis Error</p>
                  <p className="mt-0.5 text-rose-700 leading-relaxed">{summaryError}</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateStudyPack}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded-lg text-rose-700 hover:bg-rose-100 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            {/* Generation Multi-Task Progress Indicator */}
            {isGeneratingSummary && (
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-100/70 border border-purple-200 space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span className="flex items-center gap-2 text-sm font-extrabold">
                    <Loader2 className="w-4 h-4 text-purple-700 animate-spin" />
                    Synthesizing Complete Study Pack with Google Gemini API...
                  </span>
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-md">
                    P01 · P02 · P03 · P04
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/80 border border-purple-200/70 flex items-center gap-2 text-purple-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>P01: Chapter Summaries & Overview</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-purple-200/70 flex items-center gap-2 text-purple-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>P02: Key Terms Glossary & Context</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-purple-200/70 flex items-center gap-2 text-purple-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>P03: Practice Questions & Model Answers</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 border border-purple-200/70 flex items-center gap-2 text-purple-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>P04/P05: Interactive Assessment Quiz</span>
                  </div>
                </div>

                <div className="w-full bg-purple-200/80 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 h-1.5 rounded-full animate-pulse w-full" />
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Pipes <strong>{extractionResult.word_count.toLocaleString()} words</strong> into prompt <code>P01_summarizer.txt</code>
              </span>

              <button
                type="button"
                onClick={handleGenerateStudyPack}
                disabled={isGeneratingSummary}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingSummary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Study Pack...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Summary & Study Pack</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
