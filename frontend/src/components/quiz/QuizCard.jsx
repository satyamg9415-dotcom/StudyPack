import React from 'react';
import { Check, Tag, GraduationCap } from 'lucide-react';

export default function QuizCard({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) {
  if (!question) return null;

  const topic = question.topic || 'Lecture Assessment';
  const difficulty = question.difficulty || 'Medium';

  const getDifficultyColor = (diff) => {
    const d = diff.toLowerCase();
    if (d.includes('easy')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (d.includes('hard')) return 'text-rose-700 bg-rose-50 border-rose-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Question Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          {topic}
        </span>
      </div>

      {/* Question Statement */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
          {question.question || question.question_statement}
        </h3>
      </div>

      {/* 4 Options Grid */}
      <div role="radiogroup" aria-label={`Question ${questionIndex + 1} options`} className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectOption(opt.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isSelected
                  ? 'border-indigo-600 bg-gradient-to-r from-indigo-50/90 to-purple-50/50 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {opt.id}
                </span>
                <span
                  className={`text-sm sm:text-base leading-relaxed ${
                    isSelected ? 'font-bold text-indigo-950' : 'text-slate-700 font-medium'
                  }`}
                >
                  {opt.text}
                </span>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 text-transparent'
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
