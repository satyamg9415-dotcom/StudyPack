import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Clock,
  TrendingUp,
  FileText,
  PlusCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import FileUploader from '../components/upload/FileUploader';
import { useStudyPack } from '../context/StudyPackContext';

export default function DashboardPage() {
  const { studyPacks, stats } = useStudyPack();
  const recentPacks = studyPacks.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Academic Companion
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, Scholar Alex! 🎓
          </h1>

          <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
            Ready to study smarter? Transform lengthy PDF slides and lecture recordings into
            structured study guides, key definition flashcards, and interactive practice quizzes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <NavLink
              to="/upload"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Start New Study Pack</span>
            </NavLink>

            <NavLink
              to="/study-packs"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 transition-all"
            >
              <BookOpen className="w-4 h-4 text-indigo-200" />
              <span>View Library ({stats.totalPacks})</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Study Packs"
          value={stats.totalPacks}
          subtitle="Generated lecture summaries"
          icon={BookOpen}
          color="indigo"
          trend="+3 this week"
        />

        <StatCard
          title="Quizzes Attempted"
          value={stats.totalQuizzesAttempted}
          subtitle="Active recall tests taken"
          icon={GraduationCap}
          color="purple"
          trend="85% completion"
        />

        <StatCard
          title="Average Quiz Score"
          value={`${stats.avgQuizScore}%`}
          subtitle="Overall mastery rating"
          icon={TrendingUp}
          color="emerald"
          trend="+5% improvement"
        />

        <StatCard
          title="Study Time Saved"
          value={`${stats.hoursSaved} hrs`}
          subtitle="Estimated time preserved"
          icon={Clock}
          color="amber"
          trend="High efficiency"
        />
      </div>

      {/* 3. Upload Lecture Notes Quick Card */}
      <div>
        <FileUploader />
      </div>

      {/* 4. Recently Generated Study Packs & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Study Packs */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Recently Generated Study Packs
              </h2>
              <p className="text-xs text-slate-500">
                Continue studying from where you left off
              </p>
            </div>
            <NavLink
              to="/study-packs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-3">
            {recentPacks.map((pack) => (
              <div
                key={pack.id}
                className="p-4 rounded-2xl border border-slate-200/70 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {pack.subject}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(pack.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">
                      {pack.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <NavLink
                    to={`/study-packs?selected=${pack.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    Open Study Pack
                  </NavLink>
                  <NavLink
                    to={`/quiz?packId=${pack.id}`}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    title="Quiz on this pack"
                  >
                    <GraduationCap className="w-4 h-4" />
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Access Tools */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Quick Study Tools
            </h2>
            <p className="text-xs text-slate-500">
              Immediate access to core features
            </p>
          </div>

          <div className="space-y-2.5">
            <NavLink
              to="/upload"
              className="p-3.5 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/70 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Upload Notes</p>
                  <p className="text-[11px] text-slate-500">PDF, PPTX, or TXT</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </NavLink>

            <NavLink
              to="/quiz"
              className="p-3.5 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100/70 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Practice Quiz</p>
                  <p className="text-[11px] text-slate-500">Interactive MCQs</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </NavLink>

            <NavLink
              to="/study-packs"
              className="p-3.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/70 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">Chapter Summaries</p>
                  <p className="text-[11px] text-slate-500">Key concept takeaways</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-indigo-50 border border-purple-100 text-xs text-purple-900">
            <span className="font-bold block mb-1">Study Tip of the Day</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Active recall through practice questions yields 50% higher long-term retention
              than passive re-reading. Try a quiz before your next lecture!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
