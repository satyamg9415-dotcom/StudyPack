import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  Bookmark,
  HelpCircle,
  CheckSquare,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import OverviewTab from './OverviewTab';
import SummaryTab from './SummaryTab';
import KeyTermsTab from './KeyTermsTab';
import PracticeTab from './PracticeTab';

/**
 * Modern Accessible Tabbed Interface for Study Pack.
 * Follows Modern Web Guidance (tabs guide):
 * - Uses <button type="button"> with role="tab"
 * - Selected state marked via aria-selected
 * - Style active tab with shape/underline indicator
 * - Accessible tablist and tabpanel roles with aria-labelledby
 */
export default function StudyPackDashboard({
  studyPack,
  onOpenSummarizer,
  onExtractTerms,
  isExtractingTerms,
  onGenerateQuestions,
  isGeneratingQuestions,
  onDownloadPdf,
  isDownloadingPdf,
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!studyPack) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs p-8">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Study Pack Selected</h3>
        <p className="text-sm text-slate-500 mt-1">
          Select or create a study pack to view structured study materials.
        </p>
        <NavLink
          to="/upload"
          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white font-medium text-xs px-4 py-2 rounded-xl"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Create One Now
        </NavLink>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'summary', label: 'Summary', icon: Layers, count: studyPack.chapters?.length },
    { id: 'keywords', label: 'Key Terms', icon: Bookmark, count: studyPack.keywords?.length },
    { id: 'practice', label: 'Practice Questions', icon: HelpCircle, count: studyPack.practice_questions?.length },
    { id: 'quiz', label: 'MCQ Quiz', icon: CheckSquare, count: studyPack.quiz?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-2">
        <div
          role="tablist"
          aria-label="Study pack sections"
          className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scroller"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isSelected
                    ? 'text-indigo-700 bg-indigo-50/80 shadow-2xs after:content-[""] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-indigo-600 after:rounded-full'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
            <OverviewTab
              studyPack={studyPack}
              onOpenSummarizer={onOpenSummarizer}
              onDownloadPdf={onDownloadPdf}
              isDownloadingPdf={isDownloadingPdf}
            />
          </div>
        )}

        {activeTab === 'summary' && (
          <div role="tabpanel" id="panel-summary" aria-labelledby="tab-summary">
            <SummaryTab
              chapters={studyPack.chapters}
              importantExplanations={studyPack.important_explanations}
              keyTakeaways={studyPack.key_takeaways}
              onOpenSummarizer={onOpenSummarizer}
            />
          </div>
        )}

        {activeTab === 'keywords' && (
          <div role="tabpanel" id="panel-keywords" aria-labelledby="tab-keywords">
            <KeyTermsTab
              keywords={studyPack.keywords}
              onExtractTerms={onExtractTerms}
              isExtractingTerms={isExtractingTerms}
              activePackTitle={studyPack.title}
            />
          </div>
        )}

        {activeTab === 'practice' && (
          <div role="tabpanel" id="panel-practice" aria-labelledby="tab-practice">
            <PracticeTab
              questions={studyPack.practice_questions}
              onGenerateQuestions={onGenerateQuestions}
              isGeneratingQuestions={isGeneratingQuestions}
              activePackTitle={studyPack.title}
            />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div role="tabpanel" id="panel-quiz" aria-labelledby="tab-quiz">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-xl mx-auto shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white mx-auto flex items-center justify-center shadow-md shadow-indigo-100">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Ready for the Quiz?
              </h3>
              <p className="text-sm text-slate-600">
                This study pack includes {studyPack.quiz?.length || 0} interactive multiple-choice questions to test your knowledge retention.
              </p>
              {studyPack.lastQuizScore && (
                <div className="p-3 bg-indigo-50 rounded-xl inline-block border border-indigo-100 text-xs text-indigo-900 font-medium">
                  Previous Score: <strong>{studyPack.lastQuizScore.score}/{studyPack.lastQuizScore.total} ({studyPack.lastQuizScore.percentage}%)</strong> on {new Date(studyPack.lastQuizScore.date).toLocaleDateString()}
                </div>
              )}
              <div>
                <NavLink
                  to={`/quiz?packId=${studyPack.id}`}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Interactive Quiz</span>
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
