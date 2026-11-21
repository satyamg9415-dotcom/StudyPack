import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  RotateCcw,
  Trophy,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  Loader2,
  Sliders,
  Tag,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import QuizCard from './QuizCard';
import { useStudyPack } from '../../context/StudyPackContext';

export default function QuizEngine({
  studyPack,
  onGenerateQuiz,
  onGenerateAdaptiveQuiz,
  isGeneratingQuiz = false,
}) {
  const { recordQuizScore } = useStudyPack();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(
    studyPack?.lastQuizAttempt?.answers || {}
  );
  const [isSubmitted, setIsSubmitted] = useState(
    studyPack?.lastQuizAttempt?.submitted || false
  );

  // Active adaptive difficulty state
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    studyPack?.currentDifficulty || 'Medium'
  );
  const [genCount, setGenCount] = useState(5);
  const [showAdaptiveDrawer, setShowAdaptiveDrawer] = useState(false);

  const questions = studyPack?.quiz || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const difficultyLevels = [
    {
      id: 'Easy',
      label: 'Easy',
      tagline: 'Definitions & Core Concepts',
      desc: 'Test definitions, basic concepts and direct understanding.',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-400',
    },
    {
      id: 'Medium',
      label: 'Medium',
      tagline: 'Conceptual Relationships',
      desc: 'Test conceptual understanding, comparisons and relationships.',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      activeClass: 'bg-amber-600 text-white ring-2 ring-amber-400',
    },
    {
      id: 'Hard',
      label: 'Hard',
      tagline: 'Multi-step Reasoning & Application',
      desc: 'Test application, analysis, multi-step reasoning and connections.',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      activeClass: 'bg-purple-600 text-white ring-2 ring-purple-400',
    },
  ];

  const handleSelectOption = (optionId) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const correctId = q.correct_option_id || q.correct_answer;
      if (selectedAnswers[idx] === correctId) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    recordQuizScore(studyPack.id, {
      score: correctCount,
      total: totalQuestions,
      percentage,
      difficulty: selectedDifficulty,
      date: new Date().toISOString(),
      answers: selectedAnswers,
      submitted: true,
    });
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
  };

  const triggerAdaptiveGeneration = (diff = selectedDifficulty, count = genCount) => {
    setSelectedDifficulty(diff);
    if (onGenerateAdaptiveQuiz) {
      onGenerateAdaptiveQuiz({
        difficulty: diff,
        question_count: count,
      });
      handleRetake();
      setShowAdaptiveDrawer(false);
    } else if (onGenerateQuiz) {
      onGenerateQuiz({
        number_of_questions: count,
        difficulty: diff,
      });
      handleRetake();
      setShowAdaptiveDrawer(false);
    }
  };

  // Empty state if no quiz questions exist
  if (totalQuestions === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xs space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Generate Adaptive AI Quiz
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Choose your difficulty level. Google Gemini calibrates question complexity from definitions up to multi-step reasoning.
          </p>
        </div>

        {/* 3 Difficulty Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {difficultyLevels.map((lvl) => {
            const isSelected = selectedDifficulty === lvl.id;
            return (
              <div
                key={lvl.id}
                onClick={() => setSelectedDifficulty(lvl.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${lvl.badgeClass}`}>
                    {lvl.label}
                  </span>
                  <input
                    type="radio"
                    name="difficulty"
                    checked={isSelected}
                    onChange={() => setSelectedDifficulty(lvl.id)}
                    className="text-indigo-600"
                  />
                </div>
                <p className="text-xs font-bold text-slate-800">{lvl.tagline}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {lvl.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Number of Questions */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Question Count:</span>
          {[3, 5, 8, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setGenCount(num)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${genCount === num
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {num} Qs
            </button>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={() => triggerAdaptiveGeneration(selectedDifficulty, genCount)}
            disabled={isGeneratingQuiz}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {selectedDifficulty} Quiz with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate {selectedDifficulty} Quiz ({genCount} Questions)</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Score Calculation
  let correctCount = 0;
  if (isSubmitted) {
    questions.forEach((q, idx) => {
      const correctId = q.correct_option_id || q.correct_answer;
      if (selectedAnswers[idx] === correctId) {
        correctCount += 1;
      }
    });
  }
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <NavLink
          to={`/study-pack?selected=${studyPack.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Study Pack</span>
        </NavLink>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
      </div>

      {/* Adaptive Difficulty Mode Banner */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                Adaptive Difficulty Mode:
              </span>
              <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">
                {selectedDifficulty}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {difficultyLevels.find((d) => d.id === selectedDifficulty)?.desc ||
                'Calibrated using Prompt P05'}
            </p>
          </div>
        </div>

        {/* 3-Level Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {['Easy', 'Medium', 'Hard'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => triggerAdaptiveGeneration(lvl, totalQuestions || 5)}
              disabled={isGeneratingQuiz}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedDifficulty === lvl
                ? lvl === 'Easy'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : lvl === 'Medium'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Quiz Active Question OR Results Screen */}
      {!isSubmitted ? (
        <div className="space-y-6">
          <QuizCard
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={totalQuestions}
            selectedOption={selectedAnswers[currentIndex]}
            onSelectOption={handleSelectOption}
          />

          {/* Navigation Controls: Previous, Next, Submit */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Submit Quiz</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 text-center shadow-xs space-y-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-100">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  Quiz Completed
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                  {selectedDifficulty} Mode
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {scorePercent}% Score
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                You answered <strong>{correctCount}</strong> out of{' '}
                <strong>{totalQuestions}</strong> questions correctly at{' '}
                <strong>{selectedDifficulty}</strong> difficulty.
              </p>
            </div>

            {/* Adaptive Level-Up Recommendation */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 max-w-lg mx-auto text-xs text-indigo-950 space-y-2">
              <span className="font-bold block flex items-center justify-center gap-1.5 text-indigo-900">
                <Award className="w-4 h-4 text-indigo-600" />
                Adaptive Learning Path Recommendation:
              </span>
              <p className="leading-relaxed">
                {scorePercent >= 80 && selectedDifficulty === 'Easy'
                  ? 'Outstanding foundational mastery! You are ready to step up to Medium difficulty (conceptual relationships & comparisons).'
                  : scorePercent >= 80 && selectedDifficulty === 'Medium'
                    ? 'Superb conceptual comprehension! You are ready for the Hard difficulty challenge (application, analysis & multi-step reasoning).'
                    : scorePercent >= 80 && selectedDifficulty === 'Hard'
                      ? 'Master-level understanding! You have mastered application and analytical reasoning for this lecture.'
                      : 'Solid effort! Review the model explanations below and try retaking this quiz or testing basic definitions in Easy mode.'}
              </p>

              {/* Quick Level Switcher */}
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                {['Easy', 'Medium', 'Hard'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => triggerAdaptiveGeneration(lvl, totalQuestions || 5)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedDifficulty === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                      }`}
                  >
                    Test in {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Retake, Return */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake This Quiz</span>
              </button>

              <NavLink
                to={`/study-pack?selected=${studyPack.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Return to Study Pack</span>
              </NavLink>
            </div>
          </div>

          {/* Detailed Question Review with Explanations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 px-1">
              Answer Review & Verified Explanations
            </h3>

            {questions.map((q, qIdx) => {
              const chosen = selectedAnswers[qIdx];
              const correctId = q.correct_option_id || q.correct_answer;
              const isCorrect = chosen === correctId;
              const topic = q.topic || 'Lecture Assessment';

              return (
                <div
                  key={q.id || qIdx}
                  className={`bg-white rounded-2xl border p-6 shadow-2xs space-y-4 ${isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start space-x-2.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Question {qIdx + 1}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {topic}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-slate-900">
                          {q.question || q.question_statement}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                        }`}
                    >
                      {isCorrect ? 'Correct (+1)' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Selected vs Correct Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-slate-400 block font-medium">Your Selected Answer:</span>
                      <span
                        className={`font-bold mt-1 block ${isCorrect ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                      >
                        Option {chosen || 'None'}:{' '}
                        {q.options.find((o) => o.id === chosen)?.text || 'Unanswered'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                      <span className="text-slate-400 block font-medium">Correct Answer:</span>
                      <span className="font-bold text-emerald-700 mt-1 block">
                        Option {q.correct_option_id}:{' '}
                        {q.options.find((o) => o.id === q.correct_option_id)?.text}
                      </span>
                    </div>
                  </div>

                  {/* Verified Model Explanation */}
                  {q.explanation && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-1">Verified Explanation:</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
