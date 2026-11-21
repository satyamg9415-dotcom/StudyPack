import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialStudyPacks } from '../data/sampleStudyPacks';
import { checkHealth } from '../api/client';

const StudyPackContext = createContext(null);

export function StudyPackProvider({ children }) {
  // Load study packs from localStorage if available
  const [studyPacks, setStudyPacks] = useState(() => {
    try {
      const saved = localStorage.getItem('studypack_items');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved study packs from localStorage', e);
    }
    return initialStudyPacks;
  });

  const [activePackId, setActivePackId] = useState(() => {
    return initialStudyPacks[0]?.id || null;
  });

  const [backendHealth, setBackendHealth] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connecting' | 'connected' | 'error'
  const [healthError, setHealthError] = useState(null);

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('studypack_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
    return {
      geminiModel: 'gemini-1.5-flash',
      summaryDepth: 'standard',
      defaultQuestions: 5,
      quizDifficulty: 'medium',
      autoSave: true,
      soundEffects: true,
      exportFormat: 'markdown',
      theme: 'light'
    };
  });

  // Sync study packs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studypack_items', JSON.stringify(studyPacks));
    } catch (e) {
      console.warn('Failed to persist study packs', e);
    }
  }, [studyPacks]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studypack_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings', e);
    }
  }, [settings]);

  // Backend Health Ping
  const refreshHealth = async () => {
    setHealthError(null);
    try {
      const data = await checkHealth();
      setBackendHealth(data);
      setBackendStatus('connected');
    } catch (err) {
      setBackendStatus('error');
      setHealthError(err.message || 'Cannot reach FastAPI backend server');
    }
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  const activePack = studyPacks.find((p) => p.id === activePackId) || studyPacks[0] || null;

  const addStudyPack = (newPack) => {
    setStudyPacks((prev) => [newPack, ...prev]);
    setActivePackId(newPack.id);
  };

  const updateStudyPack = (id, updatedFields) => {
    setStudyPacks((prev) =>
      prev.map((pack) => (pack.id === id ? { ...pack, ...updatedFields } : pack))
    );
  };

  const deleteStudyPack = (id) => {
    setStudyPacks((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activePackId === id && filtered.length > 0) {
        setActivePackId(filtered[0].id);
      }
      return filtered;
    });
  };

  const recordQuizScore = (packId, scoreResult) => {
    setStudyPacks((prev) =>
      prev.map((pack) => {
        if (pack.id === packId) {
          return {
            ...pack,
            lastQuizScore: scoreResult,
          };
        }
        return pack;
      })
    );
  };

  const updateSettings = (partialSettings) => {
    setSettings((prev) => ({ ...prev, ...partialSettings }));
  };

  // Aggregated Stats
  const totalPacks = studyPacks.length;
  const attemptedPacks = studyPacks.filter((p) => p.lastQuizScore);
  const totalQuizzesAttempted = attemptedPacks.length;
  const avgQuizScore =
    totalQuizzesAttempted > 0
      ? Math.round(
          attemptedPacks.reduce((acc, curr) => acc + (curr.lastQuizScore?.percentage || 0), 0) /
            totalQuizzesAttempted
        )
      : 85;

  const totalWords = studyPacks.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
  const hoursSaved = (totalWords / 250 / 60 * 3.5).toFixed(1); // Reading + manual note-making factor

  return (
    <StudyPackContext.Provider
      value={{
        studyPacks,
        activePackId,
        setActivePackId,
        activePack,
        addStudyPack,
        updateStudyPack,
        deleteStudyPack,
        recordQuizScore,
        backendHealth,
        backendStatus,
        healthError,
        refreshHealth,
        settings,
        updateSettings,
        stats: {
          totalPacks,
          totalQuizzesAttempted,
          avgQuizScore,
          hoursSaved,
          totalWords,
        },
      }}
    >
      {children}
    </StudyPackContext.Provider>
  );
}

export function useStudyPack() {
  const context = useContext(StudyPackContext);
  if (!context) {
    throw new Error('useStudyPack must be used within a StudyPackProvider');
  }
  return context;
}
