import React, { useState } from 'react';
import {
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Tag,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  GraduationCap,
  BookOpen,
  PenTool,
  Award,
  Send,
  AlertCircle,
  RotateCcw,
  Sparkle,
  CheckSquare,
} from 'lucide-react';
import { evaluateAnswer } from '../../api/client';
import AnswerScorecard from '../practice/AnswerScorecard';

export default function PracticeTab({
  questions = [],
  onGenerateQuestions,
  isGeneratingQuestions = false,
  activePackTitle,
}) {
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Configuration modal state for generating fresh questions
  const [showConfig, setShowConfig] = useState(false);
  const [genCount, setGenCount] = useState(6);
  const [genDifficulty, setGenDifficulty] = useState('Balanced (Easy, Medium, Hard)');

  // Answer Evaluation States (Prompt P06)
  const [openInputIds, setOpenInputIds] = useState(new Set());
  const [studentAnswers, setStudentAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evaluatingIds, setEvaluatingIds] = useState(new Set());
  const [evalErrors, setEvalErrors] = useState({});

  const toggleReveal = (idx) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleAnswerInput = (idx) => {
    setOpenInputIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleStudentAnswerChange = (idx, text) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [idx]: text,
    }));
    // Clear any previous error when user edits
    if (evalErrors[idx]) {
      setEvalErrors((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }
  };

  const handleSubmitEvaluation = async (idx, question, referenceAnswer) => {
    const answer = (studentAnswers[idx] || '').trim();
    if (!answer) {
      setEvalErrors((prev) => ({
        ...prev,
        [idx]: 'Please enter your answer before requesting AI evaluation.',
      }));
      return;
    }

    setEvaluatingIds((prev) => new Set(prev).add(idx));
    setEvalErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });

    try {
      const evalResult = await evaluateAnswer({
        question: question.question || question,
        reference_answer: referenceAnswer || question.model_answer || question.answer || '',
        student_answer: answer,
      });

      setEvaluations((prev) => ({
        ...prev,
        [idx]: evalResult,
      }));
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to evaluate answer with AI examiner.';
      setEvalErrors((prev) => ({
        ...prev,
        [idx]: msg,
      }));
    } finally {
      setEvaluatingIds((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  // Filter questions by search, question_type, and difficulty
  const filtered = (questions || []).filter((q) => {
    const textMatches =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.model_answer || q.answer || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.relevant_topic && q.relevant_topic.toLowerCase().includes(search.toLowerCase()));

    if (!textMatches) return false;

    if (selectedType !== 'all') {
      const qType = (q.question_type || '').toLowerCase();
      if (!qType.includes(selectedType.toLowerCase())) return false;
    }

    if (selectedDifficulty !== 'all') {
      const diff = (q.difficulty || '').toLowerCase();
      if (!diff.includes(selectedDifficulty.toLowerCase())) return false;
    }

    return true;
  });

  const allFilteredRevealed =
    filtered.length > 0 && filtered.every((_, idx) => revealedIds.has(idx));

  const handleToggleAll = () => {
    if (allFilteredRevealed) {
      setRevealedIds(new Set());
    } else {
      const all = new Set(filtered.map((_, idx) => idx));
      setRevealedIds(all);
    }
  };

  const handleCopyAnswer = (e, idx, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleTriggerGenerate = () => {
    if (onGenerateQuestions) {
      onGenerateQuestions({
        question_count: genCount,
        difficulty_distribution: genDifficulty,
      });
      setShowConfig(false);
    }
  };

  const getTypeBadge = (type) => {
    const t = (type || 'Conceptual').toLowerCase();
    if (t.includes('short')) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
          Short Answer
        </span>
      );
    }
    if (t.includes('long')) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
          Long Answer
        </span>
      );
    }
    if (t.includes('app')) {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70">
          Application
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
        Conceptual
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const d = (difficulty || 'Medium').toLowerCase();
    if (d.includes('easy')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Easy
        </span>
      );
    }
    if (d.includes('hard')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Hard
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Medium
      </span>
    );
  };

  // Empty state if no questions available
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-2xs">
          <HelpCircle className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-800">
            No Practice Questions Generated Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate practice questions with model answers, then test your understanding by entering your own answers for AI evaluation!
          </p>
        </div>
        {onGenerateQuestions && (
          <button
            type="button"
            onClick={() => onGenerateQuestions({ question_count: 6, difficulty_distribution: 'Balanced' })}
            disabled={isGeneratingQuestions}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingQuestions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Practice Questions with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Practice Questions with Gemini (P03)</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter & Action Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search practice questions, topics, or answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Action Buttons: Reveal All & AI Generate */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleToggleAll}
              aria-expanded={allFilteredRevealed}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {allFilteredRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  <span>Hide All Model Answers</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reveal All Model Answers</span>
                </>
              )}
            </button>

            {onGenerateQuestions && (
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                disabled={isGeneratingQuestions}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isGeneratingQuestions ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Generate New Questions</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Feature Hint Banner */}
        <div className="p-3 bg-gradient-to-r from-purple-50 via-indigo-50 to-white rounded-xl border border-purple-100 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-900 font-medium">
            <Award className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>
              <strong>AI Answer Evaluator Ready:</strong> Click <em>"Write Your Answer"</em> on any question to test your knowledge. The university examiner evaluates your response out of 10 with a full rubric scorecard!
            </span>
          </div>
        </div>

        {/* Question Generation Configuration Drawer (if toggled) */}
        {showConfig && (
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                Prompt P03 Question Generator Settings
              </span>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="text-xs text-purple-700 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Number of Questions
                </label>
                <div className="flex items-center gap-1.5">
                  {[4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGenCount(num)}
                      className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                        genCount === num
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Difficulty Distribution
                </label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700"
                >
                  <option value="Balanced (Easy, Medium, Hard)">Balanced (Easy, Medium, Hard)</option>
                  <option value="Easy-focused">Easy-focused (Foundation concepts)</option>
                  <option value="Medium-focused">Medium-focused (Standard undergraduate)</option>
                  <option value="Hard-focused">Hard-focused (Exam/Advanced challenges)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleTriggerGenerate}
                disabled={isGeneratingQuestions}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Gemini Professor Generator</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Badges Row: Types & Difficulties */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scroller py-0.5">
            <span className="text-slate-400 font-semibold mr-1">Type:</span>
            {['all', 'conceptual', 'short', 'long', 'app'].map((tKey) => {
              const label =
                tKey === 'all'
                  ? 'All'
                  : tKey === 'conceptual'
                  ? 'Conceptual'
                  : tKey === 'short'
                  ? 'Short Answer'
                  : tKey === 'long'
                  ? 'Long Answer'
                  : 'Application';

              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setSelectedType(tKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedType === tKey
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {questions.length} questions
          </span>
        </div>
      </div>

      {/* Questions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-6">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-bold text-sm">No matching questions found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or switching the question type filter.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((q, idx) => {
            const isRevealed = revealedIds.has(idx);
            const isInputOpen = openInputIds.has(idx);
            const isEvaluating = evaluatingIds.has(idx);
            const evaluation = evaluations[idx];
            const evalError = evalErrors[idx];
            const answerText = q.model_answer || q.answer || 'Answer available in lecture notes.';
            const topic = q.relevant_topic || 'Lecture Material';
            const studentAnswer = studentAnswers[idx] || '';

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 shadow-2xs hover:shadow-sm space-y-4 ${
                  evaluation
                    ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                    : isRevealed
                    ? 'border-purple-300'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Question Header & Metadata Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100 flex-shrink-0">
                      Q{idx + 1}
                    </span>
                    {getTypeBadge(q.question_type)}
                    {getDifficultyBadge(q.difficulty)}

                    {/* Evaluated Score Pill if already graded */}
                    {evaluation && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <Award className="w-3 h-3 text-indigo-600" />
                        Score: {evaluation.score.toFixed(1)}/10 ({evaluation.grade})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {topic}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="pl-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </p>
                </div>

                {/* Action Bar: Answer Yourself vs Model Answer */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Write / Test Your Answer Button */}
                    <button
                      type="button"
                      onClick={() => toggleAnswerInput(idx)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isInputOpen
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{isInputOpen ? 'Hide Answer Box' : 'Write Your Answer & Evaluate'}</span>
                    </button>

                    {/* Reveal/Hide Model Answer Button */}
                    <button
                      type="button"
                      onClick={() => toggleReveal(idx)}
                      aria-expanded={isRevealed}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isRevealed
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Hide Model Answer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Model Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isRevealed && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyAnswer(e, idx, answerText)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Model Answer</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Student Answer Input Box (Prompt P06 Interface) */}
                {isInputOpen && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/90 space-y-3.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                        Student Response Workspace
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {(studentAnswer.trim().split(/\s+/).filter(Boolean).length)} words · {studentAnswer.length} chars
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={studentAnswer}
                      onChange={(e) => handleStudentAnswerChange(idx, e.target.value)}
                      placeholder="Type your answer to this question in your own words... Be thorough with key concepts and scientific terminology."
                      className="w-full p-3.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
                    />

                    {/* Validation Error if any */}
                    {evalError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                        <span>{evalError}</span>
                      </div>
                    )}

                    {/* Submission Toolbar */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      <span className="text-[11px] text-slate-500">
                        Graded across: Conceptual Accuracy, Coverage, Terms, Quality, Relevance
                      </span>

                      <div className="flex items-center gap-2">
                        {studentAnswer && (
                          <button
                            type="button"
                            onClick={() => handleStudentAnswerChange(idx, '')}
                            disabled={isEvaluating}
                            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 cursor-pointer"
                          >
                            Clear
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSubmitEvaluation(idx, q, answerText)}
                          disabled={isEvaluating || !studentAnswer.trim()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Examiner Grading (P06)...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Evaluate Answer with AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scorecard Component (Rendered when evaluation is ready) */}
                {evaluation && (
                  <div className="mt-4">
                    <AnswerScorecard
                      evaluation={evaluation}
                      questionText={q.question}
                      studentAnswerText={studentAnswer}
                      referenceAnswerText={answerText}
                      onRevise={() => {
                        setOpenInputIds((prev) => new Set(prev).add(idx));
                      }}
                      onClose={() => {
                        setEvaluations((prev) => {
                          const next = { ...prev };
                          delete next[idx];
                          return next;
                        });
                      }}
                    />
                  </div>
                )}

                {/* Expandable Model Professor Answer Box */}
                {isRevealed && (
                  <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-emerald-50/40 to-white border border-emerald-200/90 shadow-2xs space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Model Professor Answer
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {topic}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed whitespace-pre-line">
                      {answerText}
                    </p>

                    {/* Supplementary Explanation (if available) */}
                    {q.explanation && (
                      <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs text-slate-700 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800">Concept Explanation: </span>
                          <span>{q.explanation}</span>
                        </div>
                      </div>
                    )}
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
