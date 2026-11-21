import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function AnswerScorecard({
  evaluation,
  questionText,
  studentAnswerText,
  referenceAnswerText,
  onRevise,
  onClose,
}) {
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [copiedModel, setCopiedModel] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!evaluation) return null;

  const score = evaluation.score ?? 0;
  const percentage = evaluation.percentage ?? Math.round((score / 10) * 100);
  const grade = evaluation.grade || (score >= 8.5 ? 'A' : score >= 7 ? 'B' : score >= 5 ? 'C' : 'D');

  const getTheme = () => {
    if (score >= 8.0) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        accentBg: 'bg-emerald-600',
        ringColor: 'ring-emerald-500/20',
        headerGradient: 'from-emerald-600 via-teal-600 to-emerald-700',
        cardBg: 'bg-emerald-50/50 border-emerald-200/80',
        scoreColor: 'text-emerald-700',
        tag: 'Outstanding Mastery',
      };
    }
    if (score >= 6.0) {
      return {
        badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
        accentBg: 'bg-indigo-600',
        ringColor: 'ring-indigo-500/20',
        headerGradient: 'from-indigo-600 via-purple-600 to-indigo-700',
        cardBg: 'bg-indigo-50/50 border-indigo-200/80',
        scoreColor: 'text-indigo-700',
        tag: 'Good Understanding',
      };
    }
    if (score >= 4.0) {
      return {
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
        accentBg: 'bg-amber-600',
        ringColor: 'ring-amber-500/20',
        headerGradient: 'from-amber-600 via-orange-600 to-amber-700',
        cardBg: 'bg-amber-50/50 border-amber-200/80',
        scoreColor: 'text-amber-700',
        tag: 'Needs Revision',
      };
    }
    return {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      accentBg: 'bg-rose-600',
      ringColor: 'ring-rose-500/20',
      headerGradient: 'from-rose-600 via-pink-600 to-rose-700',
      cardBg: 'bg-rose-50/50 border-rose-200/80',
      scoreColor: 'text-rose-700',
      tag: 'Critical Gaps',
    };
  };

  const theme = getTheme();

  const handleCopyModel = (e) => {
    e.stopPropagation();
    if (evaluation.improved_model_answer) {
      navigator.clipboard.writeText(evaluation.improved_model_answer);
      setCopiedModel(true);
      setTimeout(() => setCopiedModel(false), 2000);
    }
  };

  const handleCopySummary = (e) => {
    e.stopPropagation();
    const summaryText = `StudyPack AI Academic Evaluation Scorecard
Score: ${score}/10 (${percentage}%) | Grade: ${grade}
Feedback: ${evaluation.overall_feedback || ''}
Correct Points: ${(evaluation.correct_points || []).join('; ')}
Missing Points: ${(evaluation.missing_points || []).join('; ')}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-250">
      {/* Scorecard Hero Banner */}
      <div className={`p-5 sm:p-6 text-white bg-gradient-to-r ${theme.headerGradient} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/25">
              <Award className="w-3.5 h-3.5" />
              University Examiner Scorecard (P06)
            </span>
            <span className="text-xs text-white/80 font-medium hidden sm:inline">
              Prompt Rubric Evaluation
            </span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Answer Evaluation Assessment
          </h4>
          <p className="text-xs text-white/90 max-w-xl line-clamp-2">
            Objective evaluation comparing your response against the benchmark reference answer across 5 academic criteria.
          </p>
        </div>

        {/* Score & Grade Display */}
        <div className="flex items-center gap-3.5 self-start md:self-auto bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/25 shadow-inner">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-white leading-none">
              {score.toFixed(1)}
              <span className="text-sm font-semibold text-white/80">/10</span>
            </div>
            <div className="text-[11px] font-semibold text-white/80 tracking-wide mt-0.5">
              {percentage}% Mastery
            </div>
          </div>
          <div className="h-10 w-px bg-white/30" />
          <div className="text-center px-1">
            <span className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight block">
              {grade}
            </span>
            <span className="text-[10px] uppercase font-bold text-white/80 block mt-0.5">
              Grade
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Examiner Overall Verdict */}
        {evaluation.overall_feedback && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                  Examiner Synthesis & Verdict
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  {theme.tag}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {evaluation.overall_feedback}
              </p>
            </div>
          </div>
        )}

        {/* 5 Criteria-wise Marks Breakdown */}
        {evaluation.criteria_marks && evaluation.criteria_marks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Criteria-Wise Marks Breakdown</span>
              </h5>
              <span className="text-xs text-slate-500 font-medium">
                Max 2.0 pts per criterion (Total 10.0 pts)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evaluation.criteria_marks.map((crit, idx) => {
                const critScore = crit.score ?? 0;
                const critMax = crit.max_score || 2.0;
                const critPct = Math.min(100, Math.round((critScore / critMax) * 100));

                let barColor = 'bg-emerald-500';
                if (critPct < 40) barColor = 'bg-rose-500';
                else if (critPct < 70) barColor = 'bg-amber-500';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {crit.criterion}
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {critScore.toFixed(1)} / {critMax.toFixed(1)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${critPct}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {crit.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytical Breakdown: Correct vs Missing vs Errors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Correct Points */}
          <div className="p-4 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Correct Points ({evaluation.correct_points?.length || 0})</span>
            </div>
            {evaluation.correct_points && evaluation.correct_points.length > 0 ? (
              <ul className="space-y-1.5">
                {evaluation.correct_points.map((pt, i) => (
                  <li key={i} className="text-xs text-emerald-950 flex items-start gap-1.5 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No fully accurate key points identified.</p>
            )}
          </div>

          {/* Missing Points */}
          <div className="p-4 rounded-2xl border border-amber-200/90 bg-amber-50/40 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Missing Points ({evaluation.missing_points?.length || 0})</span>
            </div>
            {evaluation.missing_points && evaluation.missing_points.length > 0 ? (
              <ul className="space-y-1.5">
                {evaluation.missing_points.map((pt, i) => (
                  <li key={i} className="text-xs text-amber-950 flex items-start gap-1.5 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-emerald-700 font-medium">All essential reference points were addressed!</p>
            )}
          </div>

          {/* Incorrect Statements */}
          <div className="p-4 rounded-2xl border border-rose-200/90 bg-rose-50/40 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>Misconceptions ({evaluation.incorrect_statements?.length || 0})</span>
            </div>
            {evaluation.incorrect_statements && evaluation.incorrect_statements.length > 0 ? (
              <ul className="space-y-1.5">
                {evaluation.incorrect_statements.map((pt, i) => (
                  <li key={i} className="text-xs text-rose-950 flex items-start gap-1.5 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>No factually incorrect statements detected.</span>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions for Improvement */}
        {evaluation.suggestions_for_improvement && evaluation.suggestions_for_improvement.length > 0 && (
          <div className="p-4 rounded-2xl border border-indigo-200/90 bg-indigo-50/40 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>Examiner Suggestions for Improvement</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
              {evaluation.suggestions_for_improvement.map((sug, i) => (
                <div
                  key={i}
                  className="bg-white/80 p-3 rounded-xl border border-indigo-100/90 text-xs text-indigo-950 flex items-start gap-2 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{sug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improved Model Answer Toggle / Comparison */}
        {evaluation.improved_model_answer && (
          <div className="rounded-2xl border border-purple-200/90 bg-purple-50/30 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-purple-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-purple-950 block">
                    Ideal University Model Answer (10/10 Benchmark)
                  </span>
                  <span className="text-[11px] text-purple-700/80">
                    See how a top-scoring response incorporates all terminology and structural depth
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700">
                  {showModelAnswer ? 'Hide Model' : 'View Model'}
                </span>
                {showModelAnswer ? (
                  <ChevronUp className="w-4 h-4 text-purple-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-purple-700" />
                )}
              </div>
            </button>

            {showModelAnswer && (
              <div className="p-4 sm:p-5 border-t border-purple-200/80 bg-white/95 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                    Exemplary Model Response:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyModel}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                  >
                    {copiedModel ? (
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
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/70 font-mono">
                  {evaluation.improved_model_answer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Scorecard Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            {onRevise && (
              <button
                type="button"
                onClick={onRevise}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revise & Re-Evaluate</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Scorecard Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Scorecard Summary</span>
                </>
              )}
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Collapse Scorecard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
