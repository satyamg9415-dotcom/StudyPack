import React, { useState } from 'react';
import {
  Server,
  RefreshCw,
  BrainCircuit,
  Sliders,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useStudyPack } from '../context/StudyPackContext';
import { testGeminiPrompt } from '../api/client';

export default function SettingsPage() {
  const { settings, updateSettings, backendHealth, backendStatus, refreshHealth } =
    useStudyPack();

  const [testPrompt, setTestPrompt] = useState('Explain the role of mitochondria in one sentence.');
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [testError, setTestError] = useState(null);

  const handleTestGemini = async (e) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;

    setTestLoading(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const data = await testGeminiPrompt(testPrompt.trim());
      setTestResponse(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to contact Gemini API via backend.';
      setTestError(msg);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Preferences
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure AI generation parameters, export formats, and backend connectivity.
        </p>
      </div>

      {/* 1. Interactive Gemini Test Endpoint Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Test Google Gemini API</h2>
            <p className="text-xs text-slate-500">
              Live test via <code>POST /api/test-gemini</code> using official Google Gen AI SDK
            </p>
          </div>
        </div>

        <form onSubmit={handleTestGemini} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Test Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter prompt to test Gemini API..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <button
                type="submit"
                disabled={testLoading || !testPrompt.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {testResponse && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Gemini API Response (Model: {testResponse.model})
                </span>
                <span className="text-[11px] font-mono text-emerald-600">200 OK</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                {testResponse.response}
              </p>
            </div>
          )}

          {testError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gemini Generation Error:</p>
                <p className="mt-0.5">{testError}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 2. AI Generation Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Generation Preferences</h2>
            <p className="text-xs text-slate-500">Tune Gemini API synthesis behavior</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Gemini Model
            </label>
            <select
              value={settings.geminiModel}
              onChange={(e) => updateSettings({ geminiModel: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="gemini-flash-lite-latest">Gemini Flash-Lite (Fast & Responsive)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced Multimodal)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Flash provides fast, high-accuracy summaries. Pro is best for complex scientific lectures.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Default Summary Depth
            </label>
            <select
              value={settings.summaryDepth}
              onChange={(e) => updateSettings({ summaryDepth: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="concise">Concise (High-level bullet takeaways)</option>
              <option value="standard">Standard (Comprehensive chapters)</option>
              <option value="in-depth">In-Depth (Detailed conceptual breakdown)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Default Quiz Questions
            </label>
            <select
              value={settings.defaultQuestions}
              onChange={(e) => updateSettings({ defaultQuestions: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value={5}>5 Questions (Quick Check)</option>
              <option value={10}>10 Questions (Standard Quiz)</option>
              <option value={15}>15 Questions (Thorough Examination)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Quiz Difficulty
            </label>
            <select
              value={settings.quizDifficulty}
              onChange={(e) => updateSettings({ quizDifficulty: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              <option value="easy">Foundational / Conceptual</option>
              <option value="medium">Standard University Level</option>
              <option value="challenging">Advanced Application & Synthesis</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Application Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Application Preferences</h2>
            <p className="text-xs text-slate-500">Export formats and learning experience</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Default Export Format</p>
              <p className="text-xs text-slate-500">Format downloaded study guides are generated in</p>
            </div>
            <select
              value={settings.exportFormat}
              onChange={(e) => updateSettings({ exportFormat: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="pdf">PDF Document (.pdf)</option>
              <option value="txt">Plain Text (.txt)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Auto-Save Study Progress</p>
              <p className="text-xs text-slate-500">Save quiz scores and generated packs locally</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Backend & API Status */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backend & API Status</h2>
              <p className="text-xs text-slate-500">FastAPI backend and Gemini API key health</p>
            </div>
          </div>

          <button
            onClick={refreshHealth}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Health</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">FastAPI Server</span>
            <span
              className={`font-semibold mt-1 inline-flex items-center gap-1.5 ${
                backendStatus === 'connected' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {backendStatus === 'connected' ? 'Connected (Port 8000)' : 'Offline'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">API Endpoint</span>
            <span className="font-semibold text-slate-700 mt-1 block font-mono">
              http://localhost:8000/api
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block font-medium">Gemini API Key</span>
            <span
              className={`font-semibold mt-1 inline-flex items-center gap-1.5 ${
                backendHealth?.gemini_configured ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealth?.gemini_configured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {backendHealth?.gemini_configured ? 'Configured in backend/.env' : 'Pending in backend/.env'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
