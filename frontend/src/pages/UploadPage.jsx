import React from 'react';
import FileUploader from '../components/upload/FileUploader';
import { Sparkles } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Lecture Processor
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create New Study Pack
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload your course documents to generate comprehensive summaries, flashcards, and quizzes.
        </p>
      </div>

      {/* Main Upload Card */}
      <FileUploader />

      {/* How it Works Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          How StudyPack AI Processes Your Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-800">1. Text Extraction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              PyMuPDF and python-pptx extract clean text, slide outlines, and structured sections from your files on FastAPI.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm border border-purple-100">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-800">2. Gemini Synthesis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google Gemini identifies core concepts, builds chapter summaries, and creates tailored definitions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-800">3. Active Study Pack</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enjoy active study material with chapter summaries, recall flashcards, and interactive MCQ quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
