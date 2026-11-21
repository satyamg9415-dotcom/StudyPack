import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import StudyPackPage from './pages/StudyPackPage';
import QuizPage from './pages/QuizPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { StudyPackProvider } from './context/StudyPackContext';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area (offset by 72 = 18rem on lg screens) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/study-packs" element={<HistoryPage />} />
            <Route path="/study-pack" element={<StudyPackPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global SaaS Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 StudyPack AI. Intelligent Lecture Study Synthesis.</p>
            <div className="flex items-center space-x-6">
              <span className="text-slate-500 font-medium">React + Tailwind + FastAPI + Gemini</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StudyPackProvider>
      <AppContent />
    </StudyPackProvider>
  );
}
