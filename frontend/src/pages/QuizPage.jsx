import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QuizEngine from '../components/quiz/QuizEngine';
import { useStudyPack } from '../context/StudyPackContext';
import { GraduationCap, Sparkles, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { generateQuiz, generateAdaptiveQuiz } from '../api/client';

export default function QuizPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { studyPacks, activePackId, setActivePackId, activePack, updateStudyPack } = useStudyPack();

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const packIdParam = searchParams.get('packId') || activePackId;
  const currentPack = studyPacks.find((p) => p.id === packIdParam) || activePack;

  const handleSelectPack = (id) => {
    setActivePackId(id);
    setSearchParams({ packId: id });
  };

  const handleGenerateAdaptiveQuiz = async (options = {}) => {
    if (!currentPack) return;

    const textToAnalyze = currentPack.lecture_text || currentPack.overview || '';
    if (!textToAnalyze.trim() || textToAnalyze.trim().length < 10) {
      setToastMessage('No lecture text available in this study pack to generate an adaptive quiz.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    const difficulty = options.difficulty || 'Medium';
    const count = options.question_count || options.number_of_questions || 5;

    setIsGeneratingQuiz(true);
    try {
      const result = await generateAdaptiveQuiz({
        lecture_text: textToAnalyze.trim(),
        difficulty,
        question_count: count,
      });

      updateStudyPack(currentPack.id, {
        quiz: result.questions,
        currentDifficulty: difficulty,
      });

      setToastMessage(`Generated ${result.questions.length} ${difficulty}-level questions with Gemini!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to generate adaptive quiz with Gemini. Please check backend connection.';
      setToastMessage(`Error: ${msg}`);
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-emerald-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiz Selector Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Interactive Quiz Practice
            </h1>
            <p className="text-xs text-slate-500">
              Adaptive difficulty-calibrated assessment (Prompt <code>P05</code>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <label className="text-xs font-semibold text-slate-500">Quiz Pack:</label>
          <select
            value={currentPack?.id || ''}
            onChange={(e) => handleSelectPack(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 max-w-xs"
          >
            {studyPacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.title} ({pack.quiz?.length || 0} Qs)
              </option>
            ))}
          </select>

          {/* Quick Difficulty Generator Trigger */}
          <button
            type="button"
            onClick={() => handleGenerateAdaptiveQuiz({ difficulty: 'Medium', question_count: 5 })}
            disabled={isGeneratingQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Generate an adaptive quiz with Gemini"
          >
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Generate Adaptive Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Quiz Engine */}
      <QuizEngine
        studyPack={currentPack}
        onGenerateQuiz={handleGenerateAdaptiveQuiz}
        onGenerateAdaptiveQuiz={handleGenerateAdaptiveQuiz}
        isGeneratingQuiz={isGeneratingQuiz}
      />
    </div>
  );
}
